console.log("inject injected");

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

function getDomain(url) {
	return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
}

function populate(url,title,descrip) {
  	$('#PFpageURL').val(url);
  	$('#PFpageSource').val(getDomain(url));
  	$('#PFpageTitle').val(title);
  	$('#PFpageDesc').val(descrip);
}

function sendKey(){
    var sendUrl = 'http://poshfeed.com/setKey?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
	var title = encodeURIComponent($("#PFpageTitle").val().replace(/\"/g,'%22'));
	var desc = encodeURIComponent($("#PFpageDesc").val().replace(/\"/g,'\%22'));
	var url = encodeURIComponent($("#PFpageURL").val().replace(/\"/g,'%22'));
	var source = encodeURIComponent($("#PFpageSource").val().replace(/\"/g,'%22'));
	var image = encodeURIComponent($("#PFpageImage").val().replace(/\"/g,'%22'));

    var categories = $('.CT_checkbox:checkbox:checked').map(function(){
        return this.value;
    }).get();


    sendUrl = sendUrl.format(title,desc,url,source,image,categories);

    var xhr = new XMLHttpRequest();
		xhr.open("GET", sendUrl, true);
		xhr.onreadystatechange = function() {			
            if (xhr.readyState == 4) {
                console.log(xhr.responseText);
                $('#PFcurateTab').remove();
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
            var label = $("label[for='PF"+$(this).attr('value')+"']");
            label.addClass("inputError");            
            restoreBorder(label);
        })
    }
	if (sendForm){
		sendKey();
	}
}

function showCurateTab(){

    if ($('#PFcurateTab').length == 0 ){
        $.get(chrome.extension.getURL('curate.html'), function(data) {
            $(data).appendTo('body');
            populate(document.location.href,document.title,$('meta[name=description]').attr("content"));
            $('#PFclose').click(function(e){
                e.preventDefault();
                $('#PFcurateTab').remove();
            });
            $('#PFsendForm').click(function(){
                validateFields($("#PFcurateTab input"));
            });
        });
    } else {
        $('#PFcurateTab').remove();
    }
}


function authorizeUser(){
    if(typeof $ == "undefined"){
        var getJQ = new XMLHttpRequest();
        getJQ.open("GET",chrome.extension.getURL('jquery.js'),true);
        getJQ.onreadystatechange = function(){
            if (getJQ.readyState == 4) {
                console.log(getJQ.responseText);
            }
        }
    }

    chrome.storage.sync.get('pf_auth', function(data){
        if(typeof data != "undefined" && data.pf_auth != "undefined" && data.pf_auth == "true"){
            showCurateTab();
        }else{
            var oauthURL = "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=880521421279.apps.googleusercontent.com&redirect_uri=http://poshfeed.com/oauth2callback&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&state=initial";
            var oauthInitial = "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=880521421279.apps.googleusercontent.com&redirect_uri=http://poshfeed.com/oauth2callback&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&state=getPermissions";
            var xhr = new XMLHttpRequest();
            xhr.open("GET", oauthURL, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    data = xhr.responseText;
                    if(data[0] == "<"){
                        window.open(oauthInitial,"poshFeedAuth","height=500,width=650,resizable=no,menubar=no,location=no");
                    }
                    if(data == "true"){
                        chrome.storage.sync.set({'pf_auth': "true"}, function() {});
                        showCurateTab();

                    }
                }
            }
            xhr.send();
        }
    })
}


authorizeUser();