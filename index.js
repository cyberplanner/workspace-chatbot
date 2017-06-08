/*-----------------------------------------------------------------------------
sample setup to get this started

# RUN THE BOT LOCALLY:

    * Install Bot Framework Emulator
    * Install ngrok found at https://ngrok.com/.
    * Run the bot from the command line using "index app.js".
    * In Emulator enter "http://localhost:3978/api/messages" as endpoint and connect.
    * say "Hello"

-----------------------------------------------------------------------------*/

const config = require('config');
require('dotenv').config();
const botComponents = require('./custom_modules/module_botComponents');
const restify = require('restify');
const dbcon = require('./custom_modules/module_dbConnection');
const RestifyRouter = require('restify-routing');

/*
    Load routes
*/
const knowledgeRouter = require('./routes/knowledge');
const builder = botComponents.getBuilder();
const bot = botComponents.getBot();
const db = dbcon.getConnection();

//=========================================================
//swagger setup
//=========================================================
var swaggerJSDoc = require('swagger-jsdoc');

// Swagger definition
var swaggerDefinition = config.swagger;

// Options for the swagger docs
var options = {
  swaggerDefinition: swaggerDefinition,   // Import swaggerDefinitions
  apis: ['./routes/knowledge.js'],  // Path to the API docs
};

var swaggerSpec = swaggerJSDoc(options);

//=========================================================
// Bots Dialogs
//=========================================================
// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
const recognizer = botComponents.getRecognizer();
const dialog = botComponents.getDialog();
bot.dialog('/', dialog);

//Get intents configuration
const intentsConfig = config.get("Bot.intents");


//HolidaysLeft intent. Luis based.
dialog.matches(intentsConfig.holidaysleft.name, [
    (session, args, next) => {
        session.send(intentsConfig.holidaysleft.messages.default);
    }
]);

//HolidaysEntitlement intent. Luis based.
dialog.matches(intentsConfig.holidaysentitlement.name, [
    (session, args, next) => {
        session.send(intentsConfig.holidaysentitlement.messages.default);
    }
]);

//welcome intent. Luis based.
dialog.matches(intentsConfig.welcome.name, [
    (session, args, next) => {
        session.send(intentsConfig.welcome.messages.default);
    }
]);

//default response if users command is unknown.
dialog.onDefault(builder.DialogAction.send(intentsConfig.none.messages.default));

//=========================================================
// Setup Server
//=========================================================

// Setup Restify Router
const server = restify.createServer();

// Add middleware
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Setup Restify Router
const rootRouter = new RestifyRouter();

// Serve swagger docs
rootRouter.get('/api-docs.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Bot Framework Endpoint
rootRouter.post('/api/messages', botComponents.getConnector().listen());

// Knowledge Management
rootRouter.use('/knowledge', knowledgeRouter);

// Apply routes
rootRouter.applyRoutes(server);

// Listen on port
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});