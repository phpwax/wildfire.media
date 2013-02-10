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
       $("#main-upload-dialog .file-collection-name").text($("#main-upload-dialog .category_tagging").val());
       $("#main-upload-dialog .finish-button").show().unbind("click").click(function(){
         $(".collection-name .collection-save").click();
         dialog_reset();
         $("#main-upload-dialog").dialog("close");
       });
      }
    );
    
    
    
  });
  
  
  $(window).bind("file.upload.progress", function(evt, progress) {
    get_overall_progress();
  });
  
  $(window).bind("file.upload.change", function(evt, file_div) {
    $(file_div).prepend('<span class="badge badge-success">✓</span>')
  });
  
  
  
});

function dialog_reset() {
  $("#main-upload-dialog .collection-name").show();
  $("#main-upload-dialog .file-list").html("");
  $("#main-upload-dialog .finish-button").hide();
}

function get_overall_progress() {
  var count  =0;
  var total = 0;
  var loaded = 0;
  $("#main-upload-dialog .file-list .file-summary").each(function(){
    count ++;
    total += $(this).find(".percentage span").data("progress-total"); 
    loaded += $(this).find(".percentage span").data("progress-loaded");
  });
  percent = Math.round((loaded / total)*100);
  $("#main-upload-dialog .progress .bar").css("width",percent+"%");
  $("#main-upload-dialog .progress-total").text(percent+"%");
  if(percent == 100) {
    $("#main-upload-dialog .progress").removeClass("active").addClass("progress-success");
    $(window).trigger("file.upload.complete");
  }
}
