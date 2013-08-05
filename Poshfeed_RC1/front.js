function getTopSites(callbackfunc) {
    chrome.topSites.get(function(url_list) {
        for (var i=0;i<url_list.length;i++) {callbackfunc(url_list[i]);}
    });
}
getTopSites(function(url){
	var thumbnailUrl = 'chrome://favicon/' + url.url;
	$('#mostVisited ul').append("<li><a style='background:url("+thumbnailUrl+") no-repeat 2px 2px' href='"+url.url+"'>"+url.title+"</a></li>");
});

function fireClickEvent(redirectURL){
	var eventXHR = new XMLHttpRequest();
		eventXHR.open("GET", "http://82.196.3.219/addClickStat", true);
		eventXHR.onreadystatechange = function() {
			if (eventXHR.readyState == 4) {
				console.log(xhr.responseText);
			}
		}	
	eventXHR.send();
	setTimeout(function(){window.location.href = redirectURL},200);
}

function getContent(cats){
	var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://82.196.3.219/getCategoryKey?categories="+cats, true);
			xhr.onreadystatechange = function() {			
	  		if (xhr.readyState == 4) {  			 		
	    		var responseObj = JSON.parse(xhr.responseText);    		
	    		window.returnedJson = responseObj;
	    		$("body").css("background-image","url("+responseObj.image+")");
	    		$("#pageTitle").html(responseObj.title).attr("href",responseObj.url).css("display","block").click(function(e){
	    			e.preventDefault();
	    			fireClickEvent(responseObj.url);    			    			
	    		});	
				if (responseObj.desc) {$("#pageDesc").html(responseObj.desc).attr("href",responseObj.url).css("display","block").click(function(e){
	    			e.preventDefault();
	    			fireClickEvent(responseObj.url);    			    			
	    		});	
	    		} //show only if description available
				$("#readPage").attr("href",responseObj.url).css("display","inline").click(function(e){
	    			e.preventDefault();
	    			fireClickEvent(responseObj.url);    			    			
	    		});
				$("#pageSource").html("From: "+responseObj.source).css("display","block");
	  		}
		}
	xhr.send();
}



