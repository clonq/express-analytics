var useragent = require('express-useragent')

module.exports = middleware;

function middleware (req, res, next) {
	if (shouldProcess(req)) processRequest(req, res);
	next();
};

function shouldProcess(req) {
	var isRoot = req.url === '/';
	var isIndex = req.url.indexOf('/index.html') == 0;
	var isFile = req.url.indexOf('.') >= 0
	return isIndex && (isIndex || isFile);
}

function processRequest(req, res) {
	if (req.headers['user-agent'] !== undefined) {
		var ua = useragent.parse(req.headers['user-agent']);
		console.log('----------------------------------------------')
		console.log(req.url)
		console.log(ua)
		console.log('==============================================')
	}

}