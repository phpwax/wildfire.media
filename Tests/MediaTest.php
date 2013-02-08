<?php


class MediaTest extends \PHPUnit_Framework_TestCase {

  public function setup() {

  }
  
  public function teardown() {
    
  }
  
  /**
   * 
   *
   **/
  
  public function test_upload_from_file() {
    $media = new WildfireMedia;
    $file = __DIR__."/resources/test_resource.jpg";
    $options["destination"] = __DIR__."/";
    $new_media = $media->upload($file, $options);
    $this->assertEquals($new_media->uploaded_location, __DIR__."/test_resource.jpg");
    $this->assertEquals($new_media->title, "test_resource");
    $this->assertEquals($new_media->file_type, "image/jpeg");
    $this->assertEquals($new_media->ext, "jpg");
    unlink($new_media->uploaded_location);
  }
  
  public function test_upload_from_data() {
    $media = new WildfireMedia;
    $file = "A Random String File";
    $options["destination"] = __DIR__."/";
    $new_media = $media->upload($file, $options);
    $this->assertEquals($new_media->file_type, "text/plain");
    unlink($new_media->uploaded_location);
  }
  
  
}
  
