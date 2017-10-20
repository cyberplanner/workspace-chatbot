class Middleware {
  constructor(executeOnRecieve, executeOnSend, middlewareFunction) {
    this._executeOnRecieve = new Boolean(executeOnRecieve);
    this._executeOnSend = new Boolean(executeOnSend);
    this._middleware = middlewareFunction;
  }
  get recieve() {
    return this._executeOnRecieve;
  }
  get send() {
    return this._executeOnSend;
  }
  get middleware() {
    return this._middleware;
  }
}

module.exports = Middleware;
