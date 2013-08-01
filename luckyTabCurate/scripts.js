chrome.tabs.getSelected(null, function(tab) {
    populate(tab.url);
});
function populate(url) {
  // do stuff here
  tablink = url;
  $('#url').val(tablink);
}



