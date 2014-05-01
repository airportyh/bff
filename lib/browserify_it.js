var browserify = require('browserify')
var Set = require('Set')
var Path = require('path')
var debug = require('debug')('browserify_it')
function getDeps(rootDir, pth, callback){
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
  b.on('dep', function(file){
    for (var dep in file.deps){
      deps.add(dep)
    }
  })
  b.on('error', function(e){
    callback(e)
  })

  function depPath(rootDir, path){
    var relpath = Path.relative(rootDir, path)
    return './' + relpath.match(/^(.+)(?:\.js)?$/)[1]
  }
}

function isModule(rootDir, dep){
  var relpath = Path.relative(rootDir, dep.id)
  //debug('isModule', dep.id, 'relpath', relpath)
  return relpath.substring(0, 12) === 'node_modules'
}

function browserifyIt(rootDir, path, callback){
  getDeps(rootDir, path, function(err, deps){
    if (err){
      callback(err)
      return
    }
    debug('deps:', deps)
    var b = browserify()
    b.add(path)
    deps.forEach(function(dep){
      b.require(dep)
    })
    b.bundle({
      debug: true,
      detectGlobals: false
    }, callback)
    b.on('error', function(e){
      callback(e)
    })
  })
}

module.exports = browserifyIt