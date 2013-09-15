redisLib = require(__dirname + "/node_modules/redis");
_ = require(__dirname + "/node_modules/underscore");
async = require(__dirname + "/node_modules/async");
redisHandlerObj = this;

String.prototype.hashCode = function(){
    var hash = 0, i, character;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        character = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
Array.prototype.removeItem = function(el){
	var elementLocation = this.indexOf(el);
	if(elementLocation != -1) return this.splice(elementLocation, 1);
}

this.getCategoryKey = function(cats,cb){    
	client = redisLib.createClient();
	var responseArray = [];	
		
	function getKeyFromList(i,callback){		
		client.lrange( i, 0, -1,function(err,reply){
			responseArray.push(reply);								
			callback(null,reply);
		});
	}	
	async.each(cats,getKeyFromList,function(err){
		var pureResult = _.uniq(_.flatten(responseArray));
		var randItem = Math.floor(Math.random()*pureResult.length);				
		cb(JSON.parse("{"+pureResult[randItem]+"}"));
	});	
	client.quit();			
	
};

exports.getCategoryKey = this.getCategoryKey;


exports.getSharedItem = function(itemId,cb){
	client = redisLib.createClient();
	client.get(itemId,function(err,reply){
			if(reply != null){
				cb(JSON.parse("{"+reply+"}"));	
			}else{
				cats = ["art","cool","fashion","food","geeky","intelectual","music"];				
				redisHandlerObj.getCategoryKey(cats,cb);	
			}
		
	});	
	client.quit();
};

exports.shareURL = function(value,cb){
	parsedValue = JSON.parse("{"+value+"}");
	var parsedURL = parsedValue.url.hashCode();
	client = redisLib.createClient();
	client.exists(parsedURL,function(err,reply){		
		if (reply != 1){
			client.set(parsedURL,value,function(err,reply){											
				cb(parsedURL.toString());
				client.quit();				
			});
		}else{				
			cb(parsedURL.toString());
			client.quit();			
		}
	});		
};

exports.setAuthKeyForReview = function(value,cb,authKey){
	function saveKeyInBucket(){
		client = redisLib.createClient();
		client.lpush("reviewBucket", value,function(err, reply){
			if(err == null){			
				console.log("added to reviewBucket - authenticated");
				cb("added to reviewBucket");												
			}else{
				console.log("error saving AuthKeyForReview" +err);
				cb("error saving reviewBucket");							
			}        
		});	
		client.quit();
	}
	fs.readFile('/var/luckytab/bin/auth/users.json',"utf-8", function read(err, data) {		
		data = JSON.parse(data);
		var keysLength = Object.keys(data.users).length; 
		for(user in data.users){
			if(authKey == data.users[user]){
				saveKeyInBucket();
				return;
			}
			keysLength--;
			if(keysLength == 0){
				cb("unautherized user");
			}
		}
	});	
}

exports.setKeyForReview = function(value,cb){	
	client = redisLib.createClient();
	client.lpush("reviewBucket", value,function(err, reply){
		if(err == null){						
			cb("added an item "+value+" to reviewBucket");												
		}else{
			console.log("error saving KeyForReview"+err);
			cb("error saving reviewBucket");							
		}        
	});	
	client.quit();
}

exports.getKeyForReview = function(cb){
	client = redisLib.createClient();
	client.lindex("reviewBucket",0,function(err,reply){		
		console.log(reply);
		if(err == null){
				if (reply != null){					
					cb(JSON.parse("{"+reply+"}"));
				}else{
					cb(null);
				}
					
			}else{				
				console.log("error getKeyForReview"+err);
				client.quit();				
				cb(null);
			}		
	})
	client.quit();
}

exports.getOmniKey = function(cb){
    client = redisLib.createClient();
	catName = "masterList";
	console.log("getOmniKey");
	client.llen(catName, function(err, result) {					
		var randItem = Math.floor(Math.random()*result);						
		client.lindex(catName,randItem,function(err, reply){
			if(err == null){
				if (reply != null)	cb(JSON.parse("{"+reply+"}"));			
			}else{
				console.log("error getOmniKey"+err);						
			}
			client.quit();
		})		
	});		
};




exports.getSpecificKey = function(cat,index,cb){    
	client = redisLib.createClient();			
    client.lindex(cat,index,function(err, reply){
			if(err == null){
				if (reply != null)	cb(JSON.parse("{"+reply+"}"));
			}else{
				console.log("error getSpecificKey"+err);							
			}
	})
	client.quit();				
};

exports.removeItemFromReview = function(cb){
	client = redisLib.createClient();			
    client.lpop("reviewBucket",function(err, reply){
			if(err == null){
				if (reply != null){
					cb(JSON.parse("{"+reply+"}"));
					
				}
			}else{
				console.log("removeItemFromReview"+err);							
			}
	})
	client.quit();
}


exports.setCategoryKey = function(value,cb){
	
	var replyJson = "{"+value+"}";		
	replyJson = JSON.parse(replyJson);	
	var extractTitle = replyJson.title;	
	var extractURL = replyJson.url;	
	var urlNoProtocol = extractURL.replace(/^https?\:\/\//i, "");    
	// Decode special char "
	var categories = (replyJson.category).split(",");
	var value = value.replace(/\%22/g,'\\\"');	

	
	for(var i = 0;i < categories.length;i++){	
		client = redisLib.createClient();			
		client.lpush(categories[i], value,function(err, reply){cb(categories[i]+" added an item "+value);});
		client.ltrim(categories[i], 0 , 49, function(err,reply){});		
		client.quit();
	}
}

exports.setRecentlyClickedList = function(value,cb){
	console.log(value);
	client = redisLib.createClient();		
	var replyJson = "{"+value+"}";	   
	client.lpush("recentlyClicked", value,function(err, reply){
        if(err == null){			
            cb("recentlyClicked"+" added an item "+value);
        }else{
            console.log("error setRecentlyClicked"+err);
            cb("error saving in list"+ "recentlyClicked");
        }
        client.quit();
    });
}