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
$("#sharePage").click(function(e){
	    			value = poshFeed.item;
	    			var sendUrl = 'http://poshfeed.com/shareURL?value="title":"{0}","desc":"{1}","url":"{2}","source":"{3}","image":"{4}","category":"{5}"';
				    var title = encodeURIComponent(value.title.replace(/\"/g,'%22'));
				    var desc = encodeURIComponent(value.desc.replace(/\"/g,'\%22'));
				    var url = encodeURIComponent(value.url.replace(/\"/g,'%22'));
				    var source = encodeURIComponent(value.source.replace(/\"/g,'%22'));
				    var image = encodeURIComponent(value.image.replace(/\"/g,'%22'));
				    var category = encodeURIComponent(value.category.replace(/\"/g,'%22'))
				
				    sendUrl = sendUrl.format(title,desc,url,source,image,category);	    			
	    			e.preventDefault();
	    			window.open(
				      sendUrl, 
				      'share-poshfeed', 
				      'width=626,height=436'
				    );});



