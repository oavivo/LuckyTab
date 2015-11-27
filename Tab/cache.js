var cacheInterval = 5;

chrome.alarms.create("cacheFeed", {
  periodInMinutes: cacheInterval
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "cacheFeed") {
    cacheFeed();
  }
});

function cacheFeed() {
  var url = "http://poshfeed.com/feed/?json=get_recent_posts";
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data){
      var content = [];
      $.each(data.posts, function(){
        var title = this.title;
        var link = $(this.content).find("a:first-child").attr("href");
        var description;
        if(this.excerpt) { 
          description =  $(this.excerpt).text();
          if(description.length > 125) {
            description = description.substring(0,124)+"...";
          }
        };
        
        var img = this.attachments[0].images.full.url;
        console.log(title, link, img);
        content.push({
          "title": title,
          "description": description,
          "image": img,
          "link": link
        });
      });
      // clear local cache and store new one
      chrome.storage.local.set({"cachedContent": ""}, function(){
        console.log("Old cache cleared");
        chrome.storage.local.set({"cachedContent": content}, function(){
          console.log("New cache stored. "+ content.length +" items.");
          chrome.storage.local.get("cachedContent", function(result){
            cachedContent = result.cachedContent;
          });
        })
      });
      
    }
  })
}


chrome.runtime.onInstalled.addListener(function () {
    cacheFeed();
  }
);