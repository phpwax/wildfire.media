<?
AutoLoader::register_assets("javascripts/wildfire.media",__DIR__."/assets/javascripts/wildfire.media", "/*.js");
AutoLoader::register_assets("stylesheets/wildfire.media",__DIR__."/assets/stylesheets/wildfire.media", "/*.css");
AutoLoader::register_view_path("plugin", __DIR__."/view/");
AutoLoader::register_controller_path("plugin", __DIR__."/lib/controller/");
AutoLoader::register_controller_path("plugin", __DIR__."/resources/app/controller/");
AutoLoader::$plugin_array[] = array("name"=>"wildfire.media","dir"=>__DIR__);

AutoLoader::add_plugin_setup_script(__DIR__."/setup.php");
?>