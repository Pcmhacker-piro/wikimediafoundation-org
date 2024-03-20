<?php
/**
 * Plugin Name: Ultimate Maps by Supsystic PRO
 * Description: Ultimate Maps by Supsystic PRO version.
 * Plugin URI: https://supsystic.com/plugins/ultimate-maps-by-supsystic/
 * Author: supsystic.com
 * Author URI: https://supsystic.com/
 * Version: 1.1.11
 **/
	require_once(dirname(__FILE__). DIRECTORY_SEPARATOR. 'wpUpdater.php');


	register_activation_hook(__FILE__, 'utimateMapsProActivateCallback');
    register_deactivation_hook(__FILE__, array('modInstallerUms', 'deactivate'));
    register_uninstall_hook(__FILE__, array('modInstallerUms', 'uninstall'));

	add_filter('pre_set_site_transient_update_plugins', 'checkForPluginUpdateutimateMapsPro');
    add_filter('plugins_api', 'myPluginApiCallutimateMapsPro', 10, 3);

	if(!function_exists('getProPlugCodeUms')) {
		function getProPlugCodeUms() {
			return 'ultimate_maps_pro';
		}
	}
	if(!function_exists('getProPlugDirUms')) {
		function getProPlugDirUms() {
			return basename(dirname(__FILE__));
		}
	}
	if(!function_exists('getProPlugFileUms')) {
		function getProPlugFileUms() {
			return basename(__FILE__);
		}
	}
	if(!defined('S_YOUR_SECRET_HASH_'. getProPlugCodeUms()))
		define('S_YOUR_SECRET_HASH_'. getProPlugCodeUms(), 'qwfqfwqfw3r32r2r2r32r3fewqfq');

    if(!function_exists('checkForPluginUpdateutimateMapsPro')) {
        function checkForPluginUpdateutimateMapsPro($checkedData) {
            if(class_exists('wpUpdaterUms')) {
                return wpUpdaterUms::getInstance( getProPlugDirUms(), getProPlugFileUms(), getProPlugCodeUms() )->checkForPluginUpdate($checkedData);
            }
			return $checkedData;
        }
    }
    if(!function_exists('myPluginApiCallutimateMapsPro')) {
        function myPluginApiCallutimateMapsPro($def, $action, $args) {
            if(class_exists('wpUpdaterUms')) {
                return wpUpdaterUms::getInstance( getProPlugDirUms(), getProPlugFileUms(), getProPlugCodeUms() )->myPluginApiCall($def, $action, $args);
            }
			return $def;
        }
    }
	/**
	 * Check if there are base (free) version installed
	 */
	if(!function_exists('utimateMapsProActivateCallback')) {
		function utimateMapsProActivateCallback() {
			if(class_exists('frameUms')) {
				$arguments = func_get_args();
				call_user_func_array(array('modInstallerUms', 'check'), $arguments);
			}
		}
	}
	add_action('admin_notices', 'utimateMapsProInstallBaseMsg');
	if(!function_exists('utimateMapsProInstallBaseMsg')) {
		function utimateMapsProInstallBaseMsg() {
			if(!get_option('ums_full_installed') || !class_exists('frameUms')) {
				$plugName = 'Ultimate Maps by Supsystic';
				$plugWpUrl = 'https://wordpress.org/plugins/ultimate-maps-by-supsystic/';
				$html = '<div class="error"><p><strong style="font-size: 15px;">
					Please install Free (Base) version of '. $plugName. ' plugin, you can get it <a target="_blank" href="'. $plugWpUrl. '">here</a> or use Wordpress plugins search functionality,
					activate it, then deactivate and activate again PRO version of '. $plugName. '.
					In this way you will have full and upgraded PRO version of '. $plugName. '.</strong></p></div>';
				echo $html;
			}
		}
	}
