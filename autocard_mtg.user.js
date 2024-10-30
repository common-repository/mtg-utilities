// ==UserScript==
// @name	AutoCard_MTG
// @namespace	https://ieants.cc
// @description	Show image of card upon mouseover of autocard link

// @version	1.68
// @author	Lord of Atlantis
// @download	https://ieants.cc/magic/autocard_mtg.user.js
// @encoding utf-8

// @include	http://wizards.com/*
// @include	http://*.wizards.com/*
// @include	https://wizards.com/*
// @include	https://*.wizards.com/*
// @include	https://mtgsalvation.com/*
// @include	https://*.mtgsalvation.com/*
// @include	http://starcitygames.com/*
// @include	http://*.starcitygames.com/*
// @include	https://magiccards.info/*
// @include	https://*.magiccards.info/*
// @include	https://yawgatog.com/*
// @include	https://*.tcgplayer.com/*
// @include	https://gamefaqs.gamespot.com/*
// @include	http://*.blogspot.com/*
// @include	https://*.blogspot.com/*
// @include	https://magic-league.com/*
// @include	https://*.magic-league.com/*
// @include	http://themanadrain.com/*
// @include	https://*.mtgvault.com/*
// @include	https://mtgcolorpie.com/*
// @include	https://mtg.gamepedia.com/*
// @include	https://*.slightlymagic.net/*
// @include	http://ieants.cc/*
// @include	http://*.ieants.cc/*
// @include	https://ieants.cc/*
// @include	https://*.ieants.cc/*
// @include	http://daccg.com/*
// @include	http://*.daccg.com/*
// @include	https://daccg.com/*
// @include	https://*.daccg.com/*
// @include	https://scryfall.com/*
// @include	http://192.168.10.70/wp/*
// @include	http://deb9/*
// @include	file://localhost/*

// ==/UserScript==

// Opera users put this script in the userjs folder.
// GreaseMonkey rename with extension .user.js.
/*
	MTG Autocard upon Mouseover
	by Dennis Voong
	(a.k.a. Lord of Atlantis @ wizards and mtgsalvation forums)
	[Last updated 2022/03/31 16:30:24 -8:00 Pacific Time US]

	When you move the mouse over a card's name
	at major Magic sites, the card's picture will appear.
	(An option is to require you to double click the mouse button before the
	image will appear.)

	Tested on Opera 112.18 and Vivaldi. However, image quality varies by browser.
	(Opera has much better image quality.)
	I've stop supporting older versions of these browsers.

	Works for the most popular Magic sites, such as
	wizards.com, magicthegathering.com, gleemax.com, gatherer,
	mtgsalvation, starcity, crystalkeep, and whatever is included at the top.

	If you want to include a site not listed, add a similar include line at the top.
	However, it might not work if the link address doesn't meet the criteria.
	If this is the case, contact me, Lord of Atlantis, at mtgsalvation.

	Reversely, if you don't want this script to run for a site that is listed
	(e.g. wizards articles and tcgplayer because they have their own pop up scripts),
	then delete their respective include lines.

	Works for 99.999% of the cards.
	Split cards will work if the article or poster types one or both sides
	separated by slash(es) or space or underscore.
	e.g. any of these should work:  fire/ice ; fire_ice ; fire ice ; fire//ice ;
	fire ; ice
	Dissension split cards require double underscore. Dead__Gone, too.
	Aether should be spelled out so 'ae' are two letters.
	Unicode AE, ae does convert now.
	BFM can be written bfm ; bfm left ; bfm right

	Original creation date: Mar 16, 2007
	Here's the original discussion on why this was created:
	http://boards1.wizards.com/showthread.php?t=809153
	See post #13 to test the cards.

	Special Thanks To:
	Shimakuma from mtg boards: showed how to get Dissension split cards.
	Effovex from mtg boards: userscript @includes.
	ASM from www.thescripts.com for Unicode AE fix.
	Opera team for such a fully-featured yet fast browser.
	Google and mozilla for javascript and DOM answers.
	Magic fans for the inspiration.

	AND OF COURSE, Wizards of the Coast and Richard Garfield
	for this awesome game and easy-to-find images on their website.

	If you have issues, know other sites to add, etc.
	message me, Lord of Atlantis, at mtgsalvation forums, OR
	ask your questions on one of the official forum topics regarding this script,
	URLs below:
	https://ieants.cc/smf/index.php?topic=5.0
	https://forums.mtgsalvation.com/showthread.php?t=137169
*/

/*
	How the script works.

	Replaces all links that refer to autocard or gatherer to receive
	onmouseover events.

	Article links to autocard look something like this:
	href="javascript:autoCardWindow('Lord_of_Atlantis')"
	href="javascript:autoCardWindow2('Juzam Djinn','')"

	On the discussion boards, the cards have mouseover events that modify
	the status bar, like this:
	onMouseover="window.status='Necropotence'; return true"

	Actually, querying this event returns a multi-line function, like this:
	function (event)
	{
		window.status = "Old Fogey";
		return true;
	}

	Condense this into a single-line string before extracting the card's name.

	For Gatherer, the card name is the text contained in the first td in each tr
	in the table whose id="_gridResults". Since it looks in tr (not links), this is
	done in a separate section.

	MTGSalvation links to magiccards.info:
	http://www.magiccards.info/autocard.php?card=Nightmare

	MTGSalvation attachments also work:
	http://forums.mtgsalvation.com/attachment.php?attachmentid=43144&d=1174759194

	Starcity uses this:
	http://sales.starcitygames.com/cardsearch.php?singlesearch=Skyshroud+Elite

	This script looks for these clues and adds or replaces the onmouseover event
	that instead pops up the image for that card.

	Get the images from here:
	http://wizards.com/global/images/magic/general/winding_wurm.jpg
	http://wizards.com/global/images/magic/tsb/lord_of_atlantis.jpg

	Convert special characters and spaces into underscore.
	(autocard_fixcardname())

	(autocard page that holds this image:
	http://www.wizards.com/magic/autocard.asp?name=cardname
	http://www.wizards.com/magic/autocard.asp?name=lord_of_atlantis
	)

	Images are now preloaded. After it's in your cache, it should
	appear instantaneously thereafter and for subsequent mouseovers.
*/

