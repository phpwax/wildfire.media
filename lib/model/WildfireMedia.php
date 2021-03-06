<?
class WildfireMedia extends WaxModel{

  public static $allowed = array(); //file types allowed ('jpg'=>'ClassName') - upstream;
  public static $classes = array();
  public static $status_options = array('0'=>'pending', 1=>'processed');
  public function setup(){
    $this->define("media_class", "CharField", array('group'=>'media preview','widget'=>"HiddenInput",'primary_group'=>1));
    $this->define("title", "CharField", array('required'=>true, 'scaffold'=>true, 'group'=>"media preview", 'primary_group'=>1));
    $this->define("content", "TextField", array()); //description

    $this->define("file_type", "CharField", array('scaffold'=>true, 'editable'=>false)); //thats the mime type
    $this->define("ext", "CharField", array('editable'=>false));
    /**
     * the source is used as where media sits
     * - file it would be the path relative from public_dir
     * - flickr it would be the image id etc
     */
    $this->define("source", "CharField", array('editable'=>false));
    $this->define("uploaded_location", "CharField", array('editable'=>false));
    $this->define("status", "IntegerField", array('widget'=>'SelectInput', 'choices'=>self::$status_options, 'editable'=>false));
    $this->define("hash", "CharField", array('editable'=>false)); //md5 hash of file contents


    $this->define("media_type", "CharField", array('editable'=>false)); //friendly name of the media class - Local storage / youtube etc
    if(class_exists("WildfireUser", false)){
      $this->define("user", "ForeignKey", array('target_model'=>'WildfireUser', 'editable'=>false));
    }
    if(class_exists("WildfireCategory", false)){
      $this->define("categories", "ManyToManyField", array('target_model'=>"WildfireCategory","eager_loading"=>true, "join_model_class"=>"WaxModelOrderedJoin", "join_order"=>"join_order", 'scaffold'=>true, 'group'=>'relationships', 'info_preview'=>1));
    }
    $this->define("date_created", "DateTimeField", array('editable'=>false));
    $this->define("date_modified", "DateTimeField", array('editable'=>false));
    $this->define("sync_location", "CharField", array('editable'=>false));
    $this->define("migration_id", "IntegerField", array('editable'=>false));
    //new field for tagging them on upload
    $this->define("event_timestamp", "CharField");
    $this->define("event_name", "CharField");

    $this->define("pre_rendered", "BooleanField", array('editable'=>false));
    $this->define("crop_x_1", "IntegerField", array("widget"=>"HiddenInput", "group"=>"media preview", "primary_group"=>1));
    $this->define("crop_y_1", "IntegerField", array("widget"=>"HiddenInput", "group"=>"media preview", "primary_group"=>1));
    $this->define("crop_x_2", "IntegerField", array("widget"=>"HiddenInput", "group"=>"media preview", "primary_group"=>1));
    $this->define("crop_y_2", "IntegerField", array("widget"=>"HiddenInput", "group"=>"media preview", "primary_group"=>1));
    parent::setup();
  }


  public function preview(){
    return $this->render(40);
  }
  public function render($width=false, $title=false, $class="attached_media"){
    $obj = new $this->media_class;
    return $obj->render($this, $width, $title, $class);
  }

  public function permalink($width=false){
    $obj = new $this->media_class;
    return $obj->get($this, $width);
  }
  public function show($width=false){
    $obj = new $this->media_class;
    return $obj->show($this, $width);
  }

  public function before_save(){
    parent::setup();
    if(!$this->title && $this->columns['title']) $this->title = "Media Item";
    if(!$this->date_created && $this->columns['date_created']) $this->date_created = date("Y-m-d H:i:s");
    if($this->columns['date_modified']) $this->date_modified = date("Y-m-d H:i:s");
    $old = clone $this;
    $old = $old->clear()->first();
    if($old->crop_x_1 != $this->crop_x_1 || $old->crop_x_1 != $this->crop_x_1 || $old->crop_x_1 != $this->crop_x_1 || $old->crop_x_1 != $this->crop_x_1){
      $obj = new $this->media_class;
      $obj->clear_cache($this);
    }
  }

