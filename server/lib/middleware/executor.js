const logger = require("../../logger");

/**
 * Code to iterate through and execute middleware sequentially, 
 * assuming that it supports the action type provided.
 * @param {Middleware} botMiddleware An array of Middleware objects
 * @param {*} action One of the exported, enumerated TYPES
 * @param {*} event The botbuilder middleware event.
 * @param {*} next The "next" function provided by botbuilder.
 */
const execute = (botMiddleware, action, event, next) => {
  logger.info(`[MIDDLEWARE-EXECUTOR] Executing events of type: ${action}`);
  let current = -1;
  const executor = () => {
    current++;
    if (
      botMiddleware &&
      botMiddleware[current] &&
      botMiddleware[current][action]
    ) {
      logger.debug(
        `[MIDDLEWARE-EXECUTOR] Executing middleware with index: ${current}`
      );
      botMiddleware[current].middleware(event, executor);
    } else if (!botMiddleware || !botMiddleware[current]) {
      next();
    } else {
      executor();
    }
  };
  executor();
};

module.exports = {
  execute,
  types: {
    SEND: "send",
    RECIEVE: "recieve"
  }
};
