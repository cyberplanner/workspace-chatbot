const genericSuperchargers = require('../superchargers/genericSuperchargers');
const supercharger = require('../custom_modules/module_supercharger');

describe("Optional Question Supercharger", () => {

	it("Optional Question Metadata should be correct", () => {
    
    let optional = genericSuperchargers.optionalQuestion;

    // Assert on arguments
    expect(optional.arguments.length).toEqual(2);
    expect(optional.arguments[0]).toEqual(new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"));
    expect(optional.arguments[1]).toEqual(new supercharger.Parameter("QUESTION", "The message to sent as the Question.", "string"));

    // Assert on Display Name
    expect(optional.displayName).toEqual("Optional Question");

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

	it("Optional Question should set value of skip if userData exists for KEY", () => {

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

    // Assert that skip value in conversationData is equal to KEY.
    expect(mockSession.conversationData.skip).toEqual("age");
    
  });

	it("Optional Question should NOT set value of skip if userData exists for KEY", () => {

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

    // Assert that skip value in conversationData is equal to KEY.
    expect(mockSession.conversationData.skip).not.toEqual("age");
    
  });

});

describe("Store Answer Supercharger", () => {

	it("Metadata should be correct", () => {
    
    let answerStorage = genericSuperchargers.storeAnswer;

    // Assert on arguments
    expect(answerStorage.arguments.length).toEqual(2);
    expect(answerStorage.arguments[0]).toEqual(new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"));
    expect(answerStorage.arguments[1]).toEqual(new supercharger.Parameter("MESSAGE", "The message to be sent after storage.", "string"));

    // Assert on Display Name
    expect(answerStorage.displayName).toEqual("Store Answer");

    // Assert function ID is correct
    expect(answerStorage.id).toEqual("generic__store_answer");
    
  });

	it("should NOT modify current answer if skip is equal to key", () => {

    let storeAnswer = genericSuperchargers.storeAnswer;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: "age"
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      MESSAGE: "Thanks, we've got your age."
    };

    // Call supercharger function
    storeAnswer.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert that the value is still constant.
    expect(mockSession.userData.summary.age).toEqual(54);
    
  });

	it("SHOULD modify current answer if skip is NOT equal to key", () => {

    let storeAnswer = genericSuperchargers.storeAnswer;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: null
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      MESSAGE: "Thanks, we've got your age."
    };

    // Call supercharger function
    storeAnswer.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert that the value is still constant.
    expect(mockSession.userData.summary.age).toEqual(34);
    
  });

	it("should always send a message", () => {

    let storeAnswer = genericSuperchargers.storeAnswer;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: null
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      MESSAGE: "Thanks, we've got your age."
    };

    // Call supercharger function
    storeAnswer.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert that the message was sent when the value was replaced.
    expect(mockSession.send).toHaveBeenCalledWith("Thanks, we've got your age.");

    let mockSessionSkip = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: "skip"
      },
      send: jasmine.createSpy("send2")
    };

    // Call supercharger function
    storeAnswer.function(mockSessionSkip, {}, {}, mockCustomArgs, skip);

    // Assert that the message was sent when the value was NOT replaced.
    expect(mockSessionSkip.send).toHaveBeenCalledWith("Thanks, we've got your age.");
    
  });

	it("should always call skip", () => {

    let storeAnswer = genericSuperchargers.storeAnswer;
    let skip = jasmine.createSpy("skip");
    let skip2 = jasmine.createSpy("skip2");

    // Setup data required to cause storage to occur
    let mockSession = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: null
      },
      send: jasmine.createSpy("send")
    };

    // Setup data required to cause no-change
    let mockSessionSkip = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: "age"
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      MESSAGE: "Thanks, we've got your age."
    };

    // Call supercharger function
    storeAnswer.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Call supercharger function with skippable parameters
    storeAnswer.function(mockSessionSkip, {}, {}, mockCustomArgs, skip2);

    // Assert that both skips have been called.
    expect(skip).toHaveBeenCalled();
    expect(skip2).toHaveBeenCalled();

  });

	it("should reset skip if it matched the key provided", () => {

    let storeAnswer = genericSuperchargers.storeAnswer;
    let skip = jasmine.createSpy("skip");

    let mockSession = {
      message: {
        text: 34
      },
      userData: {
        summary: {
          "age": 54
        }
      },
      conversationData: {
        skip: "age"
      },
      send: jasmine.createSpy("send")
    };

    let mockCustomArgs = {
      KEY: "age",
      MESSAGE: "Thanks, we've got your age."
    };

    // Call supercharger function
    storeAnswer.function(mockSession, {}, {}, mockCustomArgs, skip);

    // Assert skip has been reset.
    expect(mockSession.conversationData.skip).toEqual(null);
    
  });
});