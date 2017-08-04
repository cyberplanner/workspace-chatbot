const genericSuperchargers = require('../superchargers/genericSuperchargers');
const supercharger = require('../custom_modules/module_supercharger');

describe("Generic Superchargers", () => {

	it("Optional Question Metadata should be correct", () => {
    
    let optional = genericSuperchargers.optionalQuestion;

    // Assert on arguments
    expect(optional.arguments.length).toEqual(2);
    expect(optional.arguments[0]).toEqual(new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"));
    expect(optional.arguments[1]).toEqual(new supercharger.Parameter("QUESTION", "The message to sent as the Question.", "string"));

    // Assert on Display Name
    expect(optional.displayName);

    // Assert function ID is correct
    expect(optional.id).toEqual("generic__optional_question");
    
  });

	it("Optional Question should skip if userData exists for KEY", () => {

    let optional = genericSuperchargers.optionalQuestion;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      QUESTION: "How old are you?"
    };

    // Call supercharger function
    optional.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert that skip was called
    expect(skip).toHaveBeenCalled();

    // Assert that session.send (sending question) was NOT called
    expect(mockSession.send).not.toHaveBeenCalled();
    
  });


	it("Optional Question should NOT skip if userData doesn't exist for KEY", () => {

    let optional = genericSuperchargers.optionalQuestion;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      userData: {
        summary: {
          "email": "dancotton@test.com"
        }
      },
      conversationData: {
        
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      QUESTION: "How old are you?"
    };

    // Call supercharger function
    optional.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert that skip was NOT called
    expect(skip).not.toHaveBeenCalled();

    // Assert that session.send (sending question) was called
    // and that it was passed the question provided as a customArgument.
    expect(mockSession.send).toHaveBeenCalledWith("How old are you?");
    
  });

});