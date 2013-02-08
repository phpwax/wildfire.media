$(document).ready(function() {
  wildfire_uploader.init();
});


var wildfire_uploader = {
  
  dialog_selector: "#wildfire_uploader",
  progress_template: '<div id="progress"><div class="bar" style="width: 0%;"></div></div>',
  url: "/admin/media/upload",
  
  init: function() {
    this.inject_template();
    this.setup_listener();
  },
  
  setup_listener: function() {
    
    $('#fileupload').fileupload({
      
      url: this.url,
      
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.progress .bar').css('width',progress + '%');
      },
      
      add: function (e, data) {
        data.context = $('<p/>').text('Uploading...').appendTo(document.body);
        data.submit();
      },
      
      done: function (e, data) {
        data.context.text('Upload finished.');
      }
      
    });
    
 
  },
  
  inject_template: function() {
    $(body).append(this.dialog_template);
  }
  
}
