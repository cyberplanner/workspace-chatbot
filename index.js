//=========================================================
// Import NPM modules
//=========================================================
require('dotenv').config();

const config = require('config');
const restify = require('restify');
const RestifyRouter = require('restify-routing');
const swaggerJSDoc = require('swagger-jsdoc');

//=========================================================
// Import Custom Modules
//=========================================================

const botComponents = require('./custom_modules/module_botComponents');
const dbcon = require('./custom_modules/module_dbConnection');
const botHandler = require('./bot.js');
let botLogger = require('./custom_modules/module_botLogger');

//=========================================================
// Import Subroutes
//=========================================================

const knowledgeRouter = require('./routes/knowledge');
const conversationRouter = require('./routes/conversation');
const superchargerRouter = require('./routes/supercharger');
const conversationHistoryRouter = require('./routes/conversationHistory');
const luisRouter = require('./routes/luis');

//=========================================================
// Setup Database Connections
//=========================================================

const knowledgeDB = dbcon.getConnection(process.env.CLOUDANT_KNOWLEDGE_DB_NAME);
const convDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_DB_NAME); 
const superchargerDB = dbcon.getConnection(process.env.CLOUDANT_SUPERCHARGER_DB_NAME);
const conversationHistoryDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_HISTORY_DB_NAME);

//=========================================================
// Setup Chat Logger by providing History DB
//=========================================================

const chatLogger = botLogger(conversationHistoryDB);

//=========================================================
// Swagger JS Doc
//=========================================================

const options = {
  swaggerDefinition: Object.assign({}, config.swagger, {
      host: process.env.SWAGGER_HOST
  }),
  apis: ['./routes/knowledge/index.js', './routes/conversationHistory/index.js', './routes/conversation/index.js','./routes/supercharger/index.js','./routes/luis/index.js'],
};
const swaggerSpec = swaggerJSDoc(options);

//=========================================================
// Define Bot Middleware
//=========================================================

// Structure of a middleware item.
//
// {
//     recieve: true,
//     send: false,
//     middleware: chatLogger.conversationLogger
// }
//

let botMiddleware = [
    {
        recieve: false,
        send: true,
        middleware: (event, next) => {
            console.log("[SEND] " + event.text);
            next();
        }
    },
    {
        recieve: true,
        send: false,
        middleware: (event, next) => {
            console.log("[RECIEVE] " + event.message.text);
            next();
        }
    },
];

//=========================================================
// Bots Dialogs
//=========================================================

const builder = botComponents.getBuilder();
const bot = botComponents.getBot();
const recognizer = botComponents.getRecognizer();
const dialog = botComponents.getDialog();

bot.use({
    botbuilder: (event, next) => {
        let current = -1;
        // Execute all registered "recieve" middleware.
        const executor = () => {
            current++;
            if (botMiddleware && botMiddleware[current] && botMiddleware[current].recieve) {
                botMiddleware[current].middleware(event, executor);
            } else if (!botMiddleware || !botMiddleware[current]) {
                next();
            } else {
                executor();
            }
        }
        executor();
    },
    send: (event, next)  => { 
        // Execute all registered "send" middleware.
        let current = -1;
        const executor = () => {
            current++;
            if (botMiddleware && botMiddleware[current] && botMiddleware[current].send) {
                botMiddleware[current].middleware(event, executor);
            } else if (!botMiddleware || !botMiddleware[current]) {
                next();
            } else {
                executor();
            }
        }
        executor();
    }
});

// Setup root dialog
bot.dialog('/', dialog);

// Use bot module to find response from conversation tree.
dialog.onDefault(botHandler.bot(knowledgeDB, convDB, builder, []));

//=========================================================
// Setup Restify
//=========================================================

const server = restify.createServer();
const rootRouter = new RestifyRouter();

//=========================================================
// Setup Restify Middleware
//=========================================================

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({
  origins: process.env.CROSS_SITE_ORIGINS.split(","),
  credentials: false
}));

//=========================================================
// Setup Swagger + Bot Framework Endpoints
//=========================================================

// Serve swagger docs
rootRouter.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Bot Framework Endpoint
rootRouter.post('/api/messages', botComponents.getConnector().listen());

//=========================================================
// Setup Subroutes
//=========================================================

// Knowledge Management
rootRouter.use('/knowledge', knowledgeRouter(knowledgeDB));

// conversation 
rootRouter.use('/conversation', conversationRouter(convDB));

// supercharger
rootRouter.use('/supercharger', superchargerRouter(superchargerDB));

// Conversation History Subroute
rootRouter.use('/conversationHistory', conversationHistoryRouter(conversationHistoryDB))

// LUIS Proxy
rootRouter.use('/luis', luisRouter());

//=========================================================
// Apply Routes to server
//=========================================================

rootRouter.applyRoutes(server);

//=========================================================
// Start Server Listening
//=========================================================

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});