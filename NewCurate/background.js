iframeOpen = false;

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if(!iframeOpen){
			var msgType = "luckyInjectIframe"
		}else{
			var msgType = "luckyCloseIframe"
		}		
  		chrome.tabs.sendMessage(tabs[0].id, {type: msgType ,tabURL: tabs[0].url,tabTitle: tabs[0].title}, function(response) {
    	 	if(response.result == "success"){
    	 		iframeOpen = true;
    	 	}else{
    	 		iframeOpen = false;
    	 	}
  });
});
});	
	

