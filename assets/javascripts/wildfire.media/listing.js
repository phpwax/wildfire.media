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


  load: function(replace) {
    var controller = this;
    $.ajax({
      url: "/admin/media/filter",
      type: "GET",
      dataType: "html",
      data: controller.getParams(),
      complete: function(){
        //called when complete
      },
      success: function(response) {
        if(replace) $(".media-listing-wrapper").html(response);
		else if(controller.append) {
          $(".page-marker").remove();
          $(".media-listing-wrapper").append(response);
        } else $(".media-listing-wrapper").html(response);
        controller.bindMediaEvents();
        controller.append = true;
        $(window).bind("scroll.infiniteScroll",function(){
          controller.infiniteScroll(controller);
        });
     },
      error: function() {
        $(window).bind("scroll.infiniteScroll",function(){
          controller.infiniteScroll(controller);
        });
      }
    });
  },
  
  getParams: function() {
    var filter = $(".media-filter-block .search-filter input").val(),
        collection = $(".media-filter-block #collection_filter").select2("val"),
        mode = $('.media-filter-block .view-switch a').data("mode"),
        data = {"filter":filter, "collection":collection, "mode":mode, page:this.page};
    if((embed = $(".media-filter-block").parents(".embedded-media-listing")) && embed.length){
      data.join_class = embed.attr("data-join-class");
      data.join_id = embed.attr("data-join-id");
      data.join_field = embed.attr("data-join-field");
    }
    return data;
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
    var data = this.getParams();
    if(data.mode == "time") this.enableTimeMode();
    if(data.filter.length > 1 ) $(".media-filter-block .search-filter input").val(data.filter);
    if(data.collection) {
      $(".media-filter-block #collection_filter").select2("val",data.collection);
    }
  },

  enableTimeMode: function() {
    $('.media-filter-block .view-switch a').toggleClass("selected");
  },

  disableTimeMode: function() {
    $('.media-filter-block .view-switch a').toggleClass("selected");
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
    
    $(window).bind("scroll.infiniteScroll",function(){
      controller.infiniteScroll(controller);
    });

    $(".media-filter-block .search-submit").click(function(e){
      controller.page = 1;
      controller.encodeState();
      controller.load(true);
      e.preventDefault();
    });

    $(".media-filter-block .collection-filter #collection_filter").change(function(e){
      controller.page = 1;
      controller.encodeState();
      e.preventDefault();
      controller.load(true);
    });

    $(".media-filter-block .view-switch a").click(function(e){
      console.log("CLICKED")
      controller.page = 1;
      controller.encodeState();
      controller.load(true);
      e.preventDefault();
    });

  },

  setupUI: function() {
    $(".media-filter-block b").tooltip();
    $('.media-filter-block .dropdown-toggle').dropdown();
    $("select.collection-dropdown").select2({allowClear: true});
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
  
  infiniteScroll: function(controller) {
    if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
      $(window).unbind("scroll.infiniteScroll");
      var last_page_marker = $(".media-listing-container .page-marker:last");
          current = last_page_marker.data("current-page");

      if(current < last_page_marker.data("total-pages")){
        controller.page = current + 1;
        controller.load();
      }
    }
  }
  
};


jQuery(document).ready(function() {
  wildfire_media.init();

});

