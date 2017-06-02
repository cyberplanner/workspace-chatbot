var builder = require('botbuilder');
var restify = require('restify');
require('dotenv').config();


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
 var server = restify.createServer();
 server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
 });


 // Create chat bot (Uncomment before pushing)

//  var connector = new builder.ChatConnector({
//  	appId: process.env.MICROSOFT_APP_ID,
//      appPassword: process.env.MICROSOFT_APP_PASSWORD
//  });

//  var bot = new builder.UniversalBot(connector);
//  server.post('/api/messages', connector.listen());

//Create chat bot (Uncomment to test locally)

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/' + process.env.LUIS_APP_ID +'?subscription-key=' + process.env.LUIS_APP_SUBSCRIPTION_KEY;
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

module.exports = {
	getConnector: function () {
		return connector;
	},
	getBot: function () {
		return bot;
	},
	getBuilder: function () {
		return builder;
	},
	getRecognizer: function () {
		return recognizer;
	},
	getDialog: function () {
		return dialog;
	}
};
