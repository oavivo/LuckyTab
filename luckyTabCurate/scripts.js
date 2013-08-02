chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
});



chrome.tabs.query({active: true}, function(tab){
	populate(tab[0].url,tab[0].title);
});
function populate(url,title) { 
  tablink = url;
  tabtitle = title;
  $('#pageURL').val(tablink);
  $('#pageSource').val(getDomain(tablink));
  $('#pageTitle').val(tabtitle);
}


function getDomain(url) {
	return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
}

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

function sendKey(){	
	var sendUrl = 'http://82.196.3.219/setKey?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}","timeless":"{6}"';
	var title = encodeURIComponent($("#pageTitle").val());
	var desc = encodeURIComponent($("#pageDesc").val());
	var url = encodeURIComponent($("#pageURL").val());
	var source = encodeURIComponent($("#pageSource").val());
	var image = encodeURIComponent($("#pageImage").val());
	var e = document.getElementById("pageCategory");
	var category = encodeURIComponent(e.options[e.selectedIndex].text);;	
	var isTimeless = document.getElementById("isTimeless").checked == true ? "yes": "no";
	sendUrl = sendUrl.format(title,desc,url,source,image,category,isTimeless);
	
	var xhr = new XMLHttpRequest();
		xhr.open("GET", sendUrl, true);
		xhr.onreadystatechange = function() {			
  		if (xhr.readyState == 4) { 
  			console.log(xhr.responseText);
  		}
	}
	xhr.send();
}

window.addEventListener("DOMContentLoaded",function(){
	$("#sendForm").click(function(e){
		e.preventDefault();
		sendKey();
	})
})




