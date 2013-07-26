#! /usr/bin/env node

var mkdirp = require('mkdirp')
var fs = require('fs')
var async = require('async')
var Path = require('path')
var rimraf = require('rimraf')
var browserify = require('./browserify_it')
var rootDir = process.cwd()
var buildDir = Path.join(rootDir, 'build')

function build(topLevelCallback){

  function traverseDir(path, want, visit, callback){
    fs.readdir(path, function(err, names){
      async.eachLimit(names, 100, function(name, next){
        var newpath = Path.join(path, name)
        fs.stat(newpath, function(err, stat){
          if (err){
            console.error(err)
            next()
            return
          }
          if (!want(newpath, stat)){
            next()
            return
          }
          visit(newpath, stat, function(){
            if (stat.isDirectory()){
              traverseDir(newpath, want, visit, next)
            }else{
              next()
            }
          })
        })
      }, callback)
    })
  }

  fs.exists(buildDir, function(yes){
    if (yes){
      rimraf(buildDir, function(err){
        if (err) console.error(err)
        doit()
      })
    }else{
      doit()
    }
  })

  function doit(){
    mkdirp(buildDir, function(err){
      if (err){
        console.error(err)
        return process.exit(1)
      }
      traverseDir(rootDir, function(path){
        var relpath = Path.relative(rootDir, path)
        if (relpath.match(/node_modules/)) return false
        if (Path.basename(path)[0] === '.') return false
        if (relpath === 'build') return false
        return true
      }, function(path, stat, next){
        var relpath = Path.relative(rootDir, path)
        if (stat.isFile()){
          var dst = Path.join(buildDir, relpath)
          //console.log('Wrote ' + dst)
          var ext = Path.extname(path)
          if (ext === '.js'){
            browserify(rootDir, path, function(err, src){
              if (err) {
                console.error('Error while trying to browserify ' + relpath + ':\n' + err.message)
                process.exit(1)
              }
              fs.writeFile(dst, src, next)
            })
          }else{
            fs.createReadStream(path).pipe(
              fs.createWriteStream(dst))
            next()
          }
          
        }else if (stat.isDirectory()){
          var newdir = Path.join(buildDir, relpath)
          mkdirp(newdir, function(err){
            next(err)
          })
        }
      }, topLevelCallback)
    })
  }
}

module.exports = build