/*
	KNOWN ISSUES
*/

// CONSTANTS /////////////////////////////////////////////

autocard = {
	// if false, you have to double click mouse button anywhere on the page to toggle on and off
	alwaysOn: true,

	// enable debugging and logging
	debugOn: false,

	// original size is 200 wide by 285 high
	imgWidth: 300,
	imgHeight: 428,
	//imgId: "autocardimg",
	//imgId2: "autocardimg2",

	cardback: "https://www.wizards.com/global/images/magic/general/cardback.jpg",
	progressBar: "https://ieants.cc/images/progressBar_MTG.gif",
	// change to your favorite card search site
	replaceUrl: "https://scryfall.com/search?q="
};

// order of downloading images
// cardback last
var AUTOCARD_IMG_RE = new Array(
"https://www.wizards.com/global/images/magic/general/cardname.jpg"
,"https://ieants.cc/magic/ccimg/WotC/cardoriginal.png"
,"http://deb9/imgd/ymtc/cardoriginal_by_WotC.png"
,"https://ieants.cc/imgd/card2img/mtg-cardscrape.jpg"
,"http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=cardoriginal"
,"https://ieants.cc/imgd/card2img2/cardoriginal.png"
//*
,"https://ieants.cc/images/mtg-cardname.jpg"
,"https://ieants.cc/images/mtg-ymtc-cardname.jpg"
,"https://ieants.cc/images/mtg-preview-cardname.jpg"
,"https://ieants.cc/imgd/ymtc/cardoriginal by amuseum.png"
//*/
,"http://www.wizards.com/global/images/magic/tsb/cardname.jpg"
,"http://www.wizards.com/global/images/magic/p3k/cardname.jpg"
,"http://www.wizards.com/global/images/magic/portal2/cardname.jpg"
,"http://www.wizards.com/global/images/magic/portal/cardname.jpg"
,"http://www.wizards.com/global/images/magic/starter/cardname.jpg"
//,"https://ieants.cc/images/stc-cardname.jpg"
//,"https://ieants.cc/imgd/mtgautocard/cardname.jpg"
,autocard.cardback
);

// cardname match regular expressions
var AUTOCARD_NAME_RE = new Array(
	new RegExp("(OpenTip|ChangeBigCard)")
	,new RegExp("gatherer\.wizards\.com\/.*\?multiverseid")
	,new RegExp("gatherer\.wizards\.com\/Pages")
	,new RegExp("starcitygames.com\/+cardsearch")
	,new RegExp("magiccards.info")
	,new RegExp("attachment\.php")
	,new RegExp("yawgatog\.com")
	,new RegExp("Click to view")
	,new RegExp("www\.mtgotraders\.com\/store")
	,new RegExp("CardName=.*(&Edition.*)?")
	,new RegExp("http:\/\/www\.mtgsalvation\.com\/cards.*([0-9]+\-|search=)(.*)")
	,new RegExp("scryfall\.com")
	,new RegExp("ieants\.cc/magic/scry\.php")
);

// actual url to image sources
var imgs = new Array();

