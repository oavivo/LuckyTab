$.get(chrome.extension.getURL('curate.html'), function(data) {
	var theHtml = $.get(chrome.extension.getURL('curate.html'), function(data) {
		$("<div></div>").attr('id','curateTab').html(data).appendTo('body');
		populate(document.location.href,document.title,$('meta[name=description]').attr("content"));
		$('#PFclose').click(function(){
			$('#curateTab').remove();
		});
		$('#sendForm').click(function(){
			validateFields(["pageUrl"]);
		});
	});
});


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

function validateFields(fieldsArray){
	$(fieldsArray).each(function(){
		//var field = $('#'+this).val();
		if (!$('#'+this).val() ) {
			//$('#'+this).css('background-color', 'red');
			//alert($("'#"+this+"'").attr('id'))
		}
	});
}