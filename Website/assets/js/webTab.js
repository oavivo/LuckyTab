function fireClickEvent(redirectURL){
	var eventXHR = new XMLHttpRequest();
		eventXHR.open("GET", "http://poshfeed.com/addClickStat?value="+JSON.stringify(poshFeed.item), true);		
	eventXHR.send();
	setTimeout(function(){window.location.href = redirectURL},200);
}

function clickHandler(e){
	e.preventDefault();
	fireClickEvent(poshFeed.item.url);    
}

$("#pageTitle,#pageDesc,#readPage,#pageSource").click(clickHandler);