  public function scope_files(){
    return $this->filter("media_type", "Local storage")->filter("file_type NOT LIKE 'image%' AND file_type != 'directory'");
  }
  public function scope_live(){
    return $this;
  }
  public function scope_admin(){
    return $this->filter("status", "-1", "!=");
  }

  public function file_meta_set($primval, $fileid, $tag, $order=0, $title='', $table, $primary_key){
    $model = new WaxModel;
    if($table < $this->table) $model->table = $table."_".$this->table;
    else $model->table = $this->table."_".$table;

    $col = $table."_".$primary_key;
    if(!$order) $order = 0;
    if(($found = $model->filter($col, $primval)->filter($this->table."_id", $fileid)->all()) && $found->count()){
      foreach($found as $r){
        $sql = "UPDATE `".$model->table."` SET `join_order`=$order, `tag`='$tag', `title`='$title' WHERE `id`=$r->primval";
        $model->query($sql);
      }
    }else{
      $sql = "INSERT INTO `".$model->table."` (`".$this->table."_id`, `$col`, `join_order`, `tag`, `title`) VALUES ('$fileid', '$primval', '$order', '$tag', '$title')";
      $model->query($sql);
    }
  }

  public function file_meta_get($primval, $fileid, $tag, $table, $primary_key){
    $model = new WaxModel;
    if($table < $this->table) $model->table = $table."_".$this->table;
    else $model->table = $this->table."_".$table;
    $col = $table."_".$primary_key;
    if($fileid) return $model->filter($col, $primval)->filter($this->table."_id", $fileid)->order('join_order ASC')->first();
    elseif($tag=="all") return $model->filter($col, $primval)->order('join_order ASC')->all();
    elseif($tag) return $model->filter($col, $primval)->filter("tag", $tag)->order('join_order ASC')->all();
    else return false;
  }

  public function event_names(){
    $data = array();
    foreach($this->group("event_name")->filter("LENGTH(event_name) > 0")->all() as $r) $data[] = $r->event_name;
    return $data;
  }
  public function name_event($timestamp, $name) {
    $media = new WildfireMedia;
    $items = $media->filter("event_timestamp",$timestamp)->all();
    foreach($items as $item) $item->update_attributes(array("event_name"=>$name));
  }

  public function upload($stream, $options = array()) {
    $handler_class = $this->get_handler($stream);
    $handler = new $handler_class;
    $meta = $handler->upload($stream, $options);
    if(isset($options["filename"])) unset($options["filename"]);

    // Upload failed, return false now
    if(!$meta) return false;

    // Continue and create the new media object
    $meta = array_merge($options, $meta);
    $object = new WildfireMedia();
    $object->set_attributes($meta);
    return $object;
  }



  public function get_handler($filename) {
    $ext = (substr(strrchr($filename,'.'),1));
    $check = strtolower($ext);
    //find the class associated with that file
    $setup = WildfireMedia::$allowed;
    if($setup[$check]) return $setup[$check];
    return "WildfireDiskFile";
  }

  public function get_collections() {
    $media = new WildfireMedia;
    return $media->group("event_name")->all();
  }

  public function get_operations($permissions,$join_ids){
    $operations = $permissions;

    if($this->media_class){
      $media = new $this->media_class;
      if($media->operations) foreach($media->operations as $operation) $operations[$operation] = 1;
    }
    if($join_ids && count($join_ids) && in_array($this->primval,$join_ids)) $operations["remove"] = 1;
    elseif($join_ids) $operations["add"] = 1;

    return $operations;
  }

  public function operation($name, $x){
    if($name == "link") return "<a href='/".$this->source."' class='button operation operation_link'><b class='entypo-icon'></b></a>";
  }

}
