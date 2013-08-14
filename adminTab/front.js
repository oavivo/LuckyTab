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
		eventXHR.open("GET", "http://poshfeed.com/addClickStat", true);
		eventXHR.onreadystatechange = function() {
			if (eventXHR.readyState == 4) {
				console.log(xhr.responseText);
			}
		}
	eventXHR.send();
	setTimeout(function(){window.location.href = redirectURL},200);
}


function deleteItem(){
    console.log("Deleting item from bucketList...");
    var deleteXHR = new XMLHttpRequest();
    deleteXHR.open("GET", "http://poshfeed.com/removeItemFromReview", true);
    deleteXHR.onreadystatechange = function() {
        if (deleteXHR.readyState == 4) {
            console.log(deleteXHR.responseText);
        }
    }
    deleteXHR.send();
    $("#adminStrip").css("display","none");
    
}


function approveItem(value){
    value = JSON.parse(value);
    var sendUrl = 'http://poshfeed.com/setCategoryKey?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
    var title = encodeURIComponent(value.title.replace(/\"/g,'%22'));
    var desc = encodeURIComponent(value.desc.replace(/\"/g,'\%22'));
    var url = encodeURIComponent(value.url.replace(/\"/g,'%22'));
    var source = encodeURIComponent(value.source.replace(/\"/g,'%22'));
    var image = encodeURIComponent(value.image.replace(/\"/g,'%22'));
    var category = encodeURIComponent(value.category.replace(/\"/g,'%22'))

    sendUrl = sendUrl.format(title,desc,url,source,image,category);

    var approveXHR = new XMLHttpRequest();
    approveXHR.open("GET", sendUrl, true);
    approveXHR.onreadystatechange = function() {
        if (approveXHR.readyState == 4) {
            console.log(approveXHR.responseText);
            deleteItem();

        }
    }
    approveXHR.send();
}


function getContent(cats){
    $("#adminStrip,#adminModeIndicator").remove();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://poshfeed.com/getCategoryKey?categories="+cats, true);
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
            $("#pageSource").html("From: "+responseObj.source).css("display","");

        }
    }
    xhr.send();
}

function getReviewItem(cats){
    var reviewXHR = new XMLHttpRequest();
    reviewXHR.open("GET", "http://poshfeed.com/getKeyForReview", true);
    reviewXHR.onreadystatechange = function() {
        if (reviewXHR.readyState == 4) {
			if(reviewXHR.responseText != "" && reviewXHR.responseText != "null"){
				$("#adminStrip").css("display","block");
				var responseObj = JSON.parse(reviewXHR.responseText);
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
				//var catDisplayName = $.inArray('food', PFcategoryList) > -1; // left this in the middle
				//console.log(catDisplayName);
				$("#pageSource").html("From: "+responseObj.source).css("display","");
				$("#adminJsonDisplay").html(reviewXHR.responseText).focus(function(){$(".adminButtons").addClass("noOpacity")}).blur(function(){$(".adminButtons").removeClass("noOpacity")});
				$("#approveArticle").one("click",function(){approveItem(reviewXHR.responseText)});
				$("#declineArticle").one("click",function(){deleteItem()});
			}else{
				getContent(cats);
			}
		}
    }
    reviewXHR.send();
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
    getReviewItem(data);
});


// google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43001046-1']);
_gaq.push(['_trackPageview']);
 
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
