var http = require('http')
var ecstatic = require('ecstatic')
var browserify = require('./browserify_it')

function server(){

  var rootDir = process.cwd()
  var server = http.createServer(function(req, resp){
    if (isJavascript(req)){
      serveScript(req, resp)
    }else{
      serveFile(req, resp)
    }
  })

  var serveFile = ecstatic({ root: rootDir })

  function isJavascript(req){
    var uri = req.url.split('?')[0]
    return !!uri.match(/\.js$/)
  }

  function serveScript(req, resp){
    resp.setHeader('Content-Type', 'text/javascript')
    var uri = req.url.split('?')[0]
    var path = '.' + uri
    browserify(rootDir, path, function(err, src){
      if (err){
        respondWithError(resp, err)
        return
      }
      resp.end(src)
    })
  }

  function respondWithError(resp, err){
    resp.end('console.error("' + String(err).replace(/\"/g, '\\"') + '")')
  }

  var port = 3000
  server.listen(port)

}

module.exports = server