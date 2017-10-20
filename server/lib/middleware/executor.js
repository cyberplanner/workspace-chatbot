const logger = require("../../logger");

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
