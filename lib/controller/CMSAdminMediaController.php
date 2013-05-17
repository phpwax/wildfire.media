<?
class CMSAdminMediaController extends AdminComponent{
  public $uploads = true;
  public $dashboard = false;
  public $per_page = 1000000;
  public $preview_hover = true;
  public $module_name = "media";
  public $model_class="WildfireMedia";
  public $model_scope = "admin";
  public $display_name = "Media";
  public $singular = "Item";
  public $sync_partial = "_media_class_list";
  public $sync_class = false;
  public $sync_locations = array();

  public $filter_fields=array(
                          'text' => array('columns'=>array('hash', 'title', 'content'), 'partial'=>'_filters_text', 'fuzzy'=>true),
                          'media_type' => array('columns'=>array('media_type'), 'partial'=>'_filters_grouped_column'),
                          'categories' => array('columns'=>array('categories'), 'partial'=>'_filters_select', 'opposite_join_column'=>'media')
                        );

  public $operation_actions = array('edit', 'download', 'add');
  public function events(){
    WaxEvent::add("cms.model.columns", function(){
      $obj = WaxEvent::data();
      $obj->scaffold_columns['preview'] = true;
    });
    parent::events();

    WaxEvent::add("cms.layout.sublinks", function(){
      $obj = WaxEvent::data();
      $mods = CMSApplication::get_modules();
      $obj->quick_links = array('sync'=>"/".trim($obj->controller, "/")."/sync/");
    });

    WaxEvent::add('cms.sync.class', function(){
      $obj = WaxEvent::data();
      if($class = Request::param('sync_class')){
        $obj->sync_partial = "_media_location_list";
        $obj->sync_class = $class;
      }
    });

    WaxEvent::add("cms.sync.location", function(){
      $obj = WaxEvent::data();
      if($locations = Request::param('sync_locations')){
        $class = new $obj->sync_class;
        $obj->sync_partial = "_media_sync_in_progress";
        $sync_locations = $class->sync_locations();
        foreach($locations as $k=>$i) $obj->sync_locations[$k] = $sync_locations[$k];
      }
    });

    WaxEvent::add("cms.sync.run", function(){
      $obj = WaxEvent::data();
      if($location = Request::param('sync_location')){
        $class = new $obj->sync_class;
        $obj->use_layout = false;
        $obj->use_view = "_media_sync_progress";
        $obj->sync_partial = "";
        $obj->synced = $class->sync($location);
      }
    });

  }

  //file system sync tool
  public function sync(){
    WaxEvent::run("cms.sync.class", $this);
    WaxEvent::run("cms.sync.location", $this);
    WaxEvent::run("cms.sync.run", $this);
  }
  
  
  public function embedded() {
    $this->use_layout=false;
    WaxEvent::run("cms.index.setup", $this);
    $this->view_mode = "embedded";
  }
  
  public function filter() {
    WaxEvent::run("cms.index.setup", $this);
    $this->use_layout = false;
    $this->use_view = "_list";
    $this->model = new $this->model_class("live");
    
    if(get("page")) $page = get("page");
    else $page =1;
    $this->detect_mode();
    
    
    if(get("collection",true) && get("collection")!="Show All") $this->model->filter("event_name",get("collection"));
    if(get("filter",true)) $this->model->filter("title","%".get("filter")."%","LIKE");
    if(($join_class = get("join_class")) && ($join_id = get("join_id")) && ($join_field = get("join_field"))){
      $existing_media = new $join_class($join_id);
      $this->existing_media = $existing_media->$join_field;
    }
    
    
    $this->cms_content = $this->model->page($page, 18);
    $this->overall_total = $this->cms_content->total_without_limits();
  }
  
  
  public function _filter_block() {
    $this->detect_mode();
    $this->detect_filters();
    $this->detect_collection();
  }

  public function _existing_media(){
    //if called directly setup the needed data
    if($this->action == "_existing_media"){
      $model_class = Request::param("join_class");
      $this->use_layout = false;
      $source = new $model_class;
      $col_data = $source->get_col($this->field = Request::param("field"));
      $this->media = new $col_data->target_model(Request::param("target_id"));
      $this->extra_fields_view = $col_data->extra_fields_view;
    }
  }
  
  protected function detect_filters() {
    if(get("filter",true)) $this->search_filter = get("filter",true);
  }
  
  protected function detect_collection() {
    if(get("collection",true) && get("collection")!="Show All") $this->collection_value = get("collection",true);
  }

  
  protected function detect_mode() {
    if(get("mode")== "standard") $this->mode = "standard";
    if(get("mode")== "time") {
      $this->mode = "time";
      $this->model->select_columns = "*, MONTHNAME(date_created) as month, YEAR(`date_created`) as year";
      $this->model->order("date_created DESC");
    }
  }


}
