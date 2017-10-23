const Middleware = require("../model/middleware");
const InvalidTypeError = require("../errors/InvalidTypeError");

class MiddlewareStore {
  constructor() {
    this._middleware = [];
  }

  /**
   * Registers a middleware object in the store.
   * @param {Middleware} middlewareObject 
   * @throws InvalidTypeError
   */
  register(middlewareObject) {
    if (middlewareObject instanceof Middleware) {
      this._middleware.push(middlewareObject);
    } else {
      throw new InvalidTypeError("Middleware", Middleware.name);
    }
  }

  get middleware() {
    return this._middleware;
  }
}

module.exports = new MiddlewareStore();
