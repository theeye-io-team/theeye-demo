"use strict";

var connect = require('connect');
var http = require('http');
var url = require('url');
var debug = require('debug')('theeye');
var fs = require('fs');
var childProcess = require('child_process');

var app = connect();

/**
 *
 *
 * scraper test
 *
 *
 */
var scraper = 'success';
app.use('/scraper',function(req,res){
  if (req.method==='PUT') {
    var query = url.parse(req.url,true).query;
    debug('scraper value updated %j', query);
    scraper = query;
  } else {
    debug('scraper value requested');
  }
  res.end(JSON.stringify(scraper));
});

/**
 *
 *
 * process test
 *
 *
 */
var children = [];
app.use('/process',function(req,res){
  var query = url.parse(req.url,true).query,
    child,
    name = query.name,
    delay = query.delay||(10*1000),
    data = query.data||'timestamp';

  debug('process query %j', query);

  if (!query.name) {
    return res.end(
      JSON.stringify(
        children.map(c => { return {
          id: c.id,
          name: c.name,
          delay: c.delay,
          data: c.data 
        } })
      )
    );
  }

  if (req.method==='POST') {
    debug('creating process %s', name);
    var p = {
      name: name,
      delay: delay,
      data: data
    };

    // order is important
    var args = [name,delay,data];

    p.id = children.push(p) - 1 ;
    p.process = childProcess.fork(process.cwd() + '/process_monitor',args,{
      env: { DEBUG: 'theeye:child*' }
    });
    return res.end('ok');
  } else {
    child = children.find(p => p.name===name);

    if (!child) return res.end('sorry, I don\'t have any registered process with the name "' + name + '"');

    var out = JSON.stringify({ id: child.id, name: child.name });
    if (req.method==='GET') {
      return res.end(out);
    }
    else if (req.method==='DELETE') {
      child.process.send('end');
      children.splice(child.id,1);
      return res.end(out);
    }
  }
});


// respond to all requests
app.use(function(req, res){
  var message = fs.readFileSync('message.html');
  res.end(message);
});

//create node.js http server and listen on port
http.createServer(app).listen(3000);

debug('TheEye monitors test started');
debug('listening on port 3000');
