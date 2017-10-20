/*
  Import middleware construction dependencies 
 */
const Middleware = require("./lib/model/middleware");
const store = require("./lib/middleware/store");

/*
  Import middleware dependencies
*/
const logger = require("./logger");

//=========================================================
// Define Bot Middleware
//=========================================================

store.register(
  new Middleware(false, true, (event, next) => {
    logger.debug("[SEND]:", event.text);
    next();
  })
);

store.register(
  new Middleware(true, false, (event, next) => {
    logger.debug("[RECIEVE]:", event.text);
    next();
  })
);