var AUTOCARD_SPLIT = new Array(
new Array("assault_battery", "assault_battery")
,new Array("pain_suffering", "pain_suffering")
,new Array("spite_malice", "spite_malice")
,new Array("stand_deliver", "stand_deliver")
,new Array("wax_wane", "wax_wane")
,new Array("fire_ice", "fire_ice")
,new Array("illusion_reality", "illusion_reality")
,new Array("life_death", "life_death")
,new Array("night_day", "night_day")
,new Array("order_chaos", "order_chaos")
,new Array("bound_determined", "bound__determined")
,new Array("crime_punishment", "crime__punishment")
,new Array("hide_seek", "hide__seek")
,new Array("hit_run", "hit__run")
,new Array("odds_ends", "odds__ends")
,new Array("pure_simple", "pure__simple")
,new Array("research_development", "research__development")
,new Array("rise_fall", "rise__fall")
,new Array("supply_demand", "supply__demand")
,new Array("trial_error", "trial__error")
,new Array("boom_bust", "boom_bust")
,new Array("dead_gone", "dead__gone")
,new Array("rough_tumble", "rough_tumble")
,new Array("who_what_when_where_why", "who_what_when_where_why")
,new Array("alive_well", "alive_well")
,new Array("armed_dangerous", "armed_dangerous")
,new Array("beck_call", "beck_call")
,new Array("breaking_entering", "breaking_entering")
,new Array("catch_release", "catch_release")
,new Array("down_dirty", "down_dirty")
,new Array("far_away", "far_away")
,new Array("flesh_blood", "flesh_blood")
,new Array("give_take", "give_take")
,new Array("profit_loss", "profit_loss")
,new Array("protect_serve", "protect_serve")
,new Array("ready_willing", "ready_willing")
,new Array("toil_trouble", "toil_trouble")
,new Array("turn_burn", "turn_burn")
,new Array("wear_tear", "wear_tear")

// scrape to find images for later sets
,new Array("commit_memory", "commit_memory", "commit-memory")
,new Array("cut_ribbons", "cut_ribbons", "cut-ribbons")
,new Array("destined_lead", "destined_lead", "destined-lead")
,new Array("dusk_dawn", "dusk_dawn", "dusk-dawn")
,new Array("failure_comply", "failure_comply", "failure-comply")
,new Array("heaven_earth", "heaven_earth", "heaven-earth")
,new Array("insult_injury", "insult_injury", "insult-injury")
,new Array("mouth_feed", "mouth_feed", "mouth-feed")
,new Array("never_return", "never_return", "never-return")
,new Array("onward_victory", "onward_victory", "onward-victory")
,new Array("prepare_fight", "prepare_fight", "prepare-fight")
,new Array("rags_riches", "rags_riches", "rags-riches")
,new Array("reduce_rubble", "reduce_rubble", "reduce-rubble")
,new Array("spring_mind", "spring_mind", "spring-mind")
,new Array("start_finish", "start_finish", "start-finish")

,new Array("appeal_authority", "appeal_authority", "appeal-authority")
,new Array("claim_fame", "claim_fame", "claim-fame")
,new Array("consign_oblivion", "consign_oblivion", "consign-oblivion")
,new Array("driven_despair", "driven_despair", "driven-despair")
,new Array("farm_market", "farm_market", "farm-market")
,new Array("grind_dust", "grind_dust", "grind-dust")
,new Array("leave_chance", "leave_chance", "leave-chance")
,new Array("reason_believe", "reason_believe", "reason-believe")
,new Array("refuse_cooperate", "refuse_cooperate", "refuse-cooperate")
,new Array("struggle_survive", "struggle_survive", "struggle-survive")
// end scrape

,new Array("bfm_big_furry_monster", "bfm")
// cardnames with quotes may not be escaped correctly (e.g. crystal keep)
,new Array("pang_tong", "pang_tong_young_phoenix")
,new Array("kongming", "kongming_sleeping_dragon")

);
var AUTOCARD_SPLIT_JOIN = AUTOCARD_SPLIT.join("_");

