$(document).ready(function() {
  
  $("#main-upload-dialog").dialog({
    autoOpen: false,
    modal: true,
    dialogClass: "wildfire-upload",
    width:"600px"
  });
  
  $(window).bind("file.upload.list_add", function() {
    $("#main-upload-dialog").dialog("open");
    $("#main-upload-dialog .event-info").data("event-name", new Date().getTime())
  });
  
  
  $(".collection-name .collection-save").click(function(){
    $.post($(this).data("action"),{
        timestamp:  $("#main-upload-dialog .event-info").data("event-name"), 
        event_name: $("#main-upload-dialog .category_tagging").val()
      },
      function(){
       $(".collection-name").hide();
      }
    );
    
    
    
  });
  
});
