<?php
/*
https://codex.wordpress.org/Shortcode_API
// [bartag foo="foo-value"]
function bartag_func( $atts ) {
	extract( shortcode_atts( array(
		'foo' => 'something',
		'bar' => 'something else',
	), $atts ) );

	return "foo = {$foo}";
}
add_shortcode( 'bartag', 'bartag_func' );

Three parameters are passed to the shortcode callback function. You can choose to use any number of them including none of them.
$atts - an associative array of attributes, or an empty string if no attributes are given
$content - the enclosed content (if the shortcode is used in its enclosing form)
$tag - the shortcode tag, useful for shared callback functions

//*/

$MTG_UTIL_DEFAULT_OPTIONS_DECK_TITLE = 'My Deck';
$MTG_UTIL_DEFAULT_OPTIONS_DECK_REGEX = '/^\s*(\/\/.*|SB:\s*)?(?:x?(?=\d))?(\d+(?=\s*)?\-?(?=\s*)?\d*)?\s*(\s?x |\*|\[\w+?])?\s*([^{]*?)\s*?({.*}|--.*)?\s*$/';
$MTG_UTIL_DEFAULT_OPTIONS_AUTOCARD_URL = 'https://scryfall.com/search?as=grid&order=name&q=!"';
$MTG_UTIL_DEFAULT_OPTIONS_IMAGE_URL = 'http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=';
$autocard_url = $MTG_UTIL_DEFAULT_OPTIONS_AUTOCARD_URL;
$MTG_UTIL_DEFAULT_OPTIONS_MANA_REGEX = "/(([wubrgpc]\/[wubrgpc]\/[wubrgpc])|([2wubrgpc]\/[2wubrgpc])|[0-9]+|[a-z])/";
$MTG_UTIL_DEFAULT_OPTIONS_TRIBRID_REGEX = "/[wubrgpc]\/[wubrgpc]\/[wubrgpc]/";
$MTG_UTIL_DEFAULT_OPTIONS_MANA_REPLACE = ";$1;";
$MTG_UTIL_DEFAULT_OPTIONS_MANA_TRUE = array(
	'c' => 'c', 'w' => 'w', 'u' => 'u', 'b' => 'b', 'r' => 'r', 'g' => 'g',
	'w/u' => 'wu', 'u/w' => 'wu', 'u/b' => 'ub', 'b/u' => 'ub', 'b/r' => 'br', 'r/b' => 'br', 'r/g' => 'rg', 'g/r' => 'rg', 'g/w' => 'gw', 'w/g' => 'gw',
	'w/b' => 'wb', 'b/w' => 'wb', 'u/r' => 'ur', 'r/u' => 'ur', 'b/g' => 'bg', 'g/b' => 'bg', 'r/w' => 'rw', 'w/r' => 'rw', 'g/u' => 'gu', 'u/g' => 'gu',
	'w/2' => '2w', '2/w' => '2w', 'u/2' => '2u', '2/u' => '2u', 'b/2' => '2b', '2/b' => '2b', 'r/2' => '2r', '2/r' => '2r', 'g/2' => '2g', '2/g' => '2g',
	'w/p' => 'pw', 'p/w' => 'pw', 'u/p' => 'pu', 'p/u' => 'pu', 'b/p' => 'pb', 'p/b' => 'pb', 'r/p' => 'pr', 'p/r' => 'pr', 'g/p' => 'pg', 'p/g' => 'pg', 'p/2' => '2p', '2/p' => '2p',
	'puw' => 'pwu', 'bpw' => 'pwb', 'bpu' => 'pub', 'pru' => 'pur', 'bpr' => 'pbr', 'bgp' => 'pbg', 'gpr' => 'prg', 'prw' => 'prw', 'gpw' => 'pgw', 'gpu' => 'pgu',
	'bgw' => 'bgw', 'bgr' => 'brg', 'bgu' => 'gub', 'guw' => 'gwu', 'grw' => 'rgw', 'ruw' => 'rwu', 'bru' => 'ubr', 'gru' => 'urg', 'brw' => 'wbr', 'buw' => 'wub',
	't' => 't', 'q' => 'q', 's' => 's', 'e' => 'e', 'p' => 'planeswalker', 'h' => 'chaos', 'x' => 'x', 'y' => 'y', 'z' => 'z', 'i' => 'infinite',
	'0' => '0', '1' => '1', '2' => '2', '3' => '3', '4' => '4', '5' => '5', '6' => '6', '7' => '7', '8' => '8', '9' => '9', '10' => '10', '11' => '11', '12' => '12', '13' => '13', '14' => '14', '15' => '15', '16' => '16', '17' => '17', '18' => '18', '19' => '19', '20' => '20'
);

