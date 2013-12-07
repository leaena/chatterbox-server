/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var chatMessages = [];
var fs = require('fs');
var http = require("http");
var path = require('path')
var mime = {
  ".js" : 'text/javascript',
  ".css" : 'text/css'
}
var data = require('./data.txt')

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  var statusCode = 200;
  var urlParse = url.parse(request.url);
  var postData = "";
  var requestMethod = request.method

  if (urlParse.pathname.indexOf('/classes') !== -1){
    fs.readFile('data.txt', 'utf8',function (err, data) {
      if (err) {
        return err;
      } else {
        data = JSON.parse(data);
        console.log(data);
        chatMessages = ;
      }
    });
    request.on('data', function(datum) {
      postData += datum;
      if (requestMethod === 'POST') {
        statusCode = 201;
        chatMessages.push(JSON.parse(postData));
      }

    });

    request.on('end', function() {
    });

    if(urlParse.pathname.indexOf('/classes') === -1){
      statusCode = 404;
    }

    /* Without this line, this server wouldn't work. See the note
     * below about CORS. */
    var headers = defaultCorsHeaders;

    headers['Content-Type'] = "text/plain";

    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);
    var stream = fs.createWriteStream("data.txt");
    stream.once('open', function(fd) {
      stream.write(JSON.stringify(chatMessages));
      stream.end();
    });
    /* Make sure to always call response.end() - Node will not send
     * anything back to the client until you do. The string you pass to
     * response.end() will be the body of the response - i.e. what shows
     * up in the browser.*/
    response.end(JSON.stringify(chatMessages));
  } else if (urlParse.pathname === "/") {

    fs.readFile('client/index.html', function (err, html) {
      if (err) {
          throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/html"});  // <-- HERE!
      response.write(html);
      response.end();
    });
  } else {
    var contentType = mime[path.extname(urlParse.pathname)];
    fs.readFile('client/' + urlParse.pathname, function (err, html) {
      if (err) {
          throw err;
      }
      response.writeHeader(200, {"Content-Type": contentType});  // <-- HERE!
      response.write(html);
      response.end();
    });
  }
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.handleRequest = handleRequest;