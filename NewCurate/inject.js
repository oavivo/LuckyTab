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
        	"top":"10px",
        	"right":"10px",
        	"background": "white",
			"height": "476px",
			"width": "440px",
			"border":"1px solid black",
			"border-radius":"10px",
			"z-index":"9999999999999"
        }).appendTo('body');
      	sendResponse({result: "success"});
     }
     if (request.type == "luckyCloseIframe"){
     	$("#luckyTabCurate").remove();
     	sendResponse({result: "iframe removed"});
     }
});
