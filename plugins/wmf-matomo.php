<?php
/**
 * Plugin Name: Wikimedia Matomo integration
 * Plugin Description: Output the Matomo Tag Manager script block in the document head.
 */

namespace WMF\Matomo;

function output_matomo_script(): void {
	?>
<!-- Matomo Tag Manager -->
<script type="text/javascript">
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
g.type='text/javascript'; g.async=true; g.src='https://piwik.wikimedia.org/js/container_HBF2fCC3.js'; s.parentNode.insertBefore(g,s);
</script>
<!-- End Matomo Tag Manager -->
	<?php
}

add_action( 'wp_head', __NAMESPACE__ . '\\output_matomo_script' );
