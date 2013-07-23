#! /usr/bin/env node

var http = require('http')
var ecstatic = require('ecstatic')
var browserify = require('browserify')
var path = require('path')
var Set = require('Set')

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
  getDeps(path, function(err, deps){
    if (err){
      respondWithError(resp, err)
      return
    }
    var b = browserify()
    b.add(path)
    deps.forEach(function(dep){
      b.require(dep)
    })
    b.bundle({
      debug: true,
      detectGlobals: false
    }, function(err, src){
      if (err){
        respondWithError(resp, err)
        return
      }
      resp.end(src)
    })
    b.on('error', function(e){
      respondWithError(resp, e)
    })
  })
}

function getDeps(pth, callback){
  var b = browserify()
  b.add(pth)
  b.bundle({
    detectGlobals: false
  }, function(err){
    if (err){
      callback(err)
    }else{
      callback(null, deps.toArray())
    }
  })
  var deps = new Set
  b.on('dep', function(dep){
    if (!isModule(dep)){
      var relpath = path.relative(rootDir, dep.id)
      deps.add('./' + relpath.match(/^(.+)\.js$/)[1])
      for (var d in dep.deps){
        deps.add(d)
      }
    }
  })
  b.on('error', function(e){
    callback(e)
  })
}

function isModule(dep){
  var relpath = path.relative(rootDir, dep.id)
  return relpath.substring(0, 12) === 'node_modules'
}

function respondWithError(resp, err){
  resp.end('console.error("' + String(err).replace(/\"/g, '\\"') + '")')
}

var port = 3000
server.listen(port)
console.log('Serving the contents of ' + rootDir + ' on port ' + port + '.')