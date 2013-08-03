$.get(chrome.extension.getURL('curate.html'), function(data) {
	var theHtml = $.get(chrome.extension.getURL('curate.html'), function(data) {
		$("<div></div>").attr('id','curateTab').html(data).appendTo('body');
		populate(document.location.href,document.title);
		$('#PFclose').click(function(){
			$('#curateTab').remove();
		});
	});
});


function getDomain(url) {
	return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
}
function populate(url,title) { 
  tablink = url;
  tabtitle = title;
  $('#pageURL').val(tablink);
  $('#pageSource').val(getDomain(tablink));
  $('#pageTitle').val(tabtitle);
}

