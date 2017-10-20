const execute = (botMiddleware, action) => {
  const current = -1;
  const executor = () => {
    current++;
    if (
      botMiddleware &&
      botMiddleware[current] &&
      botMiddleware[current][action]
    ) {
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