var AUTOCARD_TRANSFORM = new Array(
new Array("cloistered_youth", "unholy_fiend")
,new Array("thraben_sentry", "thraben_militia")
,new Array("civilized_scholar", "homicidal_brute")
,new Array("delver_of_secrets", "insectile_aberration")
,new Array("ludevics_test_subject", "ludevics_abomination")
,new Array("bloodline_keeper", "lord_of_lineage")
,new Array("screeching_bat", "stalking_vampire")
,new Array("hanweir_watchkeep", "bane_of_hanweir")
,new Array("instigator_gang", "wildblood_pack")
,new Array("kruin_outlaw", "terror_of_kruin_pass")
,new Array("reckless_waif", "merciless_predator")
,new Array("tormented_pariah", "rampaging_werewolf")
,new Array("village_ironsmith", "ironfang")
,new Array("daybreak_ranger", "nightfall_predator")
,new Array("garruk_relentless", "garruk_the_veil_cursed")
,new Array("gatstaf_shepherd", "gatstaf_howler")
,new Array("grizzled_outcasts", "krallenhorde_wantons")
,new Array("mayor_of_avabruck", "howlpack_alpha")
,new Array("ulvenwald_mystics", "ulvenwald_primordials")
,new Array("villagers_of_estwald", "howlpack_of_estwald")
,new Array("afflicted_deserter", "werewolf_ransacker")
,new Array("chalice_of_life", "chalice_of_death")
,new Array("chosen_of_markov", "markovs_servant")
,new Array("elbrus_the_binding_blade", "withengar_unbound")
,new Array("hinterland_hermit", "hinterland_scourge")
,new Array("huntmaster_of_the_fells", "ravager_of_the_fells")
,new Array("lambholt_elder", "silverpelt_werewolf")
,new Array("loyal_cathar", "unhallowed_cathar")
,new Array("mondronen_shaman", "tovolars_magehunter")
,new Array("ravenous_demon", "archdemon_of_greed")
,new Array("scorned_villager", "moonscarred_werewolf")
,new Array("soul_seizer", "ghastly_haunting")
,new Array("wolfbitten_captive", "krallenhorde_killer")

,new Array("aberrant researcher", "perfected form")
,new Array("accursed witch", "infectious curse")
,new Array("archangel avacyn", "avacyn, the purifier")
,new Array("arlinn kord", "arlinn, embraced by the moon")
,new Array("autumnal gloom", "ancient of the equinox")
,new Array("avacynian missionaries", "lunarch inquisitors")
,new Array("breakneck rider", "neck breaker")
,new Array("convicted killer", "branded howler")
,new Array("daring sleuth", "bearer of overwhelming truths	")
,new Array("duskwatch recruiter", "krallenhorde howler")
,new Array("elusive tormentor", "insidious mist")
,new Array("gatstaf arsonists", "gatstaf ravagers")
,new Array("geier reach bandit", "vildin-pack alpha")
,new Array("hanweir militia captain", "westvale cult leader")
,new Array("harvest hand", "scrounged scythe")
,new Array("heir of falkenrath", "heir to the night")
,new Array("hermit of the natterknolls", "lone wolf of the natterknolls")
,new Array("hinterland logger", "timber shredder")
,new Array("kessig forgemaster", "flameheart werewolf")
,new Array("kindly stranger", "demon-possessed witch")
,new Array("lambholt pacifist", "lambholt butcher")
,new Array("neglected heirloom", "ashmouth blade")
,new Array("pious evangel", "wayward disciple")
,new Array("skin invasion", "skin shedder")
,new Array("sage of ancient lore", "werewolf of ancient hunger")
,new Array("solitary hunter", "one of the pack")
,new Array("startled awake", "persistent nightmare")
,new Array("thing in the ice", "awoken horror")
,new Array("thraben gargoyle", "stonewing antagonizer")
,new Array("town gossipmonger", "incited rabble")
,new Array("uninvited geist", "unimpeded trespasser")
,new Array("village messenger", "moonrise intruder")
,new Array("westvale abbey", "ormendahl, profane prince")

,new Array("extricator of sin", "extricator of flesh")
,new Array("lone rider", "it that rides as one")
,new Array("curious homunculus", "voracious reader")
,new Array("docent of perfection", "final iteration")
,new Array("grizzled angler", "grisly anglerfish")
,new Array("voldaren pariah", "abolisher of bloodlines")
,new Array("conduit of storms", "conduit of emrakul")
,new Array("hanweir garrison", "hanweir, the writhing township")
,new Array("smoldering werewolf", "erupting dreadwolf")
,new Array("vildin-pack outcast", "dronepack kindred")
,new Array("kessig prowler", "sinuous predator")
,new Array("shrill howler", "howling chorus")
,new Array("tangleclaw werewolf", "fibrous entangler")
,new Array("ulvenwald captive", "ulvenwald abomination")
,new Array("ulrich of the krallenhorde", "ulrich, uncontested alpha")
,new Array("cryptolith fragment", "aurora of emrakul")
,new Array("hanweir garrison", "hanweir, the writhing township")
,new Array("hanweir battlements", "hanweir, the writhing township")
,new Array("graf rats", "chittering host")
,new Array("midnight scavengers", "chittering host")
,new Array("bruna, the fading light", "brisela, voice of nightmares")
,new Array("gisela, the broken blade", "brisela, voice of nightmares")

,new Array("kytheon, hero of akros", "gideon, battle-forged")
,new Array("jace, vryn's prodigy", "jace, telepath unbound")
,new Array("liliana, heretical healer", "liliana, defiant necromancer")
,new Array("chandra, fire of kaladesh", "chandra, roaring flame")
,new Array("nissa, vastwood seer", "nissa, sage animist")

,new Array("legion's landing", "adanto, the first fort")
,new Array("search for azcanta", "azcanta, the sunken ruin")
,new Array("arguel's blood fast", "temple of aclazotz")
,new Array("hadana's climb", "winged temple of orazca")
,new Array("journey to eternity", "atzal, cave of eternity")
,new Array("path of mettle", "metzali, tower of triumph")
,new Array("profane procession", "tomb of the dusk rose")
,new Array("storm the vault", "vault of catlacan")
,new Array("vance's blasting cannons", "spitfire bastion")
,new Array("azor's gateway", "sanctum of the sun")
,new Array("golden guardian", "gold-forge garrison")
,new Array("growing rites of itlimoc", "itlimoc, cradle of the sun")
,new Array("conqueror's galleon", "conqueror's foothold")
,new Array("dowsing dagger", "lost vale")
,new Array("primal amulet", "primal wellspring")
,new Array("thaumatic compass", "spires of orazca")
,new Array("treasure map", "treasure cove")

);
var AUTOCARD_TRANSFORM_JOIN = AUTOCARD_TRANSFORM.join("$");

var AUTOCARD_HIDE_CSS = new Array(
	"#db-tooltip-container" // mtgsalvation.com
	,".prototip" // wizards.com
	,".qtip"
	,"#mtg_text" // slightlymagic.net
);

// commonly misspelled words
var AUTOCARD_MISSPELL = new Array(
new Array("judgement", "judgment")
);
var AUTOCARD_MISSPELL_JOIN = AUTOCARD_MISSPELL.join("_");


// FUNCTIONS /////////////////////////////////////////////

function autocard_imgloaded(event, cardname, show) {
	var img = autocard.imgEl;
	var img2 = autocard.imgEl2;
	img.setAttribute("cardname", cardname);

	if (show) {
		img.src = imgs[cardname][0];
		//while(!img.complete);
	}
	else {
		img.src = "";
		img2.src = "";
	}

	//* Place IMG at cursor
	img.style.display = "block";

	// + down ; - up
	var y = event.clientY - img.clientHeight - 20;
	if ( y < 0 ) {
		y = event.clientY + 20; // move to bottom half of screen
	}
	if ( (y + img.clientHeight) > window.innerHeight ) {
		y = window.innerHeight - img.clientHeight - 0;
	}

	// + right ; - left
	var x = event.clientX + 20;
	if ( x > document.body.offsetWidth - img.scrollWidth - 70 ) {
		x = x - img.scrollWidth - 40; // move to left of cursor
	}
	if ( x < 0 ) {
		x = 0;
	}

	img.style.top = y + "px";
	img.style.left = x + "px";

	//*/ End Place IMG at cursor

	//transform cards show both img elements
	if (imgs[cardname].transform) {
		var transform = imgs[cardname].transform;
		img2.setAttribute("cardname", transform);
		img2.src = imgs[transform][0];
		img2.style.display = "block";
		img2.style.top = img.style.top;
		img2.style.left = (x + autocard.imgWidth) + "px";
	}
	//alert(cardname);
	//alert(img.src);

}

