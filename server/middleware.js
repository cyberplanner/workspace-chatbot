const Middleware = require("./lib/model/middleware");
const store = require("./lib/middleware/store");

//=========================================================
// Define Bot Middleware
//=========================================================

store.register(
  new Middleware(false, true, (event, next) => {
    logger.debug("[SEND] " + event.text);
    next();
  })
);

store.register(
  new Middleware(true, false, (event, next) => {
    logger.debug("[RECIEVE] " + event.message.text);
    next();
  })
);
