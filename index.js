
var http = require('http')
  , moment = require('moment')

module.exports = function(ziggy) {
  ziggy.on('message', handle) 

  function handle(user, channel, message) {
    var arg

    if(!(arg = command(message, '!npm '))) return

    fetchJSON('http://registry.npmjs.com/' + arg, main)

    function main(data) {
      if(data.error === 'not_found') {
        return say('Package ' + quoteize(arg) + ' does not exist.')
      }

      if(data.error) {
        return say('Error: ' + data.error)
      }

      if(data.time && data.time.unpublished) {
        return say('Package ' + quoteize(arg) + ' has been unpublished.')
      }

      var version = data['dist-tags'] && isString(data['dist-tags'].latest)
        ? data['dist-tags'].latest
        : '0.0.0'

      var author = data.author && isString(data.author.name)
        ? data.author.name
        : 'No author'

      var url = 'http://npm.im/' + arg

      var description = isString(data.description)
        ? data.description
        : 'No description'

      var modified = data.time && isString(data.time.modified)
        ? 'modified ' + moment(data.time.modified).fromNow()
        : 'Never modified'

      say([url, version, author, modified].join(' | '))
      say(description)
    }

    function say(str) {
      ziggy.say(channel, str)
    }
  }
}

function fetchJSON(url, callback) {
  http.get(url, function (stream) {
    var str = ''

    stream.on('data', function(chunk) {
      str += chunk
    })

    stream.on('end', function() {
      callback(JSON.parse(str))
    })

    stream.on('error', console.log.bind(console))
  })
}

function isString(str) {
  return typeof str === 'string'
}

function quoteize(str) {
  return '`' + str + '`'
}

function command(message, str) {
  return message.slice(0, str.length) === str && message.slice(str.length).trim()
    ? message.slice(str.length).trim()
    : false
}