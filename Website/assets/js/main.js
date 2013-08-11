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
		$.get(requestURL, function(data) {});
		$('#myModal').modal('hide');
	}
	
}


$("#sendFormButton").click(validateContactForm);
