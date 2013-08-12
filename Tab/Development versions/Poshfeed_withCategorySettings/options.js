function populateCategories(){
	$(PFcategoryList).each(function(){
		//console.log($(this)[0].display);
		$('#poshOptionsContainer').append("<li><input type='checkbox' name='category' id='"+$(this)[0].id+"' value='"+$(this)[0].id+"'  /> <label for='"+$(this)[0].id+"'>"+$(this)[0].display+"</label></li>");
	})
}


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

// Restores select box state to saved value from storage.
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



// ON LOAD
$(document).ready(function() {
	populateCategories();
	restore_options();
	$('#save').click(save_options);
});



