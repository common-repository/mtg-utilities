<?php
/*
SOURCE:
http://www.adviceinteractivegroup.com/open-source-wordpress-options-page-plugin/
//*/

//Default values for options
$MTG_UTIL_DEFAULT_OPTIONS = array(
	'card_database_query_url' => 'https://scryfall.com/search?as=grid&order=name&q=!"',
	'card_image_query_url' => 'http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=',
	'decklist_regex' => '/^\s*(\/\/.*|SB: )?(?:x?(?=\d))?(\d+(?=\s*)?\-?(?=\s*)?\d*)?\s*(\s?x |\*|\[\w+?])?\s*([^{]*?)\s*?({.*}|--.*)?\s*$/',
	'enable_comments_shortcodes' => '1',
	'enable_replace_brackets' => '0'
);

//Require admin input field
require_once('admin-input-fields.php');
class mtg_util_options{

	//add actions and filters in constructor
	function __construct(){
		add_action('admin_init', array($this, 'register_settings') );
		add_action('admin_menu', array($this, 'add_admin_menu_page') );

		$this->initialize_options();
	}//end __construct

	//register options field with WordPress
	function register_settings() {
		/* register_setting( $option_group, $option_name, $sanitize_callback ); */
		register_setting( MTG_UTIL_PREFIX . 'options', MTG_UTIL_OPTIONS, array($this, 'sanitize_options') );

	}//end register_settings

	// initialize default values for certain options
	function initialize_options() {
		global $MTG_UTIL_DEFAULT_OPTIONS;
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);

		// for each option, set the $key variable to option's name
		// check if option value exists. if not, set to default value
		// after all keys are set, update the options to database

		foreach ($MTG_UTIL_DEFAULT_OPTIONS as $key => $value) {
			$this->set_option( $mtg_util_options, $key, $value);
		}

//		update_option(MTG_UTIL_OPTIONS, $mtg_util_options);
	}

	// set option to value
	function set_option( &$array, $key, $value) {
		if( empty($array[$key]) OR !isset($array[$key]) ) {
				$array[$key] = $value;
		}
	}

	//add page to admin menu
	function add_admin_menu_page() {
		/* add_options_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position ); */
		add_options_page(MTG_UTIL_NAME . ' Options', MTG_UTIL_NAME . ' Options', 'manage_options', MTG_UTIL_PREFIX . 'options', array($this, 'options_page_content') );
	}//end add_admin_menu_page

	//sanitize user inputs
	function sanitize_options($input) {
		foreach( $input as $key=>$value ){
			//Sanitize each input
			$input[$key] = sanitize_text_field($value);
		}
		return $input;
	}//end sanitize_options

	//draw options page content
	function options_page_content() {
		//Initiate new mtg_util_admin_input_fields class
		$admin_input_fields = new mtg_util_admin_input_fields();

		//Get existing options
		$mtg_util_options = get_option(MTG_UTIL_OPTIONS);
		if( isset($_GET['settings-updated']) AND $_GET['settings-updated'] == 'true' ){
			echo '<div class="updated"> <p><strong>' . MTG_UTIL_NAME . ' Options Saved.</strong></p></div>';
		}

		/*
		UNCOMMENT FOR DEBUGGING!
		echo '<div class="error"><p>' . print_r($mtg_util_options, true) . '</p></div>';
		*/


		//Use default WordPress HTML structure
		//TODO: Create tabbed layout
		?>
		<div class="wrap">
			<div id="icon-options-general" class="icon32"><br /></div>
			<h2><?php echo MTG_UTIL_NAME; ?> Options</h2>
			<form method="post" action="options.php">
				<?php
				//Output nonce, action, and option_page fields. Must be inside <form>
				settings_fields(MTG_UTIL_PREFIX . 'options');
				?>
				<table class="form-table">
					<tbody>
						<?php
						//Display input fields. See admin-input-fields.php for instructions.
						//$admin_input_fields->text($slug=false, $label=false, $description=false);
						$admin_input_fields->text('card_database_query_url', 'Card Database Query URL');

						$admin_input_fields->text('card_image_query_url', 'Card Image Query URL');

						$admin_input_fields->text('decklist_regex', 'Decklist Regex', 'Regex pattern to parse decklists. WARNING: Modify at your own risk!! <br/> Default is /^\s*(\/\/.*|SB: )?(?:x?(?=\d))?(\d+(?=\s*)?\-?(?=\s*)?\d*)?\s*(\s?x |\*|\[\w+?])?\s*([^{]*?)\s*?({.*}|--.*)?\s*$/');

						$admin_input_fields->checkbox('enable_comments_shortcodes', 'Enable Codes in Comments');
						$admin_input_fields->checkbox('enable_replace_brackets', 'Replace brackets into mana symbols');
						?>
					</tbody>
				</table>
				<p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>
			</form>

		</div><!--//wrap-->
	<?php
	}//end options_page_content

}//end mtg_util_options
$mtg_util_options = new mtg_util_options();
?>