/* COMMUNCIATION 

open connection 
set parameter received - respond with ok or error 

------------------------------------------------------------- */


var http = require('http');
var url  = require('url');

const 	express = require('express');
const 	app = express();
var   	expressWs = require('express-ws')(app);
var 	bodyParser = require("body-parser");

const port = 8080;

var options; 

/* --------------------------------------------------

Message processing 

----------------------------------------------------- */


function startServer () {
	console.log("started server.");
	app.use(express.static('.'));
	app.listen(port);
};


/* SEND */

startServer ();