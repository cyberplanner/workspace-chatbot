const Middleware = require("../../../lib/model/middleware");

/*
  Setup test data
*/
const testFunction = () => 123;
const testRecieve = false;
const testSend = true;

describe("Test middleware model.", () => {
  it("Tests that the function is set correctly in constructor", () => {
    let testMiddleware = new Middleware(testRecieve, testSend, testFunction);
    expect(testMiddleware.middleware).toEqual(testFunction);
    expect(testMiddleware.middleware()).toEqual(testFunction());
  });

  it("Tests that the recieve flag is set correctly in constructor", () => {
    let testMiddleware = new Middleware(testRecieve, testSend, testFunction);
    expect(testMiddleware.recieve).toEqual(testRecieve);
  });

  it("Tests that the send flag is set correctly in constructor", () => {
    let testMiddleware = new Middleware(testRecieve, testSend, testFunction);
    expect(testMiddleware.send).toEqual(testSend);
  });

  it("Tests that a flag is set to true in constructor when provided with a string", () => {
    let testMiddleware = new Middleware(testRecieve, "Hi", testFunction);
    expect(testMiddleware.send).toEqual(true);
  });

  it("Tests that a flag is set to false in constructor when provided with null", () => {
    let testMiddleware = new Middleware(testRecieve, null, testFunction);
    expect(testMiddleware.send).toEqual(false);
  });
});
