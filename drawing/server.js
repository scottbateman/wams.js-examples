//////////// load required libraries
var url = require('url'),
	http = require('http'),
	path = require('path'),
    fs = require('fs'),
	WAMS = require(path.resolve('libs/wams-server.js')); // When using this example as base, make sure that this points to the correct WAMS server library path.

//////////// web server section

// Set up required variables
var homeDir = path.resolve(process.cwd(), '.');
var stat404 = fs.readFileSync(path.join(homeDir, '/status_404.html'));

// HTTP-server main function (handle incoming requests and serves files)
var serverFunc = function (req, res) {

	var uri = url.parse(req.url).pathname;

	// ---------- Choose your server file here-----------------------------------
	if (uri == "/") uri = "/models/recursive.html";
	// --------------------------------------------------------------------------

	file = fs.readFile(path.join(homeDir, uri), function (err, data) {	
		if (err) { // If file doesn't exist, serve 404 error.
			res.writeHead(404, {'Content-Type': 'text/html', 'Content-Length': stat404.length});
			res.end(stat404);
		}
		else {
			switch (/.*\.([^\?.]*).*/.exec(uri)[1]) { // extract file type
				case "htm":
				case "html":
					// handler for HTML-files
					res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length}); break;
				case "js":
					// handler for JavsScript-files
					res.writeHead(200, {'Content-Type': 'application/javascript', 'Content-Length': data.length}); break;
				default:
					// handler for all other file types
					res.writeHead(200, {'Content-Type': 'text/plain', 'Content-Length': data.length}); break;
			}
			res.end(data);
		}
	});
};

//////////// WAMS section

// Set up HTTP-server: listen on port 8080 and use serverFunc (see above) to serve files to clients.
var httpServer = http.createServer(serverFunc).listen(3000);

// Start WAMS using the HTTP-server
WAMS.listen(httpServer);

// WAMS Callback functions for different signals
WAMS.on("newCard", onNewCard);
WAMS.on("newViewSpace", onNewViewSpace);
WAMS.on("updateUserView", onUpdateUserView);
WAMS.on("updateCard", onUpdateCard);
WAMS.on("removeCard", onRemoveCard);
WAMS.on("needOldInfo", onNeedOldInfo);
WAMS.on("oldInfo", onOldInfo);
WAMS.on("consoleLog", onConsoleLog);

var cardID = 0;
function onNewCard(data) {
	data.data.id = cardID;
	cardID++;
	WAMS.emit("newCard", data);
}

var viewSpaceID = 0;
function onNewViewSpace(data){
	data.data.id = viewSpaceID;
	viewSpaceID++;
	WAMS.emit("newViewSpace", data);
}

function onUpdateUserView(data) {
	WAMS.emit("updateUserView", data);
}

function onUpdateCard(data){
	WAMS.emit("updateCard", data);
}

function onRemoveCard(data){
	WAMS.emit("removeCard", data);
}

function onNeedOldInfo(position){
	WAMS.emit("needOldInfo", position);
}

function onOldInfo(data){
	WAMS.emit("oldInfo", data);
}

function onConsoleLog(consoleMessage){
	console.log(consoleMessage.source+ ": " + consoleMessage.data);
}
