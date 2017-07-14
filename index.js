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
const NeocaseAdapter = require('./custom_modules/module_neocaseAdapter');
const liveChat = require('./custom_modules/module_liveChat');

/*
    Load routes
*/
const knowledgeRouter = require('./routes/knowledge');
const conversationRouter = require('./routes/conversation');
const superchargerRouter = require('./routes/supercharger');
const luisRouter = require('./routes/luis');
const botHandler = require('./bot.js');

const builder = botComponents.getBuilder();
const bot = botComponents.getBot();
const convDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_DB_NAME); 
const knowledgeDB = dbcon.getConnection(process.env.cloudant_dbName);
const superchargerDB = dbcon.getConnection(process.env.CLOUDANT_SUPERCHARGER_DB_NAME);

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
  apis: ['./routes/knowledge/index.js','./routes/conversation/index.js','./routes/supercharger/index.js','./routes/luis/index.js'],  // Path to the API docs
};

var swaggerSpec = swaggerJSDoc(options);

//=========================================================
// Bots Dialogs
//=========================================================
// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
const recognizer = botComponents.getRecognizer();
const dialog = botComponents.getDialog();

bot.use({ botbuilder: liveChat.middleware(bot, builder)});

// Setup root dialog
bot.dialog('/', dialog);

dialog.matches('LIVE_CHAT_HANDOVER', [
    (session, args, next) => {
        session.send("Ok, we'll try connecting you with an agent. Please wait.");
        liveChat.handoverUser(session, args, next);
    }
]);

// Setup custom matcher for advanced problem (creating cases)
dialog.matches('MOVE_BASE_LOCATION', [(session, args, next) => {
    // Confirm employee number
    builder.Prompts.text(session, "Ok great, first can you confirm your employee number?");
}, (session, args, next) => {
    session.userData.employee = args.response;
    // Identify the location of the new base
    builder.Prompts.text(session, "Thank you. Now can you confirm the office you would like to be your new base location?");
}, (session, args, next) => {
    session.newBase = args.response;
    let question = "I'd like to change my base location to " + session.newBase + ". My employee number is " + session.userData.employee;
    // Call Neocase
    NeocaseAdapter.createNewCase({
        "contact": {
            "identifier": "820899",
            "email": "EDWARD.DE-MOTT@CAPGEMINI.COM",
            "firstName": "Edward",
            "lastName": "De Mott"
        },
        "question": question,
        "serviceOption": {
            "name": "UK-EMPLOYMENT CHANGES"
        },
        "queue": {
            "id": 2
        }
    }).then(response => {
        if (!response[0] || !response[0].error) {
            session.send("I've successfully created your case for you, here's your reference ID: #" + response.id + ".");
            session.send("Is there anything else I can help with today?")
        } else {
            session.send(response[0].error_details);
        }
    })
    .catch(error => {
        
    });
    session.send("Thank you, I will raise the following ticket with HR: \n" + `"${question}"`);
    
}]);

// Use bot module to find response from KM.
dialog.onDefault(botHandler(knowledgeDB, convDB));

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
rootRouter.use('/knowledge', knowledgeRouter(knowledgeDB));

// conversation 
rootRouter.use('/conversation', conversationRouter(convDB));

// supercharger
rootRouter.use('/supercharger', superchargerRouter(superchargerDB));

// luis
rootRouter.use('/luis', luisRouter());

// Apply routes
rootRouter.applyRoutes(server);

// Listen on port
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});