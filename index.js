/*-----------------------------------------------------------------------------
sample setup to get this started

# RUN THE BOT LOCALLY:

    * Install Bot Framework Emulator
    * Install ngrok found at https://ngrok.com/.
    * Run the bot from the command line using "index app.js".
    * In Emulator enter "http://localhost:3978/api/messages" as endpoint and connect.
    * say "Hello"

-----------------------------------------------------------------------------*/
var dotenv = require('dotenv').load();
var dbcon = require('./custom_modules/module_dbConnection');
var db = dbcon.getConnection();

var config = require('config');
require('dotenv').config();
var botComponents = require('./custom_modules/module_botComponents');
//var dbcon = require('./custom_modules/module_dbConnection');

var builder = botComponents.getBuilder();
var bot = botComponents.getBot();
//var db = dbcon.getConnection();

//=========================================================
//Bots Dialogs
//=========================================================
// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var recognizer = botComponents.getRecognizer();
var dialog = botComponents.getDialog();
bot.dialog('/', dialog);

//Get intents configuration
var intentsConfig = config.get("Bot.intents");


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
