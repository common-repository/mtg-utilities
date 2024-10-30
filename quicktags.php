<?php
class mtg_util_quicktags {

		// add actions and filters in constructor
		function __construct() {
			// Hook quicktags into the 'admin_print_footer_scripts' action
			add_action( 'admin_print_footer_scripts', array($this, 'add_quicktags') );
	} //end __construct

	// Add Quicktags
	function add_quicktags() {
		if ( wp_script_is( 'quicktags' ) ) {
		?>
		<script type="text/javascript">
		QTags.addButton( 'mtgutil_card', 'card', function(b,t,e) { wrapQuicktag(t, 'card'); }, '', '', 'Card link', 1993 );
		QTags.addButton( 'mtgutil_deck', 'deck', function(b,t,e) { wrapQuicktag(t, 'deck'); }, '', '', 'Deck list', 1994 );
		QTags.addButton( 'mtgutil_mana', 'mana', function(b,t,e) { wrapQuicktag(t, 'mana'); }, '', '', 'Mana symbol', 1995 );

		/*
		alert(a.type); // HTMLInputElement button
		alert(b.type); // HTMLTextAreaElement textarea
		alert(c.type); // Object undefined
		//*/

		function wrapQuicktag(textarea, tag) {
			start = textarea.selectionStart;
			end = textarea.selectionEnd;
			value = textarea.value;
			selection = value.slice(start, end);
			// modify selection with our tags
			selection = '[' + tag + ']' + selection + '[/' + tag + ']';

			// modify textarea value
			textarea.value = value.substring(0, start) + selection + value.substring(end);
		}
		</script>
		<?php
		}
	}
}

$mtg_util_quicktags = new mtg_util_quicktags();
?>