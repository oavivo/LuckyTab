// Startup sequence - URL, HTTP and Express
url = require('url');
http = require('http');
http.globalAgent.maxSockets = 5000;
var express = require('express');
var app = express();

// Core modules
redisHandler = require(__dirname + "/bin/redisHandler.js");
StatsManager = require(__dirname + "/bin/statsManager.js");
nodeMailer = require(__dirname + "/node_modules/nodemailer");

// Support functions
querystring = require('querystring');
request = require('request');
_ = require(__dirname + "/bin/node_modules/underscore");
format = require('util').format;

// Cache our HTML templates
fs = require('fs');
var tabTemplate = fs.readFileSync(__dirname+"/assets/templates/front.html","utf-8");
var homePageTemplate = fs.readFileSync(__dirname+"/assets/templates/index.html","utf-8");
var legalTemplate = fs.readFileSync(__dirname+"/assets/templates/legal.html","utf-8");

// Init StatsMan
sm = new StatsManager();

app.get('/shareURL',function(req,res){
	var url_parts = url.parse(req.url,true);
	var callback = function(data){		
		res.redirect("http://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("http://poshfeed.com/articles/"+data));		
	}	
	redisHandler.shareURL(url_parts.query.value,callback);	
});

app.get('/articles/:aid',function(req,res){
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    
	res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
	callback = function(item){		
		_.templateSettings = {
			interpolate: /\{\{(.+?)\}\}/g
		};
		var html = _.template(tabTemplate);	
		var desc = "";
		if(item.desc != null && item.desc != ""){
			desc = '<a href="#" id="pageDesc" class="articleDesc">'+item.desc+'</a><br /><br />';
		}
		var outputHtml = html({
			"title":item.title,
			"source":item.source,
			"desc": desc,
			"image":item.image,
			"itemDesc":item.desc,
			"fullItem":JSON.stringify(item)
		})
		res.write(outputHtml);
		res.end();
	}
	redisHandler.getSharedItem(req.params.aid,callback);
});

app.get('/articles',function(req,res){
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    
	res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
	cats = ["art","cool","fashion","food","geeky","intelectual","music"];	
	callback = function(item){		
		_.templateSettings = {
			interpolate: /\{\{(.+?)\}\}/g
		};
		var html = _.template(tabTemplate);	
		var desc = "";
		if(item.desc != null && item.desc != ""){
			desc = '<a href="#" id="pageDesc" class="articleDesc">'+item.desc+'</a><br /><br />';
		}
		var outputHtml = html({
			"title":item.title,
			"source":item.source,
			"desc": desc,
			"image":item.image,
			"itemDesc":item.desc,
			"fullItem":JSON.stringify(item)
		})
		res.write(outputHtml);
		res.end();
	}
	redisHandler.getCategoryKey(cats,callback);
});

app.get('/oauth2callback',function(req,res){			
	var url_parts = url.parse(req.url,true);	
	function callback(data){
		if(url_parts.query.state == "getPermissions"){
			res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
			res.write("<html><head></head><body><p>Authentication succsesful. redirecting...</p><script type='text/javascript'>window.close();</script></body></html>");
			res.end();
		}else{
			res.write(data);
			res.end();
		}
	}
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});	
	var token_request = querystring.stringify({  
			"code" : url_parts.query.code,
			"client_id" : "880521421279.apps.googleusercontent.com",
			"client_secret" : "NKSk-aAN4Wc0-qqXyegda1Rc",
			"grant_type" : "authorization_code",	
			"redirect_uri" : "http://poshfeed.com/oauth2callback"
		});  
	var request_length = token_request.length;
	
	function updateUserToken(oldData,email,token){
		oldData.users[email] = token;		
		fs.writeFile(__dirname+'/bin/auth/users.json', JSON.stringify(oldData), function(err) {
			if(err) {
				console.log(err);
			} else {
				
			}
		});		
	}
	
	request(
        { method: 'POST',
          headers: {'Content-length': request_length, 'Content-type':'application/x-www-form-urlencoded'},
          uri:'https://accounts.google.com/o/oauth2/token',
          body: token_request
        },
        function (error, response, body) {
            if(response.statusCode == 200){
				var resBody = JSON.parse(body);
				var getEmailURL = "https://www.googleapis.com/oauth2/v1/userinfo?access_token="+resBody.access_token;				
				request.get(getEmailURL,function(err,res,body){					
					var finalBody = JSON.parse(body);
					var userEmail = finalBody.email;					
					fs.readFile(__dirname+'/bin/auth/users.json',"utf-8", function read(err, data) {							
						data = JSON.parse(data);
						var keysLength = Object.keys(data.users).length; 						
						for(user in data.users){							
							if(user == userEmail){								
								updateUserToken(data,user,url_parts.query.state);
								callback(url_parts.query.state);
								return true;
							}
							keysLength--;
							if(keysLength <= 0){
								console.log("unknown user");
								callback("unknown_user");
							}
						}						
					});	
				})                
            }
            else {
                console.log('error: '+ response.statusCode);                
				callback("auth_error");
            }
        }
    );
});

