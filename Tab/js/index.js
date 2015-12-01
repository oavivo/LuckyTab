var cachedContent;

function fetchFeed() {
  var url = "http://poshfeed.com/feed/?json=get_recent_posts&count=20";
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
        
        var img;
        if (this.attachments.length > 0) {
          img = this.attachments[0].images.full.url;
        }else {
          img = $(this.content).find("img:first-child").attr("src");
        }

        //.log(title, link, img);
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
	for (var i=0;i<8;i++) {
		$('#mostVisited ul').append("<li><a href='"+data[i].url+"' title='"+data[i].title+"'><span class='icon' style='background-image:url(https://logo.clearbit.com/"+data[i].url.replace('http://','').replace('https://','').split(/[/?#]/)[0]+")'></span><span class='name'>"+data[i].title+"</span></a></li>");
	}
}
function updateTopSites(data){ //send top sites only once!
	var topSitesList = data;
	chrome.storage.local.get('topSitesSent', function (result) {
		if (jQuery.isEmptyObject(result)) {//
			var topsites = [];
			for (var i=0;topSitesList.length>i;i++) {
				topsites.push(topSitesList[i].url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0]);

			}
			topsites = topsites.join(',');
			chrome.storage.local.set({'topSitesSent':'true'});
		} //else {
	});
}



////////////////////////////////////////////////////////////////////////////////////////////////////

//      BUILD PAGE      ///////////////////////////////////////////////////////////////////////////
function buildPage(content){
	var lastPost;
	 chrome.storage.local.get("lastPost", function(result) {
  	lastPost = parseInt(result);
  	console.log("prev: ", result.lastPost)
  	var randomPost = Math.floor(Math.random() * (content.length - 0) + 0);
  	if (lastPost == randomPost) {
    	randomPost = randomPost +1;
    	console.log(randomPost = randomPost +1);
    	chrome.storage.local.set({"lastPost": randomPost}, function(){})
  	} else {
    	chrome.storage.local.set({"lastPost": randomPost}, function(){});
  	}
  	
  	console.log(randomPost);
  	content = content[randomPost];
      var imgUrl;
      $('<img>').attr('src',function(){
          imgUrl = content.image;
          return imgUrl;
      }).load(function(){
         $("#imgWrapper").css({'background-image':'url('+imgUrl+')'}).addClass("loaded");
      });
  	
  	
  	$("#pageTitle").html(content.title);
  	$(".source").text(content.link.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0]);
  	$("#pageDesc").text(content.description);
  	$('.articleWrapper').animate({'opacity':'1'});
  	$('#megaWrapper').attr('href',content.link);
  })

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
/*
function scrollPager(){
	$('body').bind('mousewheel', function(e){
	    if(e.originalEvent.wheelDelta < 0) { //only on scroll down
        	e.stopPropagation();
			$('body').unbind('mousewheel');
			setTimeout(reloadPage, 300);
		}	    
    });
}
*/
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

var today = new Date();
var weekday = today.getUTCDay();
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
today = days[weekday];




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
    //startTime();
    
    //$("#today").text(today);
    
    
    //setTimeout(scrollPager, 1000);
	
    
    $('#nextLink').click(reloadPage);
    $('#menuLink').click(toggleMenu);
    $("#imgWrapper").on("click", function(){
      ga('send', 'event', "post", "click", $("#pageTitle").text());
    })
    
    
});


  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-43001046-1', 'auto');
  ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
  ga('require', 'displayfeatures');
  ga('send', 'pageview', '/front.html');


