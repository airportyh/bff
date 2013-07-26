#! /usr/bin/env node

var program = require('commander')
var server = require('./lib/server')
var build = require('./lib/build')

program
  .version(require(__dirname + '/package').version)

program
  .command('server')
  .description('Serve your site browerified on port 3000.')
  .action(function(){
    server()
    console.log('Serving contents on port 3000.')
  })

program
  .command('build')
  .description("Browserify your site and output into the 'build' directory.")
  .action(function(){
    build(function(){
      console.log('Successfully browserified your site in \'build\'.')
    })
  })

program
  .command('clean')
  .description("Remove the 'build' directory.")
  .action(function(){
    throw new Error('Not implemented yet.')
  })

program.parse(process.argv)