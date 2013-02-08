$(document).ready(function() {
  wildfire_uploader.init();
});


var wildfire_uploader = {
  
  var dialog_selector = "#wildfire_uploader";
  var dialog_template = '<div id="wildfire_uploader"></div>';
  var progress_template = '<div id="progress"><div class="bar" style="width: 0%;"></div></div>';
  var url = "/admin/media/upload";
  
  init: function() {
    this.setup_listener();
    this.inject_template();
  },
  
  setup_listener: function() {
    $('body').fileupload({
      dataType: 'json',
      url: this.url,
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .bar').css('width',progress + '%');
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
