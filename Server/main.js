url = require('url');
http = require('http');
format = require('util').format;
redisHandler = require(__dirname + "/bin/redisHandler.js");

http.createServer(function (req, res) {
    res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var url_parts = url.parse(req.url,true);
    function callback(response){
        res.write(response);
        res.end();
    }

    switch(url_parts.pathname){
        case "/getKey":{
            redisHandler.getKey(url_parts.query.key,callback);
            break;
        }
        case "/setKey":{
            redisHandler.setKey(url_parts.query.key,url_parts.query.value,callback);
            break;
        }
        default:
            callback("moshe");
            break;
    }

}).listen(80);

console.log("Started on port 80");