class mtg_util_shortcodes{

	// add actions and filters in constructor
	function __construct() {
		add_shortcode('mana', array($this, 'mana_shortcode') );
		add_shortcode('card', array($this, 'card_shortcode') );
		add_shortcode('deck', array($this, 'deck_shortcode') );
	} //end __construct

	function fixSpecialChars(&$content) {
		// change nbsp to normal space
		$content = preg_replace('/&nbsp;/', ' ', $content);
		// change dumb quote to &#39;
		$content = preg_replace('/&#8217;/', '\'', $content);
		// change dash to double hyphen
		$content = preg_replace('/&#8211;/', '--', $content);

	}

	function card_shortcode($atts, $content) {
		//Get existing options
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);
		//If card_database_query_url is not set or is empty return false
		if( empty($mtg_util_options['card_database_query_url']) OR !isset($mtg_util_options['card_database_query_url']) ){
			return $content;
		}

		$this->fixSpecialChars($content);

		// variables from input
		$card = $content;
		if ( isset($atts['alt']) ) {
			$alt = $atts['alt'];
		}
		if ( isset($atts['image']) ) {
			$image = $atts['image'];
		}

		// output
		$query_url = $mtg_util_options['card_database_query_url'] . urlencode($card);
		$image_url = '<img src="' . $mtg_util_options['card_image_query_url'] . urlencode($card) . '">';
		$link = "<a href=\"$query_url\" target=\"_blank\" class=\"cardlink\">" . (isset($image) ? $image_url : (isset($alt) ? $alt : $card)) . "</a>";
		return $link;
	} // end card_shortcode

	// functions to create deck lists

	public static function deck_autocard_callback($matches) {
		global $autocard_url;
		$retval = ($matches[2]? "{$matches[2]} " : '') . "<a href=\"$autocard_url{$matches[4]}\" target=\"_blank\">{$matches[4]}</a> " . (isset($matches[5])? "<span class=\"deckcomment\">{$matches[5]}</span> " : '');
		return $retval;
	}

	function deck_shortcode($atts, $content) {
		global $MTG_UTIL_DEFAULT_OPTIONS_DECK_TITLE, $MTG_UTIL_DEFAULT_OPTIONS_DECK_REGEX, $autocard_url;

		//Get existing options
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);
		$decklist_pattern = $MTG_UTIL_DEFAULT_OPTIONS_DECK_REGEX;
		if ( isset($mtg_util_options['card_database_query_url'])   ) {
			$decklist_pattern = $mtg_util_options['decklist_regex'];
		}
		if ( isset($mtg_util_options['card_database_query_url'])  ) {
			$autocard_url = $mtg_util_options['card_database_query_url'];
		}

		// variables from input
		$decklist = $content;
		$decktitle = $this->DECK_TITLE;
		if ( isset($atts['title']) ) {
			$decktitle = $atts['title'];
		}

		/*
		// deck id for that page
		if (isset($context['msgid'])) {
			$postid = $context['msgid'];
			$deckid = $context['deckid'];
		}
		//*/

		// step 1: convert cards to links
		$decklist = preg_replace('/<\/p>\n<p>/', '<br /><br />', $decklist);
		// comments do not add <br /> yet, so look for newlines without <br /> in front
		$decklist = preg_replace('/(?<!\<br \/\>)\n/', '<br />', $decklist);

		$this->fixSpecialChars($decklist);

		// iterate lines and remove amount, set ID via pattern
		$decklist = explode('<br />', $decklist);

		foreach ($decklist as $line => $text) {
			$matcharray = array();
			if ($decklist[$line] == '') {
				// empty line
			}
			elseif (preg_match($decklist_pattern, $decklist[$line], $matcharray) ) {
				if ($matcharray[4] != '') {
					$decklist[$line] = preg_replace_callback($decklist_pattern, function($matches) {
						return mtg_util_shortcodes::deck_autocard_callback($matches);
					}, $decklist[$line], 1);
				}
				elseif ($matcharray[1]) {
					$m = $matcharray[1];
					$m = preg_replace('/^\s*\/\//', '', $m);
					$decklist[$line] = "<b class=\"decksection\">$m</b>";
				}
			}
		} // end foreach

		// step 2: create sideboard
		$sideboard = array();
		$sideindex = count($decklist);
		for ($i =0; $i<count($decklist); $i++) {
			if (preg_match('/sideboard/', strtolower($decklist[$i]))) {
				$sideindex = $i;
				break;
			}
		}

		// split sideboard from main decklist
		if ($sideindex < count($decklist)) {
			for (;$sideindex < count($decklist);$sideindex++) {
				$sideboard[] = $decklist[$sideindex];
				$decklist[$sideindex] = '';
			}
		}

		// step 3: split maindeck into two columns with equal sections

		// remove extra blank lines
		$decklist = implode('<br />', $decklist);
		$decklist = preg_replace('/^(<br \/>)+/', '', $decklist);
		$decklist = preg_replace('/(<br \/>)+$/', '', $decklist);
		$decklist = explode('<br />', $decklist);

		// count number of breaks that divide into sections
		$sections = array();
		foreach($decklist as $key => $value) {
			if ($value == '') {
				$sections[] = $key;
			}
		}
		$cutoff = floor((count($sections))/2);
		$decklistB = array();
		if (!empty($sections)) {
			for ($i=$sections[$cutoff]+1; $i < count($decklist); $i++) {
				$decklistB[] = $decklist[$i];
				$decklist[$i] = '';
			}
		}

		/*
		// step 4: deck download
		$deckdl = " <div style=\"float:right;margin-left: 20px;\"> <a href=\"deck.php?post=$postid&deckid=$deckid&format=apprentice\"><img src=\"{$settings['images_url']}/icons/apprentice.png\" alt=\"Apprentice\" /></a> <a href=\"deck.php?post=$postid&deckid=$deckid&format=mtgo\"><img src=\"{$settings['images_url']}/icons/mtgo.png\" alt=\"MTGO\" /></a> </div> ";
		//*/

		$deckhtml = $decklist;

		// step 5: final output
		$decklist = implode('<br />', $decklist);
		$decklist = preg_replace('/(<br \/>)+$/', '', $decklist);
		$deckhtml = "<table class=\"decktable\"><tr><td class=\"deckheader\" colspan=\"3\">$deckdl $decktitle </td></tr>";
		$deckhtml .= '<tr>';
		$deckhtml .= "<td class=\"deckcolumn-left\">$decklist</td>";
		if (!empty($decklistB)) {
			$decklistB = implode('<br />', $decklistB);
			$decklistB = preg_replace('/(<br \/>)+$/', '', $decklistB);
			$deckhtml .= "<td class=\"deckcolumn-right\">$decklistB</td>";
		}
		if (!empty($sideboard)) {
			$sideboard = implode('<br />', $sideboard);
			$sideboard = preg_replace('/(<br \/>)+$/', '', $sideboard);
			$deckhtml .= "<td class=\"deckcolumn-sideboard\">$sideboard</td>";
		}
		$deckhtml .= '</tr>';
		$deckhtml .= '</table>';
		/*
		$context['deckid']++;
		//*/

		return $deckhtml;
	} // end deck_shortcode

	function mana_shortcode($atts, $content) {
		// http://www.wizards.com/images/Symbols/red_mana.gif
		// http://www.wizards.com/images/Symbols/red_mana_large.gif

		global $MTG_UTIL_DEFAULT_OPTIONS_MANA_REGEX, $MTG_UTIL_DEFAULT_OPTIONS_TRIBRID_REGEX, $MTG_UTIL_DEFAULT_OPTIONS_MANA_REPLACE, $MTG_UTIL_DEFAULT_OPTIONS_MANA_TRUE;

		$cost = strtolower($content);
		// split valid mana symbols with comma, then explode into array
		$cost = preg_replace($MTG_UTIL_DEFAULT_OPTIONS_MANA_REGEX, $MTG_UTIL_DEFAULT_OPTIONS_MANA_REPLACE, $cost);
		$cost = explode(';', $cost);

		// replace letter with html img
		foreach($cost as $key => $value) {
			$value = trim($value);
			if (preg_match($MTG_UTIL_DEFAULT_OPTIONS_TRIBRID_REGEX, $value)) {
				// sort hybrid phyrexian, tribrid alphabetically
				$letters = explode("/", $value);
				natcasesort($letters);
				$value = implode("", $letters);
			}
			if (isset($MTG_UTIL_DEFAULT_OPTIONS_MANA_TRUE[$value])) {
				$url = plugins_url("{$MTG_UTIL_DEFAULT_OPTIONS_MANA_TRUE[$value]}.png", __FILE__);
				$cost[$key] = '<img src="' . $url . '" alt="" width="15" height="15">';
			}
		}

		$cost = implode('', $cost);

		return $cost;
	} // end mana_shortcode


} //end mtg_util_shortcodes
$mtg_util_shortcodes = new mtg_util_shortcodes();
?>
