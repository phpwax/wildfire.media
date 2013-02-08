<?php
error_reporting(247);
require __DIR__."/../vendor/autoload.php";
spl_autoload_register(function ($class) {
    if (file_exists($file = __DIR__.'/../lib/controller/'.$class.'.php')) {
      require_once $file;
    }
    if (file_exists($file = __DIR__.'/../lib/model/'.$class.'.php')) {
      require_once $file;
    }
});