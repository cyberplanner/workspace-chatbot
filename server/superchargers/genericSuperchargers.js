const supercharger = require("../lib/supercharger");
const logger = require("../logger.js");

/**
 * Structures a question that is only asked 
 * if the storage key is empty.
 */
const optionalQuestion = new supercharger.Detail(
  // Supercharger Parameters.
  [
    new supercharger.Parameter(
      "KEY",
      "The key to store the value under (may be used later)",
      "string"
    ),
    new supercharger.Parameter(
      "QUESTION",
      "The message to sent as the Question.",
      "string"
    )
  ],

  // Supercharger Name
  "Optional Question",

  // Logic for supercharger
  (session, args, next, customArguments, skip) => {
    if (session.userData.summary[customArguments.KEY]) {
      logger.info(
        "[OPTIONAL-Q] DATA EXISTING: ",
        session.userData.summary[customArguments.KEY]
      );
      session.conversationData.skip = customArguments.KEY;
      if (session.userData.conversation.current.children.length > 0) {
        logger.info("[OPTIONAL-Q] Skipping.");
        skip(session, args, next);
      } else {
        logger.info("[OPTIONAL-Q] Not skipping, calling next.");
        next();
      }
    } else {
      logger.info("[OPTIONAL-Q] DATA DOESN'T EXIST");
      session.send(customArguments.QUESTION);
      next();
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
    new supercharger.Parameter(
      "KEY",
      "The key to store the value under (may be used later)",
      "string"
    ),
    new supercharger.Parameter(
      "MESSAGE",
      "The message to be sent after storage.",
      "string"
    )
  ],

  // Supercharger Name
  "Store Answer",

  // Logic for supercharger
  (session, args, next, customArguments, skip) => {
    if (
      session.userData.summary[customArguments.KEY] &&
      session.conversationData.skip === customArguments.KEY
    ) {
      logger.info(
        "[STORE-ANSWER] Optional Q was skipped, so reset skip and move on."
      );
      session.conversationData.skip = null;
    } else {
      logger.info("[STORE-ANSWER] No optional Q skipped, save under userData.");
      session.userData.summary[customArguments.KEY] = session.message.text;
    }
    logger.info("[STORE-ANSWER] Sending message: ", customArguments.message);
    session.send(customArguments.MESSAGE);
    if (session.userData.conversation.current.children.length > 0) {
      logger.info("[STORE-ANSWER] Skipping.");
      skip(session, args, next);
    } else {
      logger.info("[STORE-ANSWER] Not skipping, calling next.");
      next();
    }
  },

  // Supercharger ID.
  "generic__store_answer"
);

module.exports = {
  storeAnswer: storeAnswer,
  optionalQuestion: optionalQuestion
};
