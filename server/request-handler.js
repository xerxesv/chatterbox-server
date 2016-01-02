/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var exports = module.exports = {};
var fs = require('fs');
var path = require('../node_modules/path/path');


var getResponseType = function(fileName) {
  var pattern = /[^.][^.]*$/g;
  var extension = fileName.match(pattern)[0].toString();
  if(extension === 'js') {
    return 'application/javascript';
  }
  if(extension === 'css') {
    return 'text/css';
  }
  if(extension === 'gif') {
    return 'image/gif';
  }
  if(extension === 'html') {
    return 'text/html';
  }
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/
   
    // Do some basic logging.
    //
    // Adding more logging to your server can be an easy way to get passive
    // debugging help, but you should always be careful about leaving stray
    // console.logs in your code.
    console.log("Serving request type " + request.method + " for url " + request.url);

    // The outgoing status.
    var statusCode = 200;

    // See the note below about CORS headers.
    var headers = defaultCorsHeaders;

    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    //headers['Content-Type'] = "text/plain";
    if(request.url.slice(0,8) === '/classes') {
      headers['Content-Type'] = 'application/json';
      if(request.method === 'GET') {
        response.writeHead(statusCode, headers);
        var chats = '';
        fs.readFile('data.json', function(err, content) {
          chats = "'[" + content + "]'";
          response.end(chats);
          console.log("response sent: " + chats); 
        });
 
      } else if(request.method === 'POST'){
          request.on('data', function(chunk) {
            
            var data = JSON.parse(chunk.toString());
            data.objectId = new Date();
            data.objectId = JSON.stringify(data.objectId);
//            messages.results.unshift(data);
            var stringifiedData = JSON.stringify(data);
            fs.exists('data.json', function(exists){
              if(exists){
                fs.appendFile('data.json', "," + stringifiedData, function(err){
                  if (err) {
                    console.log('error!');
                  } else{
                  console.log('appending to file successful');
                  }
                });
              } else {
                fs.writeFile('data.json', stringifiedData, function(err) {
                  if(err) {
                    console.log(err);
                  }else {
                    console.log('adding to file successful');

                  }
                });
              }
            });

          });
        var statusCode = 201;
        response.writeHead(statusCode);
        response.end("post successful");
      } else {
        response.end("good job");
      }
    } else {
      var pattern = /[^?]*/g;
      var noQuestionMarkURL = request.url.match(pattern)[0].toString();  

      var filePath = './client' + noQuestionMarkURL;
      if(filePath === './client/') {
        filePath = './client/index.html';
      }
      var contentType = getResponseType(filePath);
      fs.exists(filePath, function(exists) {
        if(exists) {
          fs.readFile(filePath, function(error, html) {
            if(error) {
              headers['Content-Type'] = "text/html";
              response.writeHead(500);
              response.end('Cannot read file');
            } else {
              headers['Content-Type'] = contentType;
              response.writeHead(200, headers);
              response.end(html);
            }
          });
        } else {
          headers['Content-Type'] = "text/html";
          response.writeHead(404, headers);
          response.end('File not found');
        }
      });
          
    }

};

//var messages = {results: []}

messageNum = 0;

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

/**ADDED*/

module.exports.requestHandler = requestHandler;
module.exports.defaultCorsHeaders = defaultCorsHeaders;