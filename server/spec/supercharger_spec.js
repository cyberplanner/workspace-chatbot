/*
  Supercharger registration document
*/
const mock = require("mock-require");

const PORT = process.env.PORT || "3978";
const endpoint = `http://localhost:${PORT}/`;

// Setup mock functions
const functions = {
  POST: {
    supercharger: options => {
      expect(options).toEqual({
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          arguments: [
            {
              name: "TEST_PARAM",
              description: "A parameter used in testing",
              dataType: "string"
            }
          ],
          displayName: "Test_Supercharger"
        })
      });
      return {
        json: () =>
          new Promise(resolve => {
            resolve({
              tst: true
            });
          })
      };
    }
  },
  GET: {},
  PUT: {}
};

mock("uuid/v1", () => "test-id");

mock("node-fetch", (url, options) => {
  let ep = url.replace(endpoint, "");
  let fn = functions[options.method][ep];
  if (fn) {
    return new Promise(resolve => resolve(fn(options)));
  } else {
    return false;
  }
});

let supercharger = require("../lib/supercharger");

describe("Supercharger", function() {
  it("should execute successfully with an entity based argument", function() {
    /* 
        Mock out fetch functions
    */
    let builder = {
      EntityRecognizer: {
        findEntity: (entities, id) => {
          expect(id).toEqual("WEBSITE_ENTITY");
          return "FLEX_BENEFITS";
        }
      }
    };

    let node = {
      supercharger: {
        arguments: {
          TEST_PARAM: "$WEBSITE_ENTITY"
        },
        id: "test-id"
      }
    };

    supercharger.init(builder);

    supercharger.register(
      new supercharger.Detail(
        [
          new supercharger.Parameter(
            "TEST_PARAM",
            "A parameter used in testing",
            "string"
          )
        ],
        "Test_Supercharger",
        (session, args, next, customArguments) => {
          expect(customArguments.TEST_PARAM).toEqual("FLEX_BENEFITS");
        }
      )
    );

    supercharger.execute(
      {
        userData: {}
      },
      {
        intent: {
          entities: []
        }
      },
      () => {},
      node
    );
  });
  it("should execute successfully with an mixed argument", function() {
    /* 
        Mock out fetch functions
    */
    let builder = {
      EntityRecognizer: {
        findEntity: (entities, id) => {
          expect(id).toEqual("WEBSITE_ENTITY");
          return "FLEX_BENEFITS";
        }
      }
    };

    let node = {
      supercharger: {
        arguments: {
          TEST_PARAM: "Hi there {WEBSITE_ENTITY} how are you?"
        },
        id: "test-id"
      }
    };

    supercharger.init(builder);

    supercharger.register(
      new supercharger.Detail(
        [
          new supercharger.Parameter(
            "TEST_PARAM",
            "A parameter used in testing",
            "string"
          )
        ],
        "Test_Supercharger",
        (session, args, next, customArguments) => {
          expect(customArguments.TEST_PARAM).toEqual(
            "Hi there FLEX_BENEFITS how are you?"
          );
        }
      )
    );

    supercharger.execute(
      {
        userData: {}
      },
      {
        intent: {
          entities: []
        }
      },
      () => {},
      node
    );
  });

  it("should execute successfully with a previous entity stored argument", function() {
    /* 
        Mock out fetch functions
    */
    let builder = {
      EntityRecognizer: {
        findEntity: (entities, id) => {
          return null;
        }
      }
    };

    let node = {
      supercharger: {
        arguments: {
          TEST_PARAM: "$WEBSITE_ENTITY"
        },
        id: "test-id"
      }
    };

    supercharger.init(builder);

    supercharger.register(
      new supercharger.Detail(
        [
          new supercharger.Parameter(
            "TEST_PARAM",
            "A parameter used in testing",
            "string"
          )
        ],
        "Test_Supercharger",
        (session, args, next, customArguments) => {
          expect(customArguments.TEST_PARAM).toEqual("PAYROLL");
        }
      )
    );

    supercharger.execute(
      {
        userData: {
          summary: {
            WEBSITE_ENTITY: "PAYROLL"
          }
        }
      },
      {
        intent: {
          entities: []
        }
      },
      () => {},
      node
    );
  });

  it("should execute successfully with a mixed previous entity stored argument", function() {
    /* 
        Mock out fetch functions
    */
    let builder = {
      EntityRecognizer: {
        findEntity: (entities, id) => {
          return null;
        }
      }
    };

    let node = {
      supercharger: {
        arguments: {
          TEST_PARAM: "Hi there $WEBSITE_ENTITY - how's it going?"
        },
        id: "test-id"
      }
    };

    supercharger.init(builder);

    supercharger.register(
      new supercharger.Detail(
        [
          new supercharger.Parameter(
            "TEST_PARAM",
            "A parameter used in testing",
            "string"
          )
        ],
        "Test_Supercharger",
        (session, args, next, customArguments) => {
          expect(customArguments.TEST_PARAM).toEqual(
            "Hi there PAYROLL - how's it going?"
          );
        }
      )
    );

    supercharger.execute(
      {
        userData: {
          summary: {
            WEBSITE_ENTITY: "PAYROLL"
          }
        }
      },
      {
        intent: {
          entities: []
        }
      },
      () => {},
      node
    );
  });
});
