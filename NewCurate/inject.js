if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function getDomain(url) {
	return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {  	 	
     if (request.type == "luckyInjectIframe"){
     	var fullURL = "http://82.196.3.219/insertKey?pageTitle={0}&pageURL={1}&pageSource={2}"; 
     	fullURL = fullURL.format(encodeURIComponent(request.tabTitle),encodeURIComponent(request.tabURL),encodeURIComponent(getDomain(request.tabURL)));    	      	
      	$('<iframe />');  // Create an iframe element
        $('<iframe />', {            
            id: 'luckyTabCurate',
            src: fullURL                                  
        }).css({
        	"position":"fixed",
        	"top":"0px",
        	"right":"0px",
        	"background": "#faf9f5",
			"height": "476px",
			"border": "0",
			"-webkit-border-radius": "0 0 0 0px",
			"width": "410px",
			"resize": "both",
			"overflow": "auto",
			"padding": "10px",
			"-webkit-box-shadow":"-5px 5px 10px rgba(0,0,0,.35)",
			"z-index":"9999999999999"
        }).appendTo('body');
      	sendResponse({result: "success"});
     }
     if (request.type == "luckyCloseIframe"){
     	$("#luckyTabCurate").remove();
     	sendResponse({result: "iframe removed"});
     }
});
