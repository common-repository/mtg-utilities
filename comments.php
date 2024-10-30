<?php
/*
	http://codex.wordpress.org/Plugin_API/Filter_Reference#Comment.2C_Trackback.2C_and_Ping_Filters
	http://hookr.io/filters/comment_text/
	https://core.trac.wordpress.org/browser/tags/4.2.2/src/wp-includes/shortcodes.php#L0
	http://php.net/manual/en/function.preg-replace-callback.php
//*/


class mtg_util_comments{

	//add actions and filters in constructor
	function __construct(){
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);
		if ($mtg_util_options['enable_comments_shortcodes'] == '1') {
			add_filter('comment_text', array($this, 'parse_comment'));
		}

	}//end __construct

	function parse_comment($comment) {

			// get pattern from get_shortcode_regex() and strip non-mtg tags
			$pattern = '\[(\[?)(card|deck|mana)(?![\w-])([^\]\/]*(?:\/(?!\])[^\]\/]*)*?)(?:(\/)\]|\](?:([^\[]*+(?:\[(?!\/\2\])[^\[]*+)*+)\[\/\2\])?)(\]?)';

			// run shortcode as found in mtgutil/shortcodes.php
			return preg_replace_callback( "/$pattern/s", 'do_shortcode_tag', $comment );
	}//end parse_comment

}//end mtg_util_comments
$mtg_util_comments = new mtg_util_comments();
?>