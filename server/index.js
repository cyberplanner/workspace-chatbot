//=========================================================
// Import NPM modules
//=========================================================
require("dotenv").config();
const logger = require("./logger.js");

const config = require("config");
const swaggerJSDoc = require("swagger-jsdoc");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const fallback = require("express-history-api-fallback");

//=========================================================
// Import Custom Modules
//=========================================================

const botComponents = require("./lib/botComponents");
const dbcon = require("./lib/dbConnection");
const botHandler = require("./bot.js");
const expressMiddleware = require("./lib/expressMiddleware");
let botLogger = require("./lib/botLogger");

//=========================================================
// Import Subroutes
//=========================================================

const knowledgeRouter = require("./routes/knowledge");
const conversationRouter = require("./routes/conversation");
const superchargerRouter = require("./routes/supercharger");
const conversationHistoryRouter = require("./routes/conversationHistory");
const luisRouter = require("./routes/luis");

//=========================================================
// Setup Database Connections
//=========================================================

const knowledgeDB = dbcon.getConnection(process.env.CLOUDANT_KNOWLEDGE_DB_NAME);
const convDB = dbcon.getConnection(process.env.CLOUDANT_CONVERSATION_DB_NAME);
const superchargerDB = dbcon.getConnection(
  process.env.CLOUDANT_SUPERCHARGER_DB_NAME
);
const conversationHistoryDB = dbcon.getConnection(
  process.env.CLOUDANT_CONVERSATION_HISTORY_DB_NAME
);

// Run database bootstrapping
const databaseBootstrap = require("./lib/database/bootstrap.js");
databaseBootstrap(knowledgeDB, convDB);

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
  apis: [
    "./routes/knowledge/index.js",
    "./routes/conversationHistory/index.js",
    "./routes/conversation/index.js",
    "./routes/supercharger/index.js",
    "./routes/luis/index.js"
  ]
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
      logger.debug("[SEND] " + event.text);
      next();
    }
  },
  {
    recieve: true,
    send: false,
    middleware: (event, next) => {
      logger.debug("[RECIEVE] " + event.message.text);
      next();
    }
  }
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
      if (
        botMiddleware &&
        botMiddleware[current] &&
        botMiddleware[current].recieve
      ) {
        botMiddleware[current].middleware(event, executor);
      } else if (!botMiddleware || !botMiddleware[current]) {
        next();
      } else {
        executor();
      }
    };
    executor();
  },
  send: (event, next) => {
    // Execute all registered "send" middleware.
    let current = -1;
    const executor = () => {
      current++;
      if (
        botMiddleware &&
        botMiddleware[current] &&
        botMiddleware[current].send
      ) {
        botMiddleware[current].middleware(event, executor);
      } else if (!botMiddleware || !botMiddleware[current]) {
        next();
      } else {
        executor();
      }
    };
    executor();
  }
});

// Setup root dialog
bot.dialog("/", dialog);

// Use bot module to find response from conversation tree.
dialog.onDefault(botHandler.bot(knowledgeDB, convDB, builder, []));

//=========================================================
// Setup Express
//=========================================================

const server = express();
const root = `${__dirname}/public`;

//=========================================================
// Setup Express Middleware [TODO] Fix
//=========================================================

server.use(bodyParser.json());
server.use(expressMiddleware.crossOrigin);

//=========================================================
// Setup Swagger + Bot Framework Endpoints
//=========================================================

// Serve swagger docs
server.get("/swagger.json", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Bot Framework Endpoint
server.post("/api/messages", botComponents.getConnector().listen());

//=========================================================
// Setup Subroutes
//=========================================================

// Knowledge Management
server.use("/knowledge", knowledgeRouter(knowledgeDB));

// conversation
server.use("/conversation", conversationRouter(convDB));

// supercharger
server.use("/supercharger", superchargerRouter(superchargerDB));

// Conversation History Subroute
server.use(
  "/conversationHistory",
  conversationHistoryRouter(conversationHistoryDB)
);

// LUIS Proxy
server.use("/luis", luisRouter());

server.use(serveStatic(root));
server.use(fallback("index.html", { root }));

//=========================================================
// Setup error handling middleware
//=========================================================

server.use((err, req, res, next) => {
  let responseData;

  if (err.name === "JsonSchemaValidation") {
    logger.error(err.message);
    res.status(400);

    // Format the response body
    responseData = {
      statusText: "Bad Request",
      jsonSchemaValidation: true,
      validations: err.validations // All of your validation information
    };

    res.json(responseData);
  } else {
    // pass error to next error middleware handler
    next(err);
  }
});

//=========================================================
// Start Server Listening
//=========================================================

server.listen(process.env.port || process.env.PORT || 3978, function() {
  logger.info("%s listening to %s", server.name, server.url);
});
