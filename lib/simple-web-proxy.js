var httpProxy = require('http-proxy');
var async = require('async');

//
// Expose version information through `pkginfo`.
//
require('pkginfo')(module, 'version');

// do not put "X-Forwarded-For" in request HTTP headers
// TODO: override http-proxy options through simple-web-proxy config?
var options = {
  enable: {xforward : false}
}

exports.createServer = function (config) {    

    return httpProxy.createServer(options, function (req, res, proxy) {

        // Buffer the request so that `data` and `end` events
        // are not lost during async operation(s).
        var buffer = httpProxy.buffer(req);

        // First link in the middlewares chain
        bootstrap = function(callback){
            if(!config.silent) {
                // TODO: log request?
            }
            callback(null, req, res, config);
        };

        // append middlewares in chain
        var tasks = new Array(bootstrap);
        tasks = tasks.concat(config.middlewares?config.middlewares:[]);

        // use async waterfall:
        // each middleware modify and passes req+res to the next 
        async.waterfall(tasks, 

            // Finally use http-proxy to proxify request to the target server
            function (err, req, res, config) {
                var host = req.headers['host'].split(':');
                var target = {host:host[0],port:(host[1]?host[1]:'80'), buffer:buffer}

                if(!config.silent) {
                    console.log('proxy request to: ', target.host, target.port);  
                }
                proxy.proxyRequest(req, res, target);

            });

    });

};