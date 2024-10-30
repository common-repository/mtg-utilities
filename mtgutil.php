<?php
	/*
	Plugin Name: MTG Utilities
   Plugin URI: https://ieants.cc/wp/mtg-utilities-overview/
   Description: Magic: the Gathering utility functions, including mana symbols, autocard, and decklists.
   Version: 2.3
   Author: Xay Voong
   Author URI: https://ieants.cc/wp/
   License: GPL2
   */

/* DEFINE PLUGIN NAMESPACES */
//display name for end user
define('MTG_UTIL_NAME', 'MTG Utilities');
//prefix for reuse
define('MTG_UTIL_PREFIX', 'mtgutil_');
//name of options stored in WordPress DB
define('MTG_UTIL_OPTIONS', '_mtgutil_options');

 /*
 INCLUDE other files that come with the plugin
 //*/

require_once('admin-options.php');
require_once('functions.php');
require_once('shortcodes.php');
require_once('quicktags.php');
require_once('comments.php');

 function mtg_util_css()
 {
 	wp_register_style(MTG_UTIL_PREFIX, plugins_url(MTG_UTIL_PREFIX . '.css', __FILE__));
 	wp_enqueue_style(MTG_UTIL_PREFIX);
}

function mtg_util_scripts() {
	wp_enqueue_script( 'autocard_mtg', plugins_url( "autocard_mtg.user.js", __FILE__ ));
}

add_action('wp_enqueue_scripts', 'mtg_util_css');
add_action('wp_enqueue_scripts', 'mtg_util_scripts');

?>