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

if ($('#curateTab').length == 0 ){
	$.get(chrome.extension.getURL('curate.html'), function(data) {	
		$("<div></div>").attr('id','curateTab').html(data).appendTo('body');
		populate(document.location.href,document.title,$('meta[name=description]').attr("content"));
		$('#PFclose').click(function(e){
			e.preventDefault();
			$('#curateTab').remove();
		});
		$('#sendForm').click(function(){
			validateFields($("#curateTab input"));
		});	
	});
} else {
	$('#curateTab').remove();
}


function getDomain(url) {
	return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
}
function populate(url,title,descrip) { 
  	tablink = url;
  	tabtitle = title;
  	pageDesc = descrip;
  	$('#pageURL').val(tablink);
  	$('#pageSource').val(getDomain(tablink));
  	$('#pageTitle').val(tabtitle);
  	$('#pageDesc').val(pageDesc);
}

function sendKey(){	
	var sendUrl = 'http://poshfeed.com/setCategoryKey?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
	var title = encodeURIComponent($("#pageTitle").val().replace(/\"/g,'%22'));
	var desc = encodeURIComponent($("#pageDesc").val().replace(/\"/g,'\%22'));
	var url = encodeURIComponent($("#pageURL").val().replace(/\"/g,'%22'));
	var source = encodeURIComponent($("#pageSource").val().replace(/\"/g,'%22'));
	var image = encodeURIComponent($("#pageImage").val().replace(/\"/g,'%22'));

    var categories = $('.CT_checkbox:checkbox:checked').map(function(){
        return this.value;
    }).get();


    sendUrl = sendUrl.format(title,desc,url,source,image,categories);

    var xhr = new XMLHttpRequest();
		xhr.open("GET", sendUrl, true);
		xhr.onreadystatechange = function() {			
  		if (xhr.readyState == 4) { 
  			console.log(xhr.responseText);
  			$('#curateTab').remove();
  		}
	}
	xhr.send();
}

function restoreBorder(el){
	setTimeout(function(){		
		$(el).removeClass("inputError");
	},3000)
}

function validateFields(fieldsArray){
	var sendForm = true;	
	$(fieldsArray).each(function(){
		if($(this).val() == ""){
			sendForm = false;
			$(this).addClass("inputError");
			restoreBorder(this);
		}
	});
    var checkedVals = $('.CT_checkbox:checkbox:checked').map(function() {
        return this.value;
    }).get();
    if(checkedVals.length == 0){
        $(".CT_checkbox").each(function(){
            sendForm = false;
            var label = $("label[for='"+$(this).attr('value')+"']");
            label.addClass("inputError");            
            restoreBorder(label);
        })
    }
	if (sendForm){
		sendKey();
	}
}