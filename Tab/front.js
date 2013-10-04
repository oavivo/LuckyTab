//GLOBAL VARS
var theCategories;
var theContent;


//SUPPORT FUNCTIONS
	//string formatting
	if (!String.prototype.format) {String.prototype.format = function() {var args = arguments;return this.replace(/{(\d+)}/g, function(match, number) {return typeof args[number] != 'undefined'? args[number]: match;});};}
////////////////////////////////////////////////////////////////////////////////////////////////////	


//      SHARE FUNCTION      /////////////////////////////////////////////////////////////
function getShareLink(e){
    e.preventDefault();
    var value = theContent;
    _gaq.push(['_trackEvent', 'click', 'FBShareButton',value.url]);
	var sendUrl = 'http://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent("http://poshfeed.com/articles/"+poshArticleUrl);
    console.log(sendUrl);

	window.open(
      sendUrl, 
      'share-poshfeed', 
      'width=626,height=436'
    );  			    			
};

function getArticleUrl(){
    var value = theContent;
    var sendUrl = 'http://poshfeed.com/getArticleURL?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
    var title = encodeURIComponent(value.title.replace(/\"/g,'%22'));
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
            $('#likeIframeWrapper').append('<iframe src="http://www.facebook.com/plugins/like.php?href='+encodeURIComponent("http://poshfeed.com/articles/"+poshArticleUrl)+'&amp;width=52&amp;height=26&amp;colorscheme=light&amp;layout=standard&amp;action=like&amp;show_faces=false&amp;send=false&amp;ref=poshfeedLike" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:52px; height:24px;" allowTransparency="true"></iframe>');
        }
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//      GET & BUILD TOP SITES BAR      /////////////////////////////////////////////////////////////
function getTopSites(data){
	chrome.topSites.get(buildTopSites);
};
function buildTopSites(data){
	for (var i=0;data.length>i;i++) {
		var thumbnailUrl = 'chrome://favicon/' + data[i].url;
		$('#mostVisited ul').append("<li><a style='background-image:url("+thumbnailUrl+")' href='"+data[i].url+"'>"+data[i].title+"</a></li>");
	}
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
	    e.stopPropagation();
        $('body').unbind('mousewheel');
        setTimeout(reloadPage, 300)
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



//document ready
$(document).ready(function(){
   
    getTopSites();
    populateCategories();
    restore_options();
    
    setTimeout(scrollPager, 1000);
    
    $('#nextLink').click(reloadPage);
    $('#sharePage').click(getShareLink);
    $('#menuLink').click(toggleMenu);
    $('#pfCategories li input').change(save_options);

});




var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43001046-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
