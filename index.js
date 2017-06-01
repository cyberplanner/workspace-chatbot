/*-----------------------------------------------------------------------------
sample setup to get this started

# RUN THE BOT LOCALLY:

    * Install Bot Framework Emulator
    * Install ngrok found at https://ngrok.com/.
    * Run the bot from the command line using "index app.js".
    * In Emulator enter "http://localhost:3978/api/messages" as endpoint and connect.
    * say "Hello"

-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var config = require('config');
// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

process.env.LUIS_APP_ID = 'c61dfa54-fa2f-498b-9264-dd6d749395c3';
process.env.LUIS_APP_SUBSCRIPTION_KEY = 'f59febdb4cbb48f684f89379958a7272';

// Create chat connector for communicating with the Bot Framework Service, you have to register you Bot to get MICROSOFT_APP_ID and MICROSOFT_APP_PASSWORD
//var connector = new builder.ChatConnector({
//    appId: process.env.MICROSOFT_APP_ID,
//    appPassword: process.env.MICROSOFT_APP_PASSWORD
//});

//Create chat bot (to test locally)
var connector = new builder.ConsoleConnector().listen();

//Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/' + process.env.LUIS_APP_ID +'?subscription-key=' + process.env.LUIS_APP_SUBSCRIPTION_KEY;
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//Get intents configuration
var intentsConfig = config.get("Bot.intents");

console.error(intentsConfig.holidaysleft.name);

//HolidaysLeft intent. Luis based.
dialog.matches(intentsConfig.holidaysleft.name, [
    function (session, args, next) {
        session.send(intentsConfig.holidaysleft.messages.default);
    }
]);

//HolidaysEntitlement intent. Luis based.
dialog.matches(intentsConfig.holidaysentitlement.name, [
    function (session, args, next) {
        session.send(intentsConfig.holidaysentitlement.messages.default);
    }
]);

//welcome intent. Luis based.
dialog.matches(intentsConfig.welcome.name, [
    function (session, args, next) {
        session.send(intentsConfig.welcome.messages.default);
    }
]);

//default response if users command is unknown.
dialog.onDefault(builder.DialogAction.send(intentsConfig.none.messages.default));