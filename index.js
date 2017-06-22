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
const botHandler = require('./bot.js');

const builder = botComponents.getBuilder();
const bot = botComponents.getBot();
const db = dbcon.getConnection();

//=========================================================
//swagger setup
//=========================================================
var swaggerJSDoc = require('swagger-jsdoc');

// Swagger definition
config.swagger.host = process.env.HOST;
var swaggerDefinition = config.swagger;

// Options for the swagger docs
var options = {
  swaggerDefinition: swaggerDefinition,   // Import swaggerDefinitions
  apis: ['./routes/knowledge/index.js'],  // Path to the API docs
};

var swaggerSpec = swaggerJSDoc(options);

//=========================================================
// Bots Dialogs
//=========================================================
// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
const recognizer = botComponents.getRecognizer();
const dialog = botComponents.getDialog();
bot.dialog('/', dialog);

// Use bot module to find response from KM.
dialog.onDefault(botHandler(db));

//=========================================================
// Setup Server
//=========================================================

// Setup Restify Router
const server = restify.createServer();

// Add middleware
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({
  origins: process.env.CROSS_SITE_ORIGINS.split(","),
  credentials: false
}));

// Setup Restify Router
const rootRouter = new RestifyRouter();

// Serve swagger docs
rootRouter.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Bot Framework Endpoint
rootRouter.post('/api/messages', botComponents.getConnector().listen());

// Knowledge Management
rootRouter.use('/knowledge', knowledgeRouter(db));

// Apply routes
rootRouter.applyRoutes(server);

// Listen on port
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});