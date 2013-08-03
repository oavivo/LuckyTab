url = require('url');
http = require('http');
format = require('util').format;
var express = require('express');
var app = express();
redisHandler = require(__dirname + "/bin/redisHandler.js");
fs = require('fs');


app.get('/getKey', function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
	redisHandler.getKey(callback);
})

app.get('/setKey', function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
	var url_parts = url.parse(req.url,true);
	redisHandler.setKey(url_parts.query.value,callback);
})

app.get('/insertKey', function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    
	res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
	var url_parts = url.parse(req.url,true);
	var pageTitle = url_parts.query.pageTitle || "";
	var pageURL = url_parts.query.pageURL || "";
	var pageSource = url_parts.query.pageSource || "";
	fs.readFile(__dirname+"/bin/iframe.html","utf-8", function read(err, data) {				
		var returnHTML = format(data,pageTitle,pageURL,pageSource);		
		callback(returnHTML);
	})	
})

app.get('/bin/*.js', function(req, res){
	var callback = function(data){res.write(data);res.end()};
	var url_parts = url.parse(req.url,true);
	fs.readFile(__dirname+url_parts.pathname,"utf-8", function read(err, data) {	
		callback(data,res);
	});
})


/*

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
            redisHandler.getKey(callback);
            break;
        }
        case "/setKey":{
            redisHandler.setKey(url_parts.query.value,callback);
            break;
        }
		// Editing UI
		case "/insertKey":{
			res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'}});
			var pageTitle = url_parts.query.pageTitle || "";
			var pageURL = url_parts.query.pageURL || "";
			var pageSource = url_parts.query.pageSource || "";
			
			var html = '<html><head> <!-- No title and meta tags are necessary for the extension --><script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script><script src="scripts/scripts.js"></script><style>body {width: 400px;height: 450px;font-family: arial, sans-serif;font-size: 13px;color: #333;}input[type=text], textarea {width: 390px;padding: 2px;display: block;}.comment {font-size: 12px;color: #666;}</style></head><body><p><label for="url">Category</label><select name="" id="pageCategory"><option value="">Category...</option><option value="">Food</option><option value="">Art &amp; Design</option><option value="">Gadgets</option><option value="">Tech News</option><option value="">Arts &amp; Crafts</option><option value="">Autos</option><option value="">Fashion</option><option value="">Music</option><option value="">Science</option><option value="">Humor</option><option value="">Lifestyle</option></select></p><p><label for="url">Page URL</label><input type="text" value="'+pageURL+'" id="pageURL" placeholder="Insert URL" /></p><p><label for="url">Title</label><input type="text" value="'+pageTitle+'" id="pageTitle" placeholder="Article title" /></p><p><label for="url">Description</label><textarea type="text" id="pageDesc" value="" placeholder="(Optional, but great!)"></textarea></p><p><label for="url">Image URL</label><input type="text" value="" id="pageImage" placeholder="Insert URL" /></p><p><label for="url">Source</label><input type="text" value="'+pageSource+'" id="pageSource" placeholder="e.g The Verge" /></p><p><label for="url">Timeless?</label><input id="isTimeless" type="checkbox" /></p><a id="sendForm" href="javascript:void(0)">Send</a> or <a href="javascript:void(0)">cancel</a><div id="content"><!--<p><span class="comment"><strong>YOUTUBE THUMBNAIL:</strong><br /><i>http://img.youtube.com/vi/VIDEO_ID_HERE/maxresdefault.jpg</i></span><br /><span class="comment"><strong>VIMEO THUMBNAIL:</strong><br /><i>inspect, get the image url</i></span></p>--></div></body></html>';
			callback(html);	
			break;
		}
		// Handle script fetching
		case "/scripts/scripts.js":{
			res.writeHead(200, {'Content-Type': 'application/javascript');			
			fs.readFile(__dirname+url_parts.path, function read(err, data) {
				if (err) {
					throw err;
				}
				callback(data);				
			});
			break;
		}
        default:
			res.writeHead(404, {'Content-Type': 'text/html'});			
            callback("404 - File not found");
            break;
    }

}).listen(80);

*/


app.listen(80);
console.log("Started on port 80");
