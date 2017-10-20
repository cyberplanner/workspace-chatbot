const Middleware = require("../../../lib/model/middleware");
const MiddlewareStore = require("../../../lib/middleware/store");

// Test Data
const MiddlewareItem = new Middleware(true, false, () => 321);
const MiddlewareItem2 = new Middleware(true, false, () => 456);
const InvalidMiddleware = {};

describe("Middleware Store", () => {
  it("should successfully store single middleware item", () => {
    MiddlewareStore.register(MiddlewareItem);

    expect(MiddlewareStore.middleware.length).toEqual(1);
    expect(MiddlewareStore.middleware[0]).toEqual(MiddlewareItem);
  });

  it("should successfully store a second middleware item", () => {
    MiddlewareStore.register(MiddlewareItem2);

    expect(MiddlewareStore.middleware.length).toEqual(2);
    expect(MiddlewareStore.middleware[0]).toEqual(MiddlewareItem);
    expect(MiddlewareStore.middleware[1]).toEqual(MiddlewareItem2);
  });

  it("should successfully store a second middleware item", () => {
    try {
      MiddlewareStore.register(InvalidMiddleware);
    } catch (e) {
      expect(e.message).toEqual(
        "Middleware passed is of an invalid type. Should be an instance of Middleware class"
      );
    }

    expect(MiddlewareStore.middleware.length).toEqual(2);
    expect(MiddlewareStore.middleware[0]).toEqual(MiddlewareItem);
    expect(MiddlewareStore.middleware[1]).toEqual(MiddlewareItem2);
  });
});
