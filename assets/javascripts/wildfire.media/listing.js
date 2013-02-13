var wildfire_media = {
  
  page: 1,
  append: false,
  
  
  init: function() {
    if(!$(".media-listing-wrapper").length) return;
    this.setupUI();
    this.bindEvents();
    this.restoreState();
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
  
  encodeState: function() {
    var ret = [];
    var data =  this.getParams();
    for (var d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    history.pushState(data, "", "/admin/media/?"+ret.join("&"));
  },
  
  restoreState: function() {
    data = this.getParams();
    console.log(data);
    if(data.mode == "time") $('.media-filter-block .view-switch a').toggleClass("selected");
    if(data.filter.length > 1 ) $(".media-filter-block .search-filter input").val(data.filter);
    if(data.collection) {
      $(".dropdown-toggle .collection").data("value", data.collection);
      $(".dropdown-toggle .collection").text(data.collection);
    }
  },
  
  bindEvents: function() {
    var controller = this;
    $('.media-filter-block .dropdown-menu a').click(function(){
      var toggler = $(this).parents(".btn-group").find(".dropdown-toggle .collection");
      toggler.data("value", $(this).text());
      toggler.text($(this).text());
    });
    $('.media-filter-block .view-switch a').click(function(e){
      $(this).toggleClass("selected");
      $(this).data('mode', $(this).data('mode') == 'time' ? 'standard' : 'time');
      controller.encodeState();
      e.preventDefault();
    });
    
    $(window).scroll(function () {
      if ($(window).scrollTop() + $(window).height() >= $(document).height()) {                     
        controller.infiniteScroll();
      }
    });
    
    $(".media-filter-block .search-submit").click(function(e){
      controller.page = 1;
      controller.encodeState();
      controller.load();
      e.preventDefault();
    });
    
    $(".media-filter-block .collection-filter .dropdown-menu a").click(function(e){
      controller.page = 1;
      controller.encodeState();
      e.preventDefault();
      controller.load();
    });
    
    $(".media-filter-block .view-switch a").click(function(e){
      controller.page = 1;
      controller.encodeState();
      controller.load();
      e.preventDefault();
    });
    
  },
  
  setupUI: function() {
    $(".media-filter-block b").tooltip();
    $('.media-filter-block .dropdown-toggle').dropdown();
  },
  
  bindMediaEvents: function() {
    this.calculateImageRatios();
    $(".media-listing-item").hoverIntent(
      function(){$(this).toggleClass("hovered");},
      function(){$(this).toggleClass("hovered");}
    );
  },
  
  calculateImageRatios: function() {
    $(".media-listing-item img").each(function(){
      var width = $(this).width();
      var height = $(this).height();
      var ratio = width/height;
      if(ratio<0.5) $(this).addClass("ratio_p_high");
      else if(ratio<0.7) $(this).addClass("ratio_p_med");
      else if(ratio<1) $(this).addClass("ratio_p");
      else if(ratio<2) $(this).addClass("ratio_l");
      else if(ratio<4) $(this).addClass("ratio_l_med");
      else $(this).addClass("ratio_l_high");
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

