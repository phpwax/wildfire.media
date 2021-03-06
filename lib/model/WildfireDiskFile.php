<?
class WildfireDiskFile{

  public static $hash_length = 6;
  public static $name = "Local storage";
  public $operations = array("download", "link");
  /**
   * this should handle the saving of the media to the disc
   **/
  public function set($media_item){
    if($media_item){
      //set to 0, so unpublished
      $media_item->update_attributes(array('status'=>0));
      //the disk file has very little to do, just update with information about the file:
      $file = PUBLIC_DIR.$media_item->uploaded_location;
      if(is_readable($file)) return $media_item->update_attributes(array('status'=>1, 'source'=>$media_item->uploaded_location, 'media_class'=>get_class($this), 'media_type'=>self::$name));
    }
    return false;
  }

  private function cache_dir(){return CACHE_DIR."images/";}
  private function apache_cache_dir(){return PUBLIC_DIR."m/";}

  private function hash($media_item){
    if(WildfireDiskFile::$hash_length) return substr($media_item->hash, 0, WildfireDiskFile::$hash_length);
    return $media_item->hash;
  }

  private function crop_ident($media_item){
    foreach(array("crop_x_1", "crop_y_1", "crop_x_2", "crop_y_2") as $field) if(!is_numeric($ret[] = $media_item->$field)) return false;
    return implode("x", $ret);
  }

  //should return a url to display the image
  public function get($media_item, $size=false){
    $hash = $this->hash($media_item);
    //if its not an image, return the normal url anyway
    if($size === false || !strstr($media_item->file_type, "image")) return "/".trim($media_item->source, "/");
    //we'll make a new controller called M (for media) which will simply map things smartly
    else {
      $crop = $this->crop_ident($media_item);
      return "/m/".$hash."/".$size.".".$media_item->ext.($crop ? "?".$crop : "");
    }
  }

  //this will actually render the contents of the image
  public function show($media_item, $size=false){
    //if its not an image, then spit out the file contents with correct headers
    if(!strstr($media_item->file_type, "image") || $size == "full") return File::display_asset(PUBLIC_DIR.$media_item->source, $media_item->file_type);
    if(!$size) $size = 100; //default size

    $hash = $this->hash($media_item);

    $source = PUBLIC_DIR.$media_item->source;
    $dir = $this->cache_dir().$hash."/";
    $apache_dir = $this->apache_cache_dir().$hash."/";
    $cache_file = $dir . $size .".".$media_item->ext;
    $apache_file = $apache_dir . $size .".".$media_item->ext;
    if(!is_readable($dir)) mkdir($dir, 0777, true);
    if(!is_readable($apache_dir)) mkdir($apache_dir, 0777, true);

    if($this->crop_ident($media_item)){
      $cropped_file = "{$dir}pre_crop_".$this->crop_ident($media_item).".$media_item->ext";
      if(!is_readable($cropped_file)) File::crop_image($source, $cropped_file, $media_item->crop_x_1, $media_item->crop_y_1, $media_item->crop_x_2 - $media_item->crop_x_1, $media_item->crop_y_2 - $media_item->crop_y_1);
      $source = $cropped_file;
    }

    if(!is_readable($cache_file) && is_writable($dir)) File::smart_resize_image($source, $cache_file, $size, false, "nocrop");
    if(!is_readable($apache_file) && is_writable($apache_dir)) File::smart_resize_image($source, $apache_file, $size, false, "nocrop");

    if(is_readable($cache_file)) File::display_image($cache_file);
    elseif(is_readable($apache_file)) File::display_image($apache_file);
    else throw new WaxException("Couldn't serve asset, please check if the cache folder are writable. By the way you look handsome today.");
  }

  public function clear_cache($media_item){
    $hash = $this->hash($media_item);
    $dir = $this->cache_dir().$hash."/*";
    $apache_dir = $this->apache_cache_dir().$hash."/*";
    array_map("unlink", glob($dir));
    array_map("unlink", glob($apache_dir));
  }

  //generates the tag to be displayed - return generic icon if not an image
  public function render($media_item, $size, $title="preview", $class=""){
    if(!strstr($media_item->file_type, "image")) return "<img src='/images/wildfire/icons/document.png' alt='".$title."' class='".$class."'>";
    else return "<img src='".$this->get($media_item, $size)."' alt='".$title."' class='".$class."'>";
  }

