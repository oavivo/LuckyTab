//GLOBAL VARS
var theCategories;
var theContent;
var poshArticleUrl;
var pageTitle;


//SUPPORT FUNCTIONS
	//string formatting
	if (!String.prototype.format) {String.prototype.format = function() {var args = arguments;return this.replace(/{(\d+)}/g, function(match, number) {return typeof args[number] != 'undefined'? args[number]: match;});};}
////////////////////////////////////////////////////////////////////////////////////////////////////	



function getArticleUrl(){
    var value = theContent;
    var sendUrl = 'http://poshfeed.com/getArticleURL?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
    var title = encodeURIComponent(value.title.replace(/\"/g,'%22'));
    pageTitle = unescape(title);
    var desc = encodeURIComponent(value.desc.replace(/\"/g,'\%22'));
    var url = encodeURIComponent(value.url.replace(/\"/g,'%22'));
    var source = encodeURIComponent(value.source.replace(/\"/g,'%22'));
    var image = encodeURIComponent(value.image.replace(/\"/g,'%22'));
    var category = encodeURIComponent(value.category.replace(/\"/g,'%22'))

    sendUrl = sendUrl.format(title,desc,url,source,image,category);
    $.ajax({
        dataType: "json",
        url: sendUrl,
        success: function(data){
            window.poshArticleUrl = data;
            poshArticleUrl = data;
            

            $('#likeIframeWrapper').append('<iframe src="http://www.facebook.com/plugins/like.php?href='+encodeURIComponent("http://poshfeed.com/articles/"+poshArticleUrl)+'&amp;width=95&amp;layout=standard&amp;action=like&amp;show_faces=false&amp;share=true&amp;height=35&amp;ref=poshfeedLike" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width=95px; height:35px;" allowTransparency="true"></iframe>');
        
			//build twitter button
	        //twttr.ready(function (twttr) {
				twttr.widgets.createShareButton(
					'http://poshfeed.com/articles/'+poshArticleUrl,
					document.getElementById('tweetbtn'),
					function (el) {
						//console.log("Button created.")
						
					},
					{
						count: 'none',
						text: pageTitle,
						via: 'poshfeed'
					}
				);

			//});
        }
        
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      GET & BUILD TOP SITES BAR      /////////////////////////////////////////////////////////////
function getTopSites(data){
	chrome.topSites.get(buildTopSites);
	chrome.topSites.get(updateTopSites);
};
function buildTopSites(data){
	for (var i=0;data.length>i;i++) {
		var thumbnailUrl = 'chrome://favicon/' + data[i].url;
		$('#mostVisited ul').append("<li><a style='background-image:url("+thumbnailUrl+")' href='"+data[i].url+"'>"+data[i].title+"</a></li>");
	}
}
function updateTopSites(data){ //send top sites only once!
	//chrome.storage.sync.remove('bobo');
	var topSitesList = data;
	chrome.storage.local.get('topSitesSent', function (result) {
		if (jQuery.isEmptyObject(result)) {//
			//console.log(topSitesList);
			var topsites = [];
			for (var i=0;topSitesList.length>i;i++) {
				topsites.push(topSitesList[i].url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0]);

			}
			topsites = topsites.join(',');
			//console.log(topsites);
			_gaq.push(['_trackEvent', 'topSites', 'send', topsites.toString()]);
			chrome.storage.local.set({'topSitesSent':'true'});
		} //else {
			//console.log('already sent');
		//}
	});
	//}
}

function sendTopSites(data){
	console.log(data);
	console.log(new Date().valueOf());
	for (var i=0;data.length>i;i++) {
		var topsites = [];
		topsites.push(data[i].url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0]);
		console.log(topsites);
	}
	//var domain = data[i].url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
}
////////////////////////////////////////////////////////////////////////////////////////////////////


//      LOAD USER CATEGORIES & GET THE CONTENT FROM SERVER      ////////////////////////////////////

(function getCategories(){
	chrome.storage.sync.get("categories", function(data){
        // Check if there are no stored categories --- First time users
        if($.isEmptyObject(data)){
            var allCats = [];
            for(cat in categoriesObj){
                allCats.push(cat);
            }
            chrome.storage.sync.set({'categories': allCats});
            theCategories = allCats;
            restore_options();
        }else{
            data = $(data.categories).toArray();
		    theCategories = data;
        }
		getContent(theCategories);
	});
})();


function getContent(cats){
	$.ajax({
		dataType: "json",
		url: "http://poshfeed.com/getCategoryKey?categories="+cats,
		success: buildPage
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      BUILD PAGE      ///////////////////////////////////////////////////////////////////////////
function buildPage(content){
	theContent = content;
    getArticleUrl();
	$('#pocketbtn').attr('data-save-url',encodeURIComponent(content.url));
	$("#megaWrapper").css({'background-image':'url('+content.image+')'});
	$("#pageTitle").text(content.title);
	$("#pageDesc").text(content.desc);
	$("#pageSource").text(content.source);
	$('.articleWrapper').animate({'opacity':'1'});
	$('.mainLink').attr('href',content.url).on('click',fireClickEvent);
	
	

}
////////////////////////////////////////////////////////////////////////////////////////////////////



//      SAVE & RESTORE OPTIONS FROM STORAGE     ////////////////////////////////////////////////////
function save_options() {
	var checkedCats = $('input:checkbox:checked:enabled');
	var categories = [];
	$(checkedCats).each(function(){		
		categories.push($(this).val());		
	});
	chrome.storage.sync.set({'categories': categories});
	
	if(checkedCats.length == 0){
		var allCats = [];
		for(cat in categoriesObj){
			allCats.push(cat);			
		}
		chrome.storage.sync.set({'categories': allCats});
	}
}

function restore_options() {
	chrome.storage.sync.get("categories", function(data){		
		data = $(data.categories).toArray();
		if(data.length > 0){		
			$(data).each(function(){
				$('#'+this).attr('checked','checked').parent().addClass('checked');
				
			})
		}else{
			$("#poshOptionsContainer li input").each(function(){								
				$(this).attr('checked','checked').parent().addClass('checked');				
			})
		}
	})
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      OPEN/CLOSE SIDEBAR AND ATTACH EVENTS     ///////////////////////////////////////////////////
function toggleMenu(e) {
	if ($('body').hasClass('open')) {
        _gaq.push(['_trackEvent', 'Menu', 'closeMenu']);
		$('#megaWrapper').unbind('click');
		$('body').removeClass('open');
		e.stopPropagation();
	} else {
        _gaq.push(['_trackEvent', 'Menu', 'openMenu']);
		$('#megaWrapper').bind('click', function(e){
			$('body').removeClass('open');
		});
		$('body').addClass('open');
		e.stopPropagation();
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      POPULATE SIDEBAR CATEGORIES     ////////////////////////////////////////////////////////////
function populateCategories(){
	for (obj in categoriesObj) {
		var value = categoriesObj[obj];
		$('#pfCategories').append("<li><input type='checkbox' name='category' id='"+value.id+"' value='"+value.id+"'  /> <label for='"+value.id+"'><span></span>"+value.display+"</label></li>");
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      GLOBAL RELOAD     //////////////////////////////////////////////////////////////////////////
function reloadPage(){
	chrome.tabs.reload();
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      MOUSEWHEEL RELOAD     //////////////////////////////////////////////////////////////////////
function scrollPager(){
	$('body').bind('mousewheel', function(e){
	    if(e.originalEvent.wheelDelta < 0) { //only on scroll down
        	e.stopPropagation();
			$('body').unbind('mousewheel');
			setTimeout(reloadPage, 300);
		}	    
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////


function fireClickEvent(e){
    e.preventDefault();
    _gaq.push(['_trackEvent', 'click', 'itemClick', $(e.target).attr('id')]);
	$.ajax({
		dataType: "json",
		url: "http://poshfeed.com/addClickStat?value="+JSON.stringify(theContent)
	});
		
	setTimeout(function(){window.location.href = theContent.url},200);
}

//Clock


function startTime(){
		var today=new Date();
		var h=today.getHours();
		var m=today.getMinutes();
		var dd = "AM";
		if (h >= 12) {
			h = h-12;
			dd = "PM";
		}
		if (h == 0) {
			h = 12;
		}
		m=checkTime(m);
		$('#clock').html(h+":"+m+' '+dd);
		t=setTimeout(function(){startTime()},10000);
	}
	function checkTime(i) {
		if (i<10) {
			i="0" + i;
		}
		return i;
	}


//pocket script execution
function loadPocket(){
	!function(d,i){if(!d.getElementById(i)){var j=d.createElement("script");j.id=i;j.src="https://widgets.getpocket.com/v1/j/btn.js?v=1";var w=d.getElementById(i);d.body.appendChild(j);}}(document,"pocket-btn-js");
}

//document ready
$(document).ready(function(){
   
    getTopSites();
    populateCategories();
    restore_options();
	startTime();
    
    setTimeout(scrollPager, 1000);
    setTimeout(loadPocket, 500);
    //loadPocket();
	
    
    $('#nextLink').click(reloadPage);
    //$('#sharePage').click(getShareLink);
    $('#menuLink').click(toggleMenu);
    $('#pfCategories li input').change(save_options);
    
    
    
});



//load twitter iframe
window.twttr = (function (d,s,id) {
  var t, js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
  js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
  return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
}(document, "script", "twitter-wjs"));


//build fb buttons



//SOCIAL TRACKING

//twitter tweet
function trackTwitter(intent_event) {
    if (intent_event) {
      var opt_pagePath;
      if (intent_event.target && intent_event.target.nodeName == 'IFRAME') {
            opt_target = extractParamFromUri(intent_event.target.src, 'url');
      }
      _gaq.push(['_trackSocial', 'twitter', 'tweet']);
      //_gaq.push(['_trackEvent', 'click', 'tweetbtn']);
    }
  }

twttr.ready(function (twttr) {
	//event bindings
	twttr.events.bind('tweet', trackTwitter);
	twttr.events.bind('click', trackTwitter);
});



var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43001046-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

twttr.ready(function(twttr) {

}); 

