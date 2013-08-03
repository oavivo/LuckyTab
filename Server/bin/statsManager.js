fs = require('fs');

var StatsManager;

StatsManager = (function(){

	function StatsManager() {		
		var data = fs.readFileSync(__dirname+"/stats.json","utf-8");
		that = this;		
		this.data = JSON.parse(data);		
		this.currentData =  {};
		this.currentData.currentPV = parseInt(this.data.currentPV);	
		this.currentData.currentClicks = parseInt(this.data.currentClicks);
		
		this.updateInterval = setInterval(this.updateFile,30000);
		console.log(this.currentData);
		
	}
	
	StatsManager.prototype.updateFile = function(){	
		fs.writeFile(__dirname+"/stats.json", JSON.stringify(that.currentData), function(err) {
			if(err) {
				console.log(err);
			} else {
				//console.log("Stats updated");
			}
		});
	}
	
	StatsManager.prototype.getStats = function(){
		return that.currentData;
	}

	StatsManager.prototype.addClick = function() {
		this.currentData.currentClicks++;		
		return this.currentData.currentClicks;
	};
	
	StatsManager.prototype.addImpression = function() {
		this.currentData.currentPV++;
		return this.currentData.currentPV;
	};

	return StatsManager;	
	
})();


module.exports = StatsManager;
