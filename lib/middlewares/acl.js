
module.exports = function(options) {

  var options = options || {},
      enabled = !(options.enabled == 'false'),
      allowed = options.allowed || [],
      denied = options.denied || []
      denyAll = denied.indexOf('all') >= 0;



	return function(req, res, config, next) {

		if (enabled && isAllowed(req.connection.remoteAddress || req.socket.remoteAddress)) {
			next(null, req, res, config);
		} else {
            // TODO: callback with error to stop execution chain?
			res.statusCode = 401;
			res.end('Banned');
		}

		function isAllowed(ip) {
			return
				// IP is authorized 
				allowed.indexOf(ip) >= 0 || 
				// or IP is not denied
				(!denyAll && denied.indexOf(ip) < 0 );
		}
	}
};