  //find the folders on the file system to sync with
  public function sync_locations(){
    $locations = array();
    $folder = PUBLIC_DIR ."files/";
    $dir = new RecursiveIteratorIterator(new RecursiveRegexIterator(new RecursiveDirectoryIterator($folder, RecursiveDirectoryIterator::FOLLOW_SYMLINKS), '#^[^\.]*$#i'), true);
    foreach($dir as $file){
      $path = $file->getPathName();
      $locations[$path] = array('value'=>str_replace(PUBLIC_DIR, "", $path), 'label'=>basename($path));
    }
    return $locations;
  }
  /**
   * a sync option will be added to the cms via event
   * that page will let you pick what sync types are allowed (ie a drop down of classes -> self::$name)
   * the called event (cms.$model.sync.$x) will return set of options to sync with (file system would be folder, flickr would be sets etc)
   * the confirmed sync will then run this
   */
  public function sync($location){
    $info = array();
    $ids = array();
    $folder = PUBLIC_DIR ."/".$location;
    $exts = array();
    $class = get_class($this);
    foreach(WildfireMedia::$allowed as $e=>$c) if($c == $class) $exts[] = $e;
    $extstr = "(".implode("|", $exts).")";
    $dir = new RecursiveIteratorIterator(new RecursiveRegexIterator(new RecursiveDirectoryIterator($folder, RecursiveDirectoryIterator::FOLLOW_SYMLINKS), '#(?<!/)\.'.$extstr.'$|^[^\.]*$#i'), true);
    foreach($dir as $file){
      $media = new WildfireMedia;
      $path = $file->getPathName();
      $source = str_replace(PUBLIC_DIR, "", $path);
      $ext = strtolower(substr(strrchr($path,'.'),1));
      if($found = $media->filter("source", $source)->first()){
        $found = $found->update_attributes(array('status'=>1));
      }else{
        $found = $media->update_attributes(array('source'=>$source,
                                                  'uploaded_location'=>$source,
                                                  'status'=>1,
                                                  'sync_location'=>$location,
                                                  'media_class'=>$class,
                                                  'media_type'=>self::$name,
                                                  'ext'=>$ext,
                                                  'file_type'=>mime_content_type($path),
                                                  'title'=>basename($path),
                                                  'hash'=> hash_hmac('sha1', $data, md5(file_get_contents($path)) )
                                                  ));
      }
      $ids[] = $found->primval;
      $info[] = $found;
    }

    //now look at the db for ones that might be missing
    $media = new WildfireMedia;
    foreach($ids as $i) $media->filter("id", $i, "!=");
    foreach($media->filter("status", 1)->filter("media_class", $class)->filter("sync_location", $location)->all() as $r) if(!is_readable(PUBLIC_DIR.$r->source)) $r->update_attributes(array('status',-1));

    return $info;
  }


  /**
   * Takes a file stream and additional options to upload a new file
   *
   * @param string $stream / detects filename, stream, data
   * @param string $options ("destination","file_type")
   * @return created object
   */
  public function upload($stream, $options = array()) {
    if(is_file($stream)) {
      $file_data = file_get_contents($stream);
      $filename = $options["filename"] ?: basename($stream);
    } elseif(is_string($stream) && strlen($stream) > 1) {
      $file_data = $stream;
      $filename = $options["filename"] ?: time().rand(0,99);
    }

    if($filename && $file_data) {
      if(!$options["destination"]) $options["destination"] = dirname($this->generate_fs_path($filename))."/";
      $final_location = $options["destination"].$filename;
      $success = file_put_contents($final_location , $file_data);
      if($success) {
        return $this->get_meta($filename, $file_data, $final_location);
      }
    }
    return false;
  }

  public function get_meta($filename, $data, $final_location) {
    $meta["title"] = basename($filename, ".".$this->get_extension($filename));
    $meta["file_type"] = $this->get_filetype($data);
    $meta["media_class"] = get_class($this);
    $meta["hash"] = hash_hmac('sha1', $data, md5($data));
    $meta["ext"] = $this->get_extension($filename);
    $meta["uploaded_location"] = str_replace(PUBLIC_DIR, "", $final_location);
    $meta["source"] = $meta["uploaded_location"];
    $meta["status"] = 1;
    return $meta;
  }

  public function generate_fs_path($filename) {
    $path = PUBLIC_DIR. "files/".date("Y-m-W")."/";
    if(!is_dir($path)) mkdir($path, 0777, true);
    $filename = File::safe_file_save($path, $filename);
    return $path.$filename;
  }

  public function get_filetype($data) {
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    return $finfo->buffer($data);
  }

  public function get_extension($filename) {
    return pathinfo($filename, PATHINFO_EXTENSION);
  }




}