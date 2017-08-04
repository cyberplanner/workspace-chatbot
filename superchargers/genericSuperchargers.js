const supercharger = require('../custom_modules/module_supercharger');

/**
 * Structures a question that is only asked 
 * if the storage key is empty.
 */
const optionalQuestion = new supercharger.Detail(
  // Supercharger Parameters.
  [
    new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"),
    new supercharger.Parameter("QUESTION", "The message to sent as the Question.", "string"),
  ],

  // Supercharger Name
  "Optional Question",

  // Logic for supercharger
  (session, args, next, customArguments, skip) => {
    if (session.userData.summary[customArguments.KEY]) {
      console.log("[OPTIONAL-Q] DATA EXISTING: " + session.userData.summary[customArguments.KEY]);
      session.conversationData.skip = customArguments.KEY;
      skip(session, args, next);
    } else {
      console.log("[OPTIONAL-Q] DATA DOESN'T EXIST");
      session.send(customArguments.QUESTION);
    }
  },

  // Supercharger ID.
  "generic__optional_question"
);

/**
 * Will store an answer against a key if the "optional 
 * question" prior for this key was asked.
 */
const storeAnswer = new supercharger.Detail(
  // Supercharger Parameters.
  [
    new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"),
    new supercharger.Parameter("MESSAGE", "The message to be sent after storage.", "string"),
  ],

  // Supercharger Name
  "Store Answer",

  // Logic for supercharger
  (session, args, next, customArguments, skip) => {
    if (session.userData.summary[customArguments.KEY] && session.conversationData.skip === customArguments.KEY) {
      session.conversationData.skip = null;
    } else {
      session.userData.summary[customArguments.KEY] = session.message.text;
    }
    session.send(customArguments.MESSAGE);
    skip(session, args, next);
  },

  // Supercharger ID.
  "generic__store_answer"
);

module.exports = {
  storeAnswer: storeAnswer,
  optionalQuestion: optionalQuestion
};