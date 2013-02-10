var wildfire_media = {
  
  
  init: function() {
    this.setupUI();
    this.bindEvents();    
  },
  
  
  load: function() {
    $.ajax({
      url: "/admin/media/filter",
      type: "GET",
      dataType: "html",
      data: $.param( $("Element or Expression") ),

      complete: function() {
        //called when complete
      },

      success: function() {
        //called when successful
     },

      error: function() {
        //called when there is an error
      }
    });
  },
  
  getParams: function() {
    var filter = $(".media-filter-block .search-filter input").val();
    var collection = $(".media-filter-block .collection-filter .dropdown-toggle .collection").data("value");
    var mode = $('.media-filter-block .view-switch a').data("mode");
    return {"filter":filter, "collection":collection, "mode":mode};
  },
  
  bindEvents: function() {
    $('.media-filter-block .dropdown-menu a').click(function(){
      var toggler = $(this).parents(".btn-group").find(".dropdown-toggle .collection");
      toggler.data("value", $(this).text());
      toggler.text($(this).text());
    });
    $('.media-filter-block .view-switch a').click(function(){
      $(this).toggleClass("selected");
      $(this).data('model', $(this).data('mode') == 'time' ? 'standard' : 'time');
    });
  },
  
  setupUI: function() {
    $(".media-filter-block b").tooltip();
    $('.media-filter-block .dropdown-toggle').dropdown();
  }
  
  
};


$(document).ready(function() {  
  wildfire_media.init();
  console.log(wildfire_media);
  console.log("akakakakak");
});

