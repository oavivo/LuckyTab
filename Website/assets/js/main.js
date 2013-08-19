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
