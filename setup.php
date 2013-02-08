<?
CMSApplication::register_module("media", array("display_name"=>"Media", "link"=>"/admin/media/", 'split'=>true));
CMSApplication::register_asset("wildfire", "js", "wildfire-content");


if(defined("CONTENT_MODEL")){
  WaxEvent::add(CONTENT_MODEL.".setup", function(){
    $model = WaxEvent::data();
    if(!$model->columns['media']) $model->define("media", "ManyToManyField", array('target_model'=>'WildfireMedia', 'group'=>'media'));
  });
}

CMSApplication::$handlers['media'][] = 'WildfireMedia';
//add in a global partial that will be loaded in on every page to handle uploads
CMSApplication::$global_partials[] = "_upload_block";

WildfireMedia::$classes[] = 'WildfireDiskFile';
//set the default media types for uploads
WildfireMedia::$allowed  = array(
                            'jpg'=>'WildfireDiskFile',
                            'jpeg'=>'WildfireDiskFile',
                            'JPG'=>'WildfireDiskFile',
                            'png'=>'WildfireDiskFile',
                            'gif'=>'WildfireDiskFile',
                            'txt'=>'WildfireDiskFile',
                            'doc'=>'WildfireDiskFile',
                            'xls'=>'WildfireDiskFile',
                            'zip'=>'WildfireDiskFile',
                            'pdf'=>'WildfireDiskFile',
                            'webp'=>'WildfireDiskFile'
                          );

?>