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

function is_email(a){return /^([\w!.%+\-])+@([\w\-])+(?:\.[\w\-]+)+$/.test(a);}

function handleFormElementOnFail(el){
	$(el).addClass("validFail");
	setTimeout(function(){$(el).removeClass("validFail")},3000)		
}

function validateContactForm(){
	validForm = true;
	$("#contactFormBody input,#contactFormBody textarea").each(function(){
		switch($(this).attr("class")){
			case "emailValidate":{
				if(!is_email($(this).val())){
					validForm = false;
					handleFormElementOnFail($(this));
				}
				break;
			}
			case "textValidate":{
				if($(this).val() == ""){
					validForm = false;
					handleFormElementOnFail($(this));			
				}
				break;
			}
		}
	})
	if(validForm){
	
		var emailBody = "Name:%20{0}<br/><br/>Subject:%20{1}<br/><br/>Email:%20{2}<br/><br/>Message:%20{3}";
		var e = document.getElementById("Subject");
		var contactSubject = encodeURIComponent(e.options[e.selectedIndex].value);
		emailBody = emailBody.format(encodeURIComponent($("#contactFormBody #Name").val()),contactSubject,encodeURIComponent($("#contactFormBody #Email").val()),encodeURIComponent($("#contactFormBody #Message").val()));
		var requestURL = 'http://poshfeed.com/sendContactForm?text='+emailBody;		
		$.get(requestURL, function(data) {
			setTimeout(function(){
				$('#contactForm').modal('hide');				
			},3000);
			$(".modal-footer").remove();			
			_gaq.push(['_trackEvent','contactForm','formSent','true']);		
			$("#contactFormBody").html("<h4>Message sent</h4><div class='contactLabel'>Thank you!</div>");
			$('#contactForm').on('hidden.bs.modal', function () {$('#contactForm').html(formHTML)})
		});
		
	}
	
}


$("#sendFormButton").click(validateContactForm);
window.formHTML = $("#contactForm").html();
$(".appStoreLink").click(function(e){	
	e.preventDefault();	
	_gaq.push(['_trackEvent','downloadLinkClicked','inlineInstall','initialClick']);
	// Only apply inline install functionality to Chrome 15 and above
	var chromeVersion = window.navigator.userAgent.match(/Chrome\/([0-9]*)/);	
	if(chromeVersion != null && parseInt(chromeVersion[1]) > 15){		
		chrome.webstore.install("",function(){			
			_gaq.push(['_trackEvent','downloadLinkClicked','inlineInstall','success'])		
		},function(err){
			//On error:	If the user canceled the installation, keep them on the page, else redirect to our chromestore page						
			if(err != "User cancelled install"){
				_gaq.push(['_trackEvent','downloadLinkClicked','inlineInstall','fail_'+err]);
				document.location.href = "https://chrome.google.com/webstore/detail/poshfeed/aimbgnciobahnpjegjhidihgoaipdabm";
			}else{
				_gaq.push(['_trackEvent','downloadLinkClicked','inlineInstall','fail_userAborted'])
			}
		});
	}else{
		document.location.href = "https://chrome.google.com/webstore/detail/poshfeed/aimbgnciobahnpjegjhidihgoaipdabm";
	}
});

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
var player;
function onYouTubeIframeAPIReady() {	
	  player = new YT.Player('pf_vid_player', {		  
		    playerVars: {	'controls':0,
		    				'enablejsapi':1,
		    				'modestbranding':1,
		    				'showinfo':0,
		    				'iv_load_policy':3,
		    				'wmode':'transparent',
		    				'origin':'http://poshfeed.com'		    				
		    			},
		    height: '506',
         	width: '900',
         	videoId: 'ApOF2EIDd8A',
		    events: {   	  			      
			      'onStateChange': ytStateChanged
		    }
	  });
}




function ytStateChanged(event) {
    if(player.getPlayerState() == 0){
    	closeVideoLayer();	
    }    
}

function openVideoLayer(){
	player.setPlaybackQuality("hd720").playVideo();	
	$(".videoLayer").css("z-index","1").animate({"opacity":"1"},500,function(){
			
	});
}

function closeVideoLayer(){	
	player.pauseVideo().seekTo("0");
	$(".videoLayer").animate({"opacity":"0"},300,function(){		
		$(this).css("z-index","-1");				
	})	
}


$(".watchVdo").click(function(e){
	openVideoLayer();	
});

$(".videoLayer .closeBtn").click(function(e){
	e.preventDefault();	
	closeVideoLayer();
	
})
