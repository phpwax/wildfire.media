$(document).ready(function() {
  var base = $(".embedded-media-listing");
  if(base.length) {
    var url = base.data("action");
    $.get(url, function(response){
      base.append(response);
      wildfire_media.init();
    });
    
  }
});


function file_tree_refresh() {
  
}