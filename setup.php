<?
CMSApplication::register_module("media", array("display_name"=>"Media", "link"=>"/admin/media/", 'split'=>true));

AutoLoader::register_view_path("plugin", __DIR__."/view/");
AutoLoader::register_controller_path("plugin", __DIR__."/lib/controller/");
AutoLoader::register_controller_path("plugin", __DIR__."/resources/app/controller/");
AutoLoader::$plugin_array[] = array("name"=>"wildfire.media","dir"=>__DIR__);


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