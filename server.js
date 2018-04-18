const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
let cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource is not found');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  // mime.lookup  renamed to getType from Version 2
  response.writeHead(200, {'Content-Type': mime.getType(path.basename(filePath))});
  response.end(fileContents);
}

// 访问内存(RAM)要比访问文件系统快得多，所以Node程序通常会把常用的数据缓存到内 存里。
function serverStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath])
  } else {
    fs.exists(absPath, function (exists) {
      if (exists) {
        fs.readFile(absPath, function (err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        })
      } else {
        send404(response);
      }
    })
  }
}

const server = http.createServer(function (requst, response) {
  let filePath = false;
  if (requst.url === '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + requst.url;
  }
  let absPath = './' + filePath;
  serverStatic(response, cache, absPath);
});

server.listen(4000, function () {
  console.log('listen on port 4000');
});

const chatServer = require('./lib/chart_server');
chatServer.listen(server);