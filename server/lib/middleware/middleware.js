const Middleware = require("../model/middleware");

class MiddlewareModule {
  constructor() {
    this._middleware = [];
  }

  register(middlewareObject) {
    if (middlewareObject.constructor.name === Middleware.constructor.name) {
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

module.exports = new MiddlewareModule();
