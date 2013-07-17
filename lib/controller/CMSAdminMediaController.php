<?
class CMSAdminMediaController extends AdminComponent{
  public $uploads = true;
  public $dashboard = false;
  public $per_page = 30;
  public $preview_hover = true;
  public $module_name = "media";
  public $model_class="WildfireMedia";
  public $model_scope = "admin";
  public $display_name = "Media";
  public $singular = "Item";
  public $sync_partial = "_media_class_list";
  public $sync_class = false;
  public $sync_locations = array();

  public $has_help = array("index", "edit");
  public $filter_fields=array(
                          'text' => array('columns'=>array('hash', 'title', 'content', 'id'), 'partial'=>'_filters_text', 'fuzzy'=>true),
                          'collection' => array('columns'=>array('event_name'), 'partial'=>'_filter_collections'),
                          'view' => array('columns'=>array('collection'), 'partial'=>'_filter_viewswitch')
                        );

  public $operation_actions = array('edit');
  public function events(){
    WaxEvent::add("cms.model.columns", function(){
      $obj = WaxEvent::data();
      $obj->scaffold_columns['preview'] = true;
      $obj->detect_mode();
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
    WaxEvent::run("cms.index.setup", $this);
  }


  public function _filter_block() {
    $this->detect_mode();

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

  public function detect_mode() {
    if(Request::get("mode")== "standard") $this->mode = "standard";
    if(Request::get("mode")== "time") {
      $this->mode = "time";
      $this->model->select_columns = "*, MONTHNAME(date_created) as month, YEAR(`date_created`) as year";
      $this->model->order("date_created DESC");
    }
  }


}
