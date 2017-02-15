"use strict";

var args = process.argv;
var name = args[2];
var delay = args[3];
var input = args[4];

var fs = require('fs');
var debug = require('debug')('theeye:child:' + name);

debug(args);

process.title = 'theeye-child [' + args.slice(2).join(',') + ']';
debug('alive');

process.on('message', (m) => {
  if (m==='end') {
    process.exit();
  }
});
process.on('exit', (code) => debug('good bye!'));

var intervalID = setInterval(() => {
  var data = (input==='timestamp') ? Date.now() : input ;
  fs.appendFile('/tmp/theeye-' + name + '-process.log', data + "\n", error => {
    if (error) {
      debug(error);
    } else {
      debug('alive');
    }
  });
}, delay);
