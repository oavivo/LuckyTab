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
			xhr.open("GET", "http://poshfeed.com/getCategoryKey?categories="+cats, true);
			xhr.onreadystatechange = function() {			
	  		if (xhr.readyState == 4) {  
	  			window.rawPFresponse = xhr.responseText;			 		
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
	    		$("#sharePage").css("display","inline").click(function(e){
	    			value = responseObj;
	    			var sendUrl = 'http://poshfeed.com/shareURL?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
				    var title = encodeURIComponent(value.title.replace(/\"/g,'%22'));
				    var desc = encodeURIComponent(value.desc.replace(/\"/g,'\%22'));
				    var url = encodeURIComponent(value.url.replace(/\"/g,'%22'));
				    var source = encodeURIComponent(value.source.replace(/\"/g,'%22'));
				    var image = encodeURIComponent(value.image.replace(/\"/g,'%22'));
				    var category = encodeURIComponent(value.category.replace(/\"/g,'%22'))
				
				    sendUrl = sendUrl.format(title,desc,url,source,image,category);	    			
	    			e.preventDefault();
	    			window.open(
				      sendUrl, 
				      'share-poshfeed', 
				      'width=626,height=436'
				    );  			    			
	    		});
				$("#pageSource").html("From: "+responseObj.source).css("display","");
	  		}
		}
	xhr.send();
}
chrome.storage.sync.get("categories", function(data){	
	data = $(data.categories).toArray();
	var displayNameArray = [];
	for(var i=0;i < data.length ; i++){
        var catName = data[i];
		displayNameArray.push(categoriesObj[catName].display)
	}
	$('#currentCats').text(displayNameArray.join(', '));
	if(data.length == 0){
		var allCats = [];
		for(cat in categoriesObj){
			allCats.push(cat);			
		}
		data = allCats;
		chrome.storage.sync.set({'categories': allCats});
	}
	data = data.toString();	
	
	$('#optionsLink').attr('href',chrome.extension.getURL("options.html"));
	getContent(data);
});


//reload on mousewheel
function reloadPage(){document.location.reload()}


//document ready
$(document).ready(function(){
    $('body').bind('mousewheel', function(e){
	    e.stopPropagation();
        $('body').unbind('mousewheel');
        setTimeout(reloadPage, 300)
    });
});
