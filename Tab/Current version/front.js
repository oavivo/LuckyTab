function getTopSites(e){chrome.topSites.get(function(t){for(var n=0;n<t.length;n++){e(t[n])}})}function fireClickEvent(e){var t=new XMLHttpRequest;t.open("GET","http://poshfeed.com/addClickStat?value="+encodeURIComponent(returnedJson),true);t.onreadystatechange=function(){if(t.readyState==4){console.log(xhr.responseText)}};t.send();setTimeout(function(){window.location.href=e},200)}function getContent(){var e=new XMLHttpRequest;e.open("GET","http://poshfeed.com/getKey",true);e.onreadystatechange=function(){if(e.readyState==4){window.returnedJson=e.responseText.substring(1,e.responseText.length-1);var t=JSON.parse(e.responseText);$("body").css("background-image","url("+t.image+")");$("#pageTitle").html(t.title).attr("href",t.url).css("display","block").click(function(e){e.preventDefault();fireClickEvent(t.url)});if(t.desc){$("#pageDesc").html(t.desc).attr("href",t.url).css("display","block").click(function(e){e.preventDefault();fireClickEvent(t.url)})}$("#readPage").attr("href",t.url).css("display","inline").click(function(e){e.preventDefault();fireClickEvent(t.url)});$("#pageSource").html("From: "+t.source).css("display","block")}};e.send()}getTopSites(function(e){var t="chrome://favicon/"+e.url;$("#mostVisited ul").append("<li><a style='background:url("+t+") no-repeat 2px 2px' href='"+e.url+"'>"+e.title+"</a></li>")});getContent()


// google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43001046-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();