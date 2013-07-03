var wm_timer = false;
var wildfire_media = {

  page: 1,
  append: true,


  init: function() {
    if(!$(".media-listing-wrapper").length) return;
    this.setupUI();
    this.bindEvents();
    this.bindMediaEvents();
    var controller = this;
    window.addEventListener('popstate', function(e){
      controller.restoreState(e.state);
    });

  },


  load: function(replace) {
    var controller = this;
    $.ajax({
      url: "/admin/media/index.ajax?page="+controller.page,
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
    var filter = $(".filters-media .text_field").val(),
        collection = $(".collection-filter select").select2("val"),
        mode = $('.view-switch a').data("mode"),
        data = {
          filters:{
            text:filter,
            collection:collection
          },
          mode:mode
        }
        ;
    if((embed = $(".filters-media").parents(".embedded-media-listing")) && embed.length){
      data.join_class = embed.attr("data-join-class");
      data.join_id = embed.attr("data-join-id");
      data.join_field = embed.attr("data-join-field");
    }
    return data;
  },

  encodeState: function() {
    var ret = [],
          data =  this.getParams()
          ;
    if(data.filters && data.filters.text) ret.push("filters[text]="+encodeURIComponent(data.filters.text) );
    if(data.filters && data.filters.collection) ret.push("filters[collection]="+encodeURIComponent(data.filters.collection) );
    if(data.mode) ret.push("mode="+encodeURIComponent(data.mode) );

    history.pushState(data, "", "?"+ret.join("&"));
  },

  restoreState: function(state) {
    var data = (state) ? state : this.getParams(),
          controller = this;

    if(data.mode == "time") this.enableTimeMode();
    if(data.filters.text.length > 1 ) $(".filters-media .text_field").val(data.filters.text);
    if(data.filters.collection) $(".collection-filter select").select2("val",data.filters.collection);

  },

  enableTimeMode: function() {
    $('.view-switch a').toggleClass("selected");
  },

  disableTimeMode: function() {
    $('.view-switch a').toggleClass("selected");
  },

  bindEvents: function() {
    var controller = this;
    $('.media-filter-block .dropdown-menu a').click(function(){
      var toggler = $(this).parents(".btn-group").find(".dropdown-toggle .collection");
      toggler.data("value", $(this).text());
      toggler.text($(this).text());
    });

    $("form fieldset.filters_container").find("input, select").unbind("change keyup keydown").bind("change keyup", function(e){
      e.preventDefault();
      e.stopPropagation();

      clearTimeout(wm_timer);
      wm_timer = setTimeout(function(){
        controller.page = 1;
        controller.encodeState();
        controller.load(true);
      }, 400);

    });

    $('.view-switch a').click(function(e){
      clearTimeout(wm_timer);
      $(this).toggleClass("selected");
      $(this).data('mode', $(this).data('mode') == 'time' ? 'standard' : 'time');
      controller.page = 1;
      controller.encodeState();
      controller.load(true);
      e.preventDefault();
    });

    $(window).bind("scroll.infiniteScroll",function(){
      controller.infiniteScroll(controller);
    });
  },

  setupUI: function() {
    $(".filters_container b").tooltip();
    $('.filters-media .dropdown-toggle').dropdown();
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

