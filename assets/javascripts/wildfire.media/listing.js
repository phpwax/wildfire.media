var wildfire_media = {
  
  page: 1,
  append: false,
  
  
  init: function() {
    if(!$(".media-listing-wrapper").length) return;
    this.setupUI();
    this.bindEvents();
    this.load();
  },
  
  
  load: function() {
    var controller = this;
    $.ajax({
      url: "/admin/media/filter",
      type: "GET",
      dataType: "html",
      data: controller.getParams(),

      complete: function() {
        //called when complete
      },

      success: function(response) {
        if(controller.append) {
          $(".media-listing-wrapper").append(response);
        } else $(".media-listing-wrapper").html(response);
        controller.bindMediaEvents();
        controller.append = false;
     },

      error: function() {
        //called when there is an error
      }
    });
  },
  
  loadAppend: function() {
    this.append = true;
    this.load();
  },
  
  getParams: function() {
    var filter = $(".media-filter-block .search-filter input").val();
    var collection = $(".media-filter-block .collection-filter .dropdown-toggle .collection").data("value");
    var mode = $('.media-filter-block .view-switch a').data("mode");
    return {"filter":filter, "collection":collection, "mode":mode, page:this.page};
  },
  
  bindEvents: function() {
    var controller = this;
    $('.media-filter-block .dropdown-menu a').click(function(){
      var toggler = $(this).parents(".btn-group").find(".dropdown-toggle .collection");
      toggler.data("value", $(this).text());
      toggler.text($(this).text());
    });
    $('.media-filter-block .view-switch a').click(function(){
      $(this).toggleClass("selected");
      $(this).data('model', $(this).data('mode') == 'time' ? 'standard' : 'time');
    });
    
    $(window).scroll(function () {
      if ($(window).scrollTop() + $(window).height() >= $(document).height()) {                     
        controller.infiniteScroll();
      }
    });
    
    $(".media-filter-block .search-submit").click(function(){
      controller.page = 1;
      controller.load();
    });
    
    $(".media-filter-block .collection-filter .dropdown-menu a").click(function(){
      controller.page = 1;
      controller.load();
    });
    
    $(".media-filter-block .view-switch a").click(function(){
      controller.page = 1;
      controller.load();
    });
    
  },
  
  setupUI: function() {
    $(".media-filter-block b").tooltip();
    $('.media-filter-block .dropdown-toggle').dropdown();
  },
  
  bindMediaEvents: function() {
    return true;
    this.calculateImageRatios();
  },
  
  calculateImageRatios: function() {
    $(".media-listing-item img").each(function(){
      var width = $(this).width();
      var height = $(this).height();
      $(this).addClass("ratio_"+Math.floor(width/height) );
    });
  },
  
  infiniteScroll: function() {
    var current = $(".media-listing-container .page-marker:last").data("last-load");
    this.page = current+1;
    this.loadAppend();
  }
  
  
};


jQuery(document).ready(function() {  
  wildfire_media.init();
  
});

