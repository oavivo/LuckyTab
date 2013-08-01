chrome.tabs.getSelected(null, function(tab) {
    populate(tab.url);
});
function populate(url) { 
  tablink = url;
  $('#pageURL').val(tablink);
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

function concatoneString(){	
	var sendUrl = 'http://82.196.3.219/setKey?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}","timeless":"{6}"';
	var title = $("#pageTitle").val();
	var desc = $("#pageDesc").val();
	var url = $("#pageURL").val();
	var source = $("#pageSource").val();
	var image = $("#pageImage").val();
	var e = document.getElementById("pageCategory");
	var category = e.options[e.selectedIndex].text;	
	var isTimeless = document.getElementById("isTimeless").checked == true ? "yes": "no";
	sendUrl = sendUrl.format(title,desc,url,source,image,category,isTimeless);
	console.log(sendUrl);	
	
	
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
		concatoneString();
	})
})




