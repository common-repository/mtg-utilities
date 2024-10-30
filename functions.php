<?php
/*
These functions are hooks of action / filter. Such as modifying posts before rendering shortcodes.

Ex. convert mana codes in brackets {R} into [mana]R[/mana].

//*/

class mtg_util_filters{

	// add actions and filters in constructor
	function __construct() {
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);

		if ($mtg_util_options['enable_replace_brackets'] == '1') {
			add_filter('the_content', array($this, 'replace_mana_brackets'), 99);
			add_filter('the_excerpt', array($this, 'replace_mana_brackets'), 99);
		}

	} //end __construct

	function replace_mana_brackets($content) {
		// replace mana codes inside curly brackets { }
		// with shortcodes [mana] [/mana], respectively

			$content = str_replace('{', '[mana]', $content);
			$content = str_replace('}', '[/mana]', $content);
			$content = do_shortcode($content);
			
		return $content;
	}

} //end mtg_util_filters
$mtg_util_filters = new mtg_util_filters();
?>
