<?php
/**
 * Custom WordPress REST API functionality for Wikimedia Foundation.
 *
 * @package wmf-rest-api
 */

namespace WMF\RESTAPI;

use WP_Error;

/**
 * Setup filters and actions for the namespace.
 */
function bootstrap() {
	add_filter( 'rest_authentication_errors', __NAMESPACE__ . '\\restrict_public_rest_api_access' );
	add_filter( 'wmf/rest-api/public_api_endpoints', __NAMESPACE__ . '\\allow_dataset_csv_endpoint_access', 10, 2 );
}

/**
 * Restrict public REST API access.
 *
 * Used to pass a WP_Error from an authentication method back to the API.
 *
 * @param WP_Error $errors WP_Error if authentication error, null if authentication method wasn't used, true if authentication succeeded.
 *
 * @return WP_Error|null|true
 */
function restrict_public_rest_api_access( $errors ) {
	// Check if a previous authentication was applied
	// and pass that result without modification.
	if ( true === $errors || is_wp_error( $errors ) ) {
		return $errors;
	}

	/**
	 * Filter which API endpoints are allowed to be accessed publicly so that
	 * specific endpoints can be made publicly accessible as required, such as
	 * vega-lite CSV endpoints.
	 *
	 * @param bool    $is_public    Whether the endpoint is publicly accessible, false by default.
	 * @param string  $rest_route   Which endpoint is being accessed.
	 */
	$is_public_endpoint = apply_filters( 'wmf/rest-api/public_api_endpoints', false, $GLOBALS['wp']->query_vars['rest_route'] ?? '' );

	// Return an unauthorized response error if user does not have editing capabilities.
	if ( ! current_user_can( 'edit_posts' ) && ! $is_public_endpoint ) {
		return new WP_Error(
			'rest_disabled',
			__( 'You do not have permission to access the REST API.', 'wmf-rest-api' ),
			[ 'status' => rest_authorization_required_code() ]
		);
	}

	return $errors;
}


/**
 * Allow CSV dataset endpoints to be accessed without authentication.
 *
 * @param bool    $is_public    Whether the endpoint is publicly accessible, false by default.
 * @param string  $rest_route   Which endpoint is being accessed.
 * @return bool Filtered public access flag.
 */
function allow_dataset_csv_endpoint_access( $is_public, $rest_route = '' ): bool {
	if ( preg_match( '#wp/v2/.*/datasets/[^.]+\.csv#', $rest_route ) ) {
		// Permit access to datasets CSV endpoints, which are loaded asyncronously
		// by the vega-lite visualization plugin.
		return true;
	}

	return $is_public;
}
