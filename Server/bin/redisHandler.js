redisLib = require(__dirname + "/node_modules/redis");

exports.setKey = function(key,value,cb){
    client = redisLib.createClient();
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
exports.getKey = function(key,cb){
    client = redisLib.createClient();
    client.send_command("RANDOMKEY", [], function(err, result) {
        console.log(result);
        client.get(result,function(err, reply) {
            if(reply != null){
                console.log(reply);
                cb(reply.toString());
            }else{
                console.log(err);
                cb("Key doesn't exist");
            }
            client.quit();
        })
    });
};