app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null ) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();     
  }
})

app.get('/setKey',function(req,res){
	console.log("old setKey request");
	var url_parts = url.parse(req.url,true);
	console.log(url_parts);
	console.log(req);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write("depracated, please use setKeyForReview from now on");
	res.end();
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});	
})

app.get('/setKeyForReview',function(req,res){
	var callback = function(data){res.json(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
	var url_parts = url.parse(req.url,true);	
	redisHandler.setAuthKeyForReview(url_parts.query.value,callback,url_parts.query.authKey);	
})


app.get('/getKeyForReview', function(req, res){	
	var callback = function(data){res.json(data);res.end()};	
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    	
	redisHandler.getKeyForReview(callback);
})

app.get('/removeItemFromReview', function(req, res){		
	var callback = function(data){res.json(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    //res.writeHead(200, {'Content-Type': 'text/plain'});
	sm.addImpression();
	redisHandler.removeItemFromReview(callback);
})

app.get('/getKey', function(req, res){		
	var callback = function(data){res.json(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    //res.writeHead(200, {'Content-Type': 'text/plain'});
	sm.addImpression();
	redisHandler.getOmniKey(callback);
})
app.get('/sendContactForm', function(req,res){
	var cb = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
	var mailTransport = nodeMailer.createTransport("SMTP", {
		service: "Gmail",
		secureConnection: true, // use SSL
		port: 465, // port for secure SMTP
		auth: {
			user: "asafy3@gmail.com",
			pass: "Kapara69"
		}
	});
	var url_parts = url.parse(req.url,true);
	var emailTo = "asafy3@gmail.com,ohadaviv@gmail.com,ranshani@gmail.com";
	var emailSubject = "PoshFeed contact form";
	var emailText = url_parts.query.text;
	
	
	var mailOptions = {
		from: "poshFeed<donotreply@poshfeed.com>", // sender address
		to: emailTo,
		subject: emailSubject,
		html: emailText
	}
	mailTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
			cb(error.toString);
		}else{
			console.log(response.message);
			cb("Message sent: " + response.message);
		}
	})
    mailTransport.close();

	

})
app.get('/getSpecificKey', function(req, res){
	var callback = function(data){res.json(data);res.end()};
	var url_parts = url.parse(req.url,true);
	var index = url_parts.query.index;
	var cat = url_parts.query.category;	
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    	
	redisHandler.getSpecificKey(cat,index,callback);
});

app.get('/getCategoryKey', function(req, res){	
	var callback = function(data){res.json(data);res.end()};	
	var url_parts = url.parse(req.url,true);
	var cats = url_parts.query.categories;
	cats = cats.split(",");
	res.setTimeout(2000,function(){res.end("Timeout - 2 seconds")});  	
	if(url_parts.query.adminMode != "true"){					
		sm.addImpression();
	}
	redisHandler.getCategoryKey(cats,callback);
});


app.get('/addClickStat',function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
	res.writeHead(200, {'Content-Type': 'text/plain'});
	var url_parts = url.parse(req.url,true);
	redisHandler.setRecentlyClickedList(url_parts.query.value,callback);    
	sm.addClick();	
	
});

var auth = express.basicAuth('admin', 'LuckyLuke');

app.get('/getStats', auth, function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
	var currentStats = sm.getStats();
	res.write(JSON.stringify(currentStats));
	res.end();
});

app.get('/setCategoryKey', function(req, res){
	var callback = function(data){res.write(data);res.end()};
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});
    res.writeHead(200, {'Content-Type': 'text/plain'});
	var url_parts = url.parse(req.url,true);	
	redisHandler.setCategoryKey(url_parts.query.value,callback);
});

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/legal',function(req,res){
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    
	res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
	res.write(legalTemplate);
	res.end();
});



app.get('/', function(req,res){
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    
	res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
	res.write(homePageTemplate);
	res.end();
});
app.get('/*.html',function(req,res){
	res.setTimeout(5000,function(){res.end("Timeout - 5 seconds")});    	
	var callback = function(data){res.write(data);res.end()};
	var url_parts = url.parse(req.url,true);	
	fs.readFile(__dirname+"/assets/templates/"+url_parts.path,"utf-8", function read(err, data) {			
		if(err == null){
			res.writeHead(200, {'Content-Type': 'text/html','Content-Encoding':'utf-8'});
			callback(data);
		}else{
			res.redirect("http://poshfeed.com/");
		}		
	});	
})


app.listen(80);
console.log("Started on port 80");
