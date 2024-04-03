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
	add_filter( 'wp_headers', __NAMESPACE__ . '\\set_connect_src_origins', 901, 2 );

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

/**
 * Expand the 'connect-src' origins list to allow ws: websocket.
 *
 * Resolves bug in wiki security plugin that only permits wss.
 *
 * @priority 901 -- Act after security plugin.
 *
 * @param string[] $headers Associative array of headerd to set.
 * @return string[] Updated HTTP headers array.
 */
function set_connect_src_origins( array $headers ) : array {
	if ( wp_get_environment_type() !== 'local' ) {
		return $headers;
	}

	$localhost_srcs = array_reduce(
		[ 8080, 8887, 8888 ],
		function( $carry, $port ) {
			return $carry .= "ws://localhost:$port wss://localhost:$port http://localhost:$port https://localhost:$port ";
		},
		''
	);

	$headers['Content-Security-Policy'] = preg_replace(
		"/connect-src 'self'/",
		"connect-src 'self' $localhost_srcs",
		$headers['Content-Security-Policy']
	);

	return $headers;
}
