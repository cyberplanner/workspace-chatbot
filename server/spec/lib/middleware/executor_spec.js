const Middleware = require("../../../lib/model/middleware");
const middlewareExecutor = require("../../../lib/middleware/executor");

describe("Middleware Executor", () => {
  it("should call function when recieve is true for middleware and executor", () => {
    // Test Data
    let execution = [];
    const MiddlewareItem = new Middleware(true, false, (event, next) =>
      next(execution.push("middleware"))
    );

    middlewareExecutor.execute(
      [MiddlewareItem],
      middlewareExecutor.types.RECIEVE,
      {},
      () => execution.push("next")
    );

    expect(execution).toEqual(["middleware", "next"]);
  });

  it("should execute only first middleware where recieving and second is send only", () => {
    // Test Data
    let execution = [];
    const MiddlewareItem = new Middleware(true, false, (event, next) =>
      next(execution.push("middleware"))
    );
    const SendMiddlewareItem = new Middleware(false, true, (event, next) =>
      next(execution.push("send_middleware"))
    );

    middlewareExecutor.execute(
      [MiddlewareItem, SendMiddlewareItem],
      middlewareExecutor.types.RECIEVE,
      {},
      () => execution.push("next")
    );

    expect(execution).toEqual(["middleware", "next"]);
  });

  it("should execute neither middleware where recieving and both is send only", () => {
    // Test Data
    let execution = [];
    const MiddlewareItem = new Middleware(false, true, (event, next) =>
      next(execution.push("middleware"))
    );
    const SendMiddlewareItem = new Middleware(false, true, (event, next) =>
      next(execution.push("send_middleware"))
    );

    middlewareExecutor.execute(
      [MiddlewareItem, SendMiddlewareItem],
      middlewareExecutor.types.RECIEVE,
      {},
      () => execution.push("next")
    );

    expect(execution).toEqual(["next"]);
  });

  it("should execute both middleware where sending and both is send only", () => {
    // Test Data
    let execution = [];
    const MiddlewareItem = new Middleware(false, true, (event, next) =>
      next(execution.push("middleware"))
    );
    const SendMiddlewareItem = new Middleware(false, true, (event, next) =>
      next(execution.push("send_middleware"))
    );

    middlewareExecutor.execute(
      [MiddlewareItem, SendMiddlewareItem],
      middlewareExecutor.types.SEND,
      {},
      () => execution.push("next")
    );

    expect(execution).toEqual(["middleware", "send_middleware", "next"]);
  });

  it("should call next if no middleware provided", () => {
    // Test Data
    let execution = [];

    middlewareExecutor.execute([], middlewareExecutor.types.SEND, {}, () =>
      execution.push("next")
    );

    expect(execution).toEqual(["next"]);
  });
});
