const Middleware = require("../model/middleware");

class MiddlewareStore {
  constructor() {
    this._middleware = [];
  }

  register(middlewareObject) {
    if (middlewareObject instanceof Middleware) {
      this._middleware.push(middlewareObject);
    } else {
      throw new Error(
        "Middleware passed is of an invalid type. Should be an instance of Middleware class"
      );
    }
  }

  get middleware() {
    return this._middleware;
  }
}

module.exports = new MiddlewareStore();
