function getTopSites(callbackfunc) {
    chrome.topSites.get(function(url_list) {
        for (var i=0;i<url_list.length;i++) {callbackfunc(url_list[i]);}
    });
}
getTopSites(function(url){
	var thumbnailUrl = 'chrome://favicon/size/16@1x/' + url.url;
	$('#mostVisited ul').append("<li><a style='background:url("+thumbnailUrl+") no-repeat 2px 2px' href='"+url.url+"'>"+url.title+"</a></li>");
});
//DOM ready
var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://82.196.3.219/getKey", true);
		xhr.onreadystatechange = function() {			
  		if (xhr.readyState == 4) { 
  			console.log(xhr.responseText);   		
    		var responseObj = JSON.parse(xhr.responseText);
    		$("body").css("background-image","url("+responseObj.image+")");
    		$("#pageTitle").html(responseObj.title).attr("href",responseObj.url).css("display","block");	
			if (responseObj.desc) {$("#pageDesc").html(responseObj.desc).css("display","block");} //show only if description available
			$("#readPage").attr("href",responseObj.url).css("display","inline");
			$("#pageSource").html("From: "+responseObj.source).css("display","block");
  		}
	}
xhr.send();


