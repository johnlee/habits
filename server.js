'use strict';
var fs = require('fs');
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });

  fs.readFile('./habits.htm', function (err, data) {
    if (err) {
      res.end('Error loading index.html file');
    } else {
      res.end(data);
    }
  });
}).listen(port);