function autocard_mouseover(event) {
	if ( window.acmd ) {
		var link = event.target;
		while (link && link.tagName != "A") {
			link = link.parentNode;
		}
		var cardname = link.getAttribute("cardname");
		var img = autocard.imgEl;

		if (imgs[cardname].ran) {
			autocard_imgloaded(event, cardname, true);

		} else {
			// show progressbar while loading image in background
			autocard_imgloaded(event, cardname, false);
			img.src = autocard.progressBar;

			var img_temp = autocard.imgTemp;
			img_temp.setAttribute("cardname", cardname);
			img_temp.src = imgs[cardname][0];

			imgs[cardname].ran = true;

			if (imgs[cardname].transform) {
				var transform = imgs[cardname].transform;
				img_temp = autocard.imgEl2;
				img_temp.setAttribute("cardname", transform);
				img_temp.src = imgs[transform][0];
				imgs[transform].ran = true;

				log(transform);
			}

			//debug
			log(imgs[cardname]);
		}

		//debug
		//alert(img_temp.src);

	log('img_temp.src', img_temp.src);
	}
}

function autocard_mouseout() {
	var img = autocard.imgEl;
	img.src = ""; // must go before hiding it
	img.style.display = "none";

	var img2 = autocard.imgEl2;
	img2.src = ""; // must go before hiding it
	img2.style.display = "none";
}

function autocard_fiximageurl() {
	var cardname = this.getAttribute("cardname");
	// remove first url
	try {
		imgs[cardname].splice(0,1);
		this.src = imgs[cardname][0];
	} catch (e) {
	}

	//alert(this.src);
}

