$(function(){
  var image = $(".media-preview .crop"),
      ratio = image[0].naturalWidth / image[0].width,
      x1 = $("#wildfire_media_crop_x_1"),
      y1 = $("#wildfire_media_crop_y_1"),
      x2 = $("#wildfire_media_crop_x_2"),
      y2 = $("#wildfire_media_crop_y_2"),
      opts = {
        onSelect:function(coords){
          x1.val(Math.round(coords.x * ratio));
          y1.val(Math.round(coords.y * ratio));
          x2.val(Math.round(coords.x2 * ratio));
          y2.val(Math.round(coords.y2 * ratio));
        }
      };

  if(x1.val()) opts.setSelect = [
    Math.round(x1.val() / ratio),
    Math.round(y1.val() / ratio),
    Math.round(x2.val() / ratio),
    Math.round(y2.val() / ratio)];

  image.Jcrop(opts);
});
