var browserify = require('browserify')
var Set = require('Set')
var path = require('path')

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
  b.on('dep', function(dep){
    if (!isModule(rootDir, dep)){
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

function isModule(rootDir, dep){
  var relpath = path.relative(rootDir, dep.id)
  return relpath.substring(0, 12) === 'node_modules'
}

function browserifyIt(rootDir, path, callback){
  getDeps(rootDir, path, function(err, deps){
    if (err){
      callback(err)
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
    }, callback)
    b.on('error', function(e){
      callback(e)
    })
  })
}

module.exports = browserifyIt