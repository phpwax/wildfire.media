<?
AutoLoader::register_assets("javascripts/wildfire.media",__DIR__."/assets/javascripts/", "/*.js");

AutoLoader::register_view_path("plugin", __DIR__."/view/");
AutoLoader::add_plugin_setup_script(__DIR__."/setup.php");
?>