function autocard_fixcardname(cardname, link) {
	var cardoriginal = cardname.replace(/^!/, "").replace(/%20/g, " ");
	if ( !link.attachment ) {
		// remove set info
		cardname = cardname.replace(/&.*=.*/g, "");
		cardname = cardname.replace(/\|.*/g, "");

		// needs testing to see if any card won't work after changing to lowercase
		cardname = cardname.toLowerCase();

		// remove bold, italics tags
		cardname = cardname.replace(/<\/?b>/ig, "");
		cardname = cardname.replace(/<\/?i>/ig, "");
		cardname = cardname.replace(/%3c\/?b%3e/ig, ""); // </?b>
		cardname = cardname.replace(/%3c\/?i%3e/ig, ""); // </?i>

		// token cards
		cardname = cardname.replace(/token card/ig, "token");

		// fix strange characters

		// ( UTF-8 | caps | lowercase )
		cardname = cardname.replace(/\(r\)/ig, ""); // (R), registered
		cardname = cardname.replace(/(%c2%ae|\xae)/ig, ""); // ?
		cardname = cardname.replace(/(%c3%86|\xc6|\xe6)/ig, "ae"); // AE
		cardname = cardname.replace(/%[cCeE]6/ig, "ae"); // AE
		cardname = cardname.replace(/(%c3%a9|\xc9|\xe9)/ig, "e"); // É
		cardname = cardname.replace(/%[cCeE]9/ig, "e"); // É
		cardname = cardname.replace(/%20/g, " "); // space
		cardname = cardname.replace(/(%27|%92|%60|%[bB]4)/g, "'"); // apostrophe, grave, acute
		cardname = cardname.replace(/(%[eE]2%80%99|&#8217;|\u2019|’)/g, ""); // dumb quote
		cardname = cardname.replace(/%2[cC]/g, ","); // comma
		cardname = cardname.replace(/%2[fF]/g, ","); // slash
		cardname = cardname.replace(/:(\s|_)*/g, "_"); // colon then any # of spaces or underscore
		cardname = cardname.replace(/[ _]*\/\/[ _]*/g, "_"); // "//" or " // " or "_//_"
		cardname = cardname.replace(/\s*\/\s*/g, "_"); // " / "
		cardname = cardname.replace(/\s+/g, "_"); // spaces
		cardname = cardname.replace(/\+/g, "_"); // +
		cardname = cardname.replace(/,/g, ""); // comma
		cardname = cardname.replace(/\./g, ""); // period
		cardname = cardname.replace(/`/g, ""); // back quote
		cardname = cardname.replace(/'/g, ""); // apostrophe
		cardname = cardname.replace(/(\"|%22)/g, ""); // double quote
		cardname = cardname.replace(/\[/g, ""); // [
		cardname = cardname.replace(/\]/g, ""); // ]
		//cardname = cardname.replace(/:/g, ""); // :
		cardname = cardname.replace(/!/g, ""); // !
		cardname = cardname.replace(/\?/g, ""); // ?
		cardname = cardname.replace(/(\&|\amp;|%26)/g, ""); // ampersand, ex. R&D
		cardname = cardname.replace(/\\/g, ""); // \ backslash
		cardname = cardname.replace(/%5c/g, ""); // \ backslash

		// Lorwyn keeps dash; underscore also works
		cardname = cardname.replace(/-/g, "_"); // -
		cardscrape = cardoriginal.replace(/(-)/g, "_"); // -
		if ( cardname.match(/^_*$/)) {
			cardname = cardname.replace(/_{6,}/g, "_____"); // _____ (at least 5 long)
		}
		else {
			// trim underscores
			cardname = cardname.replace(/^_+/g, "");
			cardname = cardname.replace(/_+$/g, "");
			cardname = cardname.replace(/_+/g, "_");
		}

		// commonly misspelled words
		for (var k=0, l=AUTOCARD_MISSPELL.length; k<l; k++) {
			var misspell = AUTOCARD_MISSPELL[k];
			if ( cardname.match( misspell[0] ) ) {
				cardname = cardname.replace(misspell[0], misspell[1]);
			}
		}

		// split cards
		var cardtemp = cardname;
		if ( AUTOCARD_SPLIT_JOIN.match(cardtemp) ) {
			for (var k=0, l=AUTOCARD_SPLIT.length; k<l; k++) {
				var splitcard = AUTOCARD_SPLIT[k];
				if ( splitcard[0].match( cardtemp ) ) {
					cardname = splitcard[1];
					if (splitcard[2]) {
						cardscrape = cardoriginal = splitcard[2];
					}
				}
			}
		}

		// transform cards, extra img element
		var transform;
		if ( AUTOCARD_TRANSFORM_JOIN.match(cardname) || AUTOCARD_TRANSFORM_JOIN.match(cardscrape.toLowerCase() ) || AUTOCARD_TRANSFORM_JOIN.match(cardoriginal.toLowerCase() ) ) {
			for (var k=0, l=AUTOCARD_TRANSFORM.length; k<l; k++) {
				var splitcard = AUTOCARD_TRANSFORM[k];
				if ( cardname.match( splitcard[0] ) || cardoriginal.toLowerCase().match( splitcard[0] ) || cardscrape.toLowerCase().match( splitcard[0] ) ) {
					transform = splitcard[1];
				}
				else if ( cardname.match( splitcard[1] ) || cardoriginal.toLowerCase().match( splitcard[1] ) || cardscrape.toLowerCase().match( splitcard[1] ) ) {
					transform = splitcard[0];
				}
			}
		}

		// card2img, different for gatherer and magiccards.info
		cardscrape = cardscrape.replace(/(_)/g, " ");


		// finally, replace with actual URL to image
		link.setAttribute("cardname",cardname);
		link.setAttribute("cardoriginal",cardoriginal);
		link.setAttribute("cardscrape",cardscrape);
		imgs[cardname] = new Array();
		if (transform) {
			imgs[transform] = new Array();
			imgs[cardname].transform = transform;
			imgs[transform].transform = cardname;
		}
		for (var i=0; i < AUTOCARD_IMG_RE.length; i++) {
			var src = AUTOCARD_IMG_RE[i];
			src = src.replace(/cardname/g, cardname);
			src = src.replace(/cardoriginal/g, cardoriginal);
			src = src.replace(/cardscrape/g, cardscrape);
			imgs[cardname][i] = src;
			if (transform) {
				src = AUTOCARD_IMG_RE[i];
				src = src.replace(/cardname/g, transform);
				src = src.replace(/cardoriginal/g, transform.replace(/_/g, " "));
				src = src.replace(/cardscrape/g, transform);
				imgs[transform][i] = src;
			}
		}
	}
	else {
		// this is actually an attachment in forums
		// eg spoilers in the rumor mill
		link.setAttribute("cardname",cardname);
		imgs[cardname] = new Array();
		imgs[cardname][0] = cardname;
	}

	return cardname;
}

function autocard_findcard(link) {
	var cardname = "";
	var linktext = link.text;
	var href = link.href;
	var url = document.URL;

	// magic articles
	if (AUTOCARD_NAME_RE[0].test(link.getAttribute("onmouseover")) ) {
		cardname = link.getAttribute("keyValue").replace(/.*\('/g, "");
		cardname = cardname.replace(/'.*\)/g, "");
	}

	// new gatherer, old wizards boards
	// href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=185054"
	// image URL http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=185054&type=card
	else if (AUTOCARD_NAME_RE[1].test(href) ) {
		if (link.id.match(/cardTitle/)) {
			cardname = link.innerHTML.replace(/^LL/g, "L");
			// some freaky thing with Look at Me, I'm R&D producess LL
		}
		else if (link.id.match(/cardImageLink/)) {
			cardname = link.childNodes[1].getAttribute('alt');
		}
	}

	// new wizards boards, puremtgo
	//http://gatherer.wizards.com/Pages/Card/Details.aspx?name=Artisan%20of%20Kozilek
	//http://gatherer.wizards.com/Pages/Search/Default.aspx?name=+[Artisan]+[of]+[Kozilek]
	else if (AUTOCARD_NAME_RE[2].test(href) )  {
		cardname = href.replace(/.*=/g, "");
		cardname = cardname.replace(/undefined/g, "");
	}

	// starcitygames
	//http://sales.starcitygames.com/cardsearch.php?game_type=1&singlesearch=Pyroclasm
	//http://sales.starcitygames.com/cardsearch.php?singlesearch=Skyshroud+Elite
	else if (AUTOCARD_NAME_RE[3].test(href) ) {
		cardname = href.replace(/.*=/g);
		cardname = cardname.replace(/undefined/g, "");
		link.setAttribute("rel", "");
	}

	// magiccards.info, magic-league
	else if (AUTOCARD_NAME_RE[4].test(href) ) {
		// http://magiccards.info/query?q=Shock
		if (href.match(/query/) ) {
			cardname = link.href.replace(/.*q=(.*)&?.*/g, "$1");
			cardname = cardname.replace(/^(%21|!)/g, ""); // remove opening ! or %21
		}
		else if (href.match(/autocard/) ) {
			// http://www.magiccards.info/autocard.php?card=Nightmare
			// http://www.magiccards.info/autocard/Nightmare
			cardname = href.replace(/.*(card=|card\/)/g);
			cardname = cardname.replace(/undefined/g, "");
		}
		else if (href.match(/[0-9]+[a-z]?\.html/) ) {
			// http://magiccards.info/ts/en/196.html
			// link doesn't have name info
			// maybe poster put the name of the card, if lucky
			cardname = link.innerHTML;
		}
		else if (href.match(/jpg$/)) {
			// http://magiccards.info/scans/en/arena/5.jpg
			cardname = href;
			link.attachment = true;
		}
	}

	// forum attachment, eg spoilers on mtgsalvation, SMF
	// http://forums.mtgsalvation.com/attachment.php?attachmentid=43144&d=1174759194
	else if (AUTOCARD_NAME_RE[5].test(href) ) {
		cardname = href;
		link.attachment = true;
	}

	// yawgatog.com, Oracle card changes
	// <a href="./?id=0">Angry Mob <span>
	else if (AUTOCARD_NAME_RE[6].test(url) && AUTOCARD_NAME_RE[7].test(link.innerHTML) ) {
			cardname = link.innerHTML.replace(/ <SPAN.*<\/SPAN>/ig);
			cardname = cardname.replace(/undefined/g, "");
	}

	// puremtgo, ultimatemtgo
	// http://www.mtgotraders.com/store/7E_Counterspell.html
	else if (AUTOCARD_NAME_RE[8].test(href) ) {
		cardname = href.replace(/[^_]+_(.+).html/g, "$1");
		cardname = cardname.replace(/undefined/g, "");
	}

	//mtgvault
	// http://www.mtgvault.com/ViewCard.aspx?CardName=Kjeldoran%20Outpost&Edition=ALL
	// http://www.mtgvault.com/ViewCard.aspx?CardName=Ad%20Nauseam
	else if (AUTOCARD_NAME_RE[9].test(href)) {
		cardname = href.replace(/.*CardName=(.*)/g, "$1");
	}

	// mtgsalvation curse forums
	else if (AUTOCARD_NAME_RE[10].test(href)) {
		cardname = linktext.replace(AUTOCARD_NAME_RE[10], "$2");
	}

	// scryfall
	else if (AUTOCARD_NAME_RE[11].test(href)) {
		cardname = link.href.replace(/^.*q=(%21|!)?(%22)?([^&]+?)(%22)?((&|\+set).*)?$/g, "$3");

		//alert(cardname);
	}
	else if (AUTOCARD_NAME_RE[12].test(href)) {
		// ieants.cc/magic/scry.php
		cardname = link.href.replace(/^.*name=(.*)$/g, "$1");

		//alert(cardname);
	}

	// crystalkeep, index listing
	// http://www.crystalkeep.com/cgi-bin/magicsearch.cgi?cardName=Bound%20(Bound/Determined)
	else if (href.match(/crystalkeep.com\/cgi-bin\/magicsearch/) && !href.match(/cardType/) ) {
		cardname = href.replace(/.*=/g);
		cardname = cardname.replace(/undefined/g, "");
		cardname = cardname.replace(/(.*)(\(|%28)(.*)(\/|%2[fF]).*(\)|%29).*/g, "$3"); // split cards
	}

	// crystalkeep, search listing
	// <A NAME="AEtherflame Wall">
	else if (url.match(/crystalkeep.com\/cgi-bin\/magicsearch/) ) {
		if (link.name) {
			cardname = link.name;
			cardname = cardname.replace(/.*\((.*\/.*)\)/g, "$1"); // split cards
		}
	}

	// slightlymagic forum
	// <A onmouseover="showCard(...);">CARDNAME</a>
	else if (link.onmouseover && link.onmouseover.toString().indexOf("showCard") != -1 ) {
		cardname = linktext;
	}

	return cardname;
}

function autocard_link2name(link) {
	// debug
	log(link);

	// find card's name
	var cardname = autocard_findcard(link);

	// if card is found, then do mouseover event
	if ( cardname != "" ) {
		cardname = autocard_fixcardname(cardname, link);

		// remove website's popup function
		if (link.hasAttribute("onmouseover")) {
			link.setAttribute("onmouseover", null);
		}
		if (link.hasAttribute("tooltip")) {
			link.setAttribute("tooltip", "");
		}
		// community.wizards.com has inline span that uses css instead of javascript
		var span = link.getElementsByClassName("linkCardHoverImage");
		if (span.length) {
			link.removeChild(span[0]);
		}

		link.addEventListener("mouseover", autocard_mouseover, true);
		link.addEventListener("mouseout", autocard_mouseout, false);
	}
}

function autocard_debug_init() {
	var p = document.createElement('p');
	p.id = "autocard_log";
	p.style.position = "fixed";
	p.style.width = "20em";
	p.style.height = "30em";
	p.style.border = "1px black solid";
	p.style.top = "0";
	p.style.right = "0";
	p.style.zIndex = "10000";
	p.style.overflow ="auto";

	p.innerHTML = "AUTOCARD LOGS<br>";

	document.body.style.position = "relative";
	p = document.body.appendChild(p);

}

function log(s) {
	if (autocard.debug) {
		var p = document.getElementById("autocard_log");
		p.innerHTML += s + "<br>";
	}
}

function autocard_createimg() {
	var img = document.createElement('img');
	//img.id = autocard.imgId;
	img.style.display = "none";
	img.width = autocard.imgWidth;
	img.height = autocard.imgHeight;
	img.style.position = "fixed";
	img.style.top = 0;
	img.style.left = 0;
	img.style.zIndex = 999999;

	// preload cardback and progress bar
	img.src = autocard.cardback;
	while(! (img.complete || img.width > 0));
	img.src = autocard.progressBar;
	while(! (img.complete || img.width > 0));
	img.style.backgroundImage = autocard.cardback;
	//img.style.backgroundColor = "663300";
	img.addEventListener("mouseout", autocard_mouseout, false);

	img = document.body.appendChild(img);
	autocard.imgEl = img;

	var img2 = document.createElement('img');
	//img2.id = autocard.imgId2;
	img2.style.display = "none";
	img2.width = autocard.imgWidth;
	img2.height = autocard.imgHeight;
	img2.style.position = "fixed";
	img2.style.top = 0;
	img2.style.left = 0;
	img2.style.zIndex = 999999;

	// preload cardback and progress bar
	img2.style.backgroundImage = autocard.cardback;
	//img.style.backgroundColor = "663300";
	img2.addEventListener("mouseout", autocard_mouseout, false);
	img2.addEventListener("error", autocard_fiximageurl, false);

	img2 = document.body.appendChild(img2);
	autocard.imgEl2 = img2;

	img_temp = document.createElement('img');
	img_temp.id = "img_temp";
	img_temp.style.display = "none";
	img_temp.style.visibility = "hidden";
	img_temp = document.body.appendChild(img_temp);
	img_temp.addEventListener("error", autocard_fiximageurl, false);
	img_temp.addEventListener("load", function(event) {autocard_imgloaded(event, this.getAttribute("cardname"), true);}, false);
	autocard.imgTemp = img_temp;

	return img;
}

function autocard_hide_css() {
	// CSS effects to suppress websites' own autocard popup
	//http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
	//http://stackoverflow.com/questions/7657363/changing-global-css-styles-from-javascript

	var cssNode = document.createElement('style');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.media = 'screen';
	cssNode.title = 'AutocardSheet';
	document.getElementsByTagName("head")[0].appendChild(cssNode);

	var mySheet = document.styleSheets[document.styleSheets.length-1];

	// insertRules
	for (var i=0; i < AUTOCARD_HIDE_CSS.length; i++) {
		mySheet.insertRule( AUTOCARD_HIDE_CSS[i] + " { display: none !important; visibility: hidden !important; }", mySheet.cssRules.length);
	}
}

function autocard_mtg() {
	// hide other card popups
	autocard_hide_css();
	// make an img for where the image is shown
	var img = autocard_createimg();
	// look for and store all links in the page
	var urls = document.getElementsByTagName("A");

	// if link matches criteria, add mouseover event
	for (i=0; i<urls.length;i++) {
		var link = urls[i];
		autocard_link2name(link);
	}

	window.acmd = false;
	if ( autocard.alwaysOn ) {
		window.acmd = true;
	}
	else
	{
		// add window event to toggle on or off
		window.addEventListener('dblclick', function() {
			window.acmd = !window.acmd;
			return false;
		}, true);
	}

	return false;
}

// INTERFACING EVENTS /////////////////////////////////////////////

function autocard_text2link() {
	// helper for browser menu commands
	// eg select an unlinked card name, right click to open menu, choose "Autocard link" to create a link for all unlinked text that match the selected strng
	if (window.getSelection) {
		var userSelection = window.getSelection();
		var userRange= userSelection.getRangeAt(0);
		var x = userRange.startContainer;
		// some elements like headers dont default to text type
		if (!x.nodeName || x.nodeName != "#text") {
			x = x.childNodes[0];
		}

		// below code inspired from text2link userjs

		if (x.nodeName == "#text") {
			var regex = new RegExp(userSelection, "g");
			var text = x.nodeValue.split(regex);

			if (text.length > 1) {
				var cards = x.nodeValue.match(regex);
				var index = 0, p = x.parentNode;
				var n = document.createDocumentFragment();
				n.appendChild(document.createTextNode(text[index]));

				while(index < cards.length) {
					var link = document.createElement('a');
					link.target = "autocard";
					link.href = autocard.replaceUrl + userSelection;
					autocard_fixcardname(userSelection.toString(), link);
					link.addEventListener("mouseover", autocard_mouseover, false);
					link.addEventListener("mouseout", autocard_mouseout, false);
					link.appendChild(document.createTextNode(userSelection));
					n.appendChild(link, x);
					index++;
					n.appendChild(document.createTextNode(text[index]), x);
				}
				p.replaceChild(n, x);
			}
		}
	}
}

// run script on document load
window.addEventListener('load',
	function() {
		if (autocard.debugOn) {
			autocard_debug_init();
		}
		autocard_mtg();
	}
, false);

// if new anchors are added later, parse those links
// e.g. card search engines using AJAX
// test if work with autocard_text2link function
window.addEventListener('DOMNodeInserted', function(event) {
	if (event.target.tagName && event.target.tagName=="A") {
		autocard_link2name(event.target);
	}
}, false);
