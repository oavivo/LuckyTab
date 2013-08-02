redisLib = require(__dirname + "/node_modules/redis");

exports.setKey = function(value,cb){
    client = redisLib.createClient();	
	var replyJson = "{"+value+"}";
	replyJson = JSON.parse(replyJson);
	var extractTitle = replyJson.title;	
	var extractURL = replyJson.url;	
	var urlNoProtocol = extractURL.replace(/^https?\:\/\//i, "");
    var key = urlNoProtocol+"_"+Math.floor(Math.random()*1E8);
    client.set(key,value,function(err, reply){
        if(err == null){			
            cb(key+"saved successfully with value "+value);
        }else{
            console.log(err);
            cb("error saving key"+ key);
        }
        client.quit();
    });
};
exports.getKey = function(cb){
    client = redisLib.createClient();
    client.send_command("RANDOMKEY", [], function(err, result) {
		console.log(result);
		client.get(result,function(err, reply) {
        if(reply != null){
            console.log(reply);
            // cb(JSON.stringify(reply));
            cb("{"+reply+"}");
        }else{
            console.log(err);
            cb("Key doesn't exist");
        }
        client.quit();
		})
	});

    
};
