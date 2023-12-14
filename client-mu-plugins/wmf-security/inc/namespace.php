<?php
/**
 * Custom WordPress REST API functionality for Wikimedia Foundation.
 *
 * @package wmf-security
 */

namespace WMF_Security;

use WP_REST_Request;

/**
 * Setup filters and actions for the namespace.
 */
function bootstrap() {
	add_filter( 'wmf/security/rest_api/public_endpoint', __NAMESPACE__ . '\\allow_dataset_csv_endpoint_access', 10, 2 );

	/**
	 * Allow 'unsafe-eval' script-src CSP directive so vega-lite plugin can render.
	 *
	 * There is some support in progress for Vega to work without eval, but it
	 * incurs a 10% performance penalty on rendering.
	 *
	 * @todo Evaluate practical performance impact on vega-lite plugin
	 * and evaluate whether we can effectively switch interpreter mode.
	 *
	 * @see https://github.com/vega/vega/issues/1106
	 * @see https://vega.github.io/vega/usage/interpreter/
	 */
	add_filter( 'wmf/security/csp/allow_unsafe_eval', '__return_true' );
}

/**
 * Enable Vega Lite dataset URIs to be accessed without authentication.
 *
 * @param bool            $is_allowed Whether the endpoint is publicly accessible, false by default.
 * @param WP_REST_Request $request    Active REST Request object.
 * @return bool Whether the anonymous request should be permitted.
 */
function allow_dataset_csv_endpoint_access( bool $is_allowed, WP_REST_Request $request ) : bool {
	if ( preg_match( '#wp/v2/.*/datasets/[^.]+\.csv#', $request->get_route() ) ) {
		return true;
	}
	return $is_allowed;
}
