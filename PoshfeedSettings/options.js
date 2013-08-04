function save_options() {
	var checkedCats = $('input:checkbox:checked:enabled');
	var categories = [];
	$(checkedCats).each(function(){		
		categories.push($(this).val());		
	});
	
	chrome.storage.sync.set({'categories': categories});

	$('#status').fadeIn();
	setTimeout(function() {
		$('#status').fadeOut();
	}, 2000);
	
	
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	savedCats = chrome.storage.sync.get("categories", function(data){		
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

$('input:checkbox').change(function(){
	if ($(this).parent().hasClass('checked')) {
		$(this).parent().removeClass('checked')
	} else {
		$(this).parent().addClass('checked')
	}
});

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);



