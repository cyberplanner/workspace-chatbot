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
const botHandler = require('./bot.js');

/*
    Load routes
*/
const knowledgeRouter = require('./routes/knowledge');
const conversationRouter = require('./routes/conversation');
const superchargerRouter = require('./routes/supercharger');
<<<<<<< HEAD
const conversationHistoryRouter = require('./routes/conversationHistory');
=======
const luisRouter = require('./routes/luis');
const botHandler = require('./bot.js');
>>>>>>> master

const builder = botComponents.getBuilder();
const bot = botComponents.getBot();
const convDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_DB_NAME); 
const knowledgeDB = dbcon.getConnection(process.env.cloudant_dbName);
const superchargerDB = dbcon.getConnection(process.env.CLOUDANT_SUPERCHARGER_DB_NAME);
const conversationHistoryDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_HISTORY_DB_NAME);

// Setup Logger
const chatLogger = require('./custom_modules/module_botLogger')(conversationHistoryDB);

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

//Neocase status mapping
var statusMap = {
    "ENC": "In Progress", 
    "13": "Pending Manager Approval",
    "7": "Pending Requestor Rework",
    "14": "Pending Supervisor Approval",
    "15": "Pending Supervisor Approval", 
    "22": "SAP Failure", 
    "19": "Pending Employee Signature", 
    "17": "Pending Choice Employee", 
    "23": "In Progress Data Admin Team",
    "20": "Document Signed",
    "16": "Document Created"
}

var employeeMap = JSON.parse(process.env.NEOCASE_EMPLOYEE_MAP);

bot.use({ botbuilder: liveChat.middleware(bot, builder), send: (event, next)  => { 
    chatLogger.updateConversationHistory(event.address.conversation.id, event.text, "bot");
    next();
}});

// Setup root dialog
bot.dialog('/', dialog);

dialog.matches('LIVE_CHAT_HANDOVER', [
    (session, args, next) => {
        session.send("Ok, we'll try connecting you with an agent. Please wait.");
        liveChat.handoverUser(session, args, next);
    }
]);

dialog.matches('RETRIEVE_TICKET', [(session, args, next) => { 
    NeocaseAdapter.getAllCases().then(response => {
        if (!response[0].error || !response[0].error_details) { 
            let filteredReponse = response.filter(item => {
                return item.contactId === employeeMap[session.userData.summary.email.toUpperCase()];
            });
            if (filteredReponse.length !== 0) {
                session.send("Here are a list of your tickets:");
                filteredReponse.forEach(item => {
                    session.send("Ticket ID: " + item.id + "  \nQuestion: " + item.question + "  \nStatus: " +
                    statusMap[item.statusId] + "  \nCreation date: " + new Date(item.questionDate).toDateString());
                });
            } else { 
                session.send("You have no open tickets to show.");
            }
        }  else { 
            session.send("An error occured while retrieveing the tickets, " + response.error_details);
        }
    }).catch(error => {
        session.send("An unexpected error occured while retrieving the tickts.");
    });
}]);

let botmiddleware = [chatLogger.conversationLogger];
// Use bot module to find response from conversation tree.
dialog.onDefault(botHandler.bot(knowledgeDB, convDB, builder, botmiddleware));

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

<<<<<<< HEAD
//conversationHistory
rootRouter.use('/conversationHistory', conversationHistoryRouter(conversationHistoryDB))
=======
// luis
rootRouter.use('/luis', luisRouter());
>>>>>>> master

// Apply routes
rootRouter.applyRoutes(server);

// Listen on port
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});