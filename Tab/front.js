var cachedContent;

function fetchFeed() {
  var url = "http://poshfeed.com/feed/?json=get_recent_posts";
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data){
      var content = [];
      $.each(data.posts, function(){
        var title = this.title;
        var link = $(this.content).find("a:first-child").attr("href");
        var description;
        if(this.excerpt) { 
          description =  $(this.excerpt).text();
          if(description.length > 125) {
            description = description.substring(0,124)+"...";
          }
        };
        
        var img = this.attachments[0].images.full.url;
        console.log(title, link, img);
        content.push({
          "title": title,
          "description": description,
          "image": img,
          "link": link
        });
      });
      // clear local cache and store new one
      chrome.storage.local.set({"cachedContent": ""}, function(){
        console.log("Old cache cleared");
        chrome.storage.local.set({"cachedContent": content}, function(){
          console.log("New cache stored. "+ content.length +" items.");
          chrome.storage.local.get("cachedContent", function(result){
            cachedContent = result.cachedContent;
            buildPage(cachedContent);
          });
        })
      });
      
    }
  })
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
			chrome.storage.local.set({'topSitesSent':'true'});
		} //else {
			//console.log('already sent');
		//}
	});
	//}
}



////////////////////////////////////////////////////////////////////////////////////////////////////

//      BUILD PAGE      ///////////////////////////////////////////////////////////////////////////
function buildPage(content){
	var randomPost = Math.floor(Math.random() * (content.length - 0) + 0);
	console.log(randomPost);
	content = content[randomPost];
	$("#megaWrapper").css({'background-image':'url('+content.image+')'});
	$("#pageTitle").text(content.title);
	$("#pageSource").text(content.source);
	$("#pageDesc").text(content.description);
	$('.articleWrapper').animate({'opacity':'1'});
	$('.mainLink').attr('href',content.link);
	
	

}
////////////////////////////////////////////////////////////////////////////////////////////////////




//OPEN/CLOSE SIDEBAR AND ATTACH EVENTS     ///////////////////////////////////////////////////
function toggleMenu(e) {
	if ($('body').hasClass('open')) {
		$('#megaWrapper').unbind('click');
		$('body').removeClass('open');
		e.stopPropagation();
	} else {
		$('#megaWrapper').bind('click', function(e){
			$('body').removeClass('open');
		});
		$('body').addClass('open');
		e.stopPropagation();
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



//document ready
$(document).ready(function(){
   
    chrome.storage.local.get("cachedContent", function(result){
      if (!result.cachedContent) {
        fetchFeed();
      } else {
        cachedContent = result.cachedContent;
        console.log(cachedContent.length)
        buildPage(cachedContent);
      }
      
    });
    
    getTopSites();
    startTime();
    
    
    setTimeout(scrollPager, 1000);
    //loadPocket();
	
    
    $('#nextLink').click(reloadPage);
    //$('#sharePage').click(getShareLink);
    $('#menuLink').click(toggleMenu);
    
    
    
});
