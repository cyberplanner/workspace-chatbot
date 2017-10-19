const botUtils = require("./lib/botUtils.js");
const supercharger = require("./lib/supercharger.js");
const userSuperchargers = require("./superchargers.js");
const logger = require("./logger.js");
let builder;

let databases = {
  conversation: null,
  knowledge: null
};
let conversation;
let defaultResponse = {
  response: ["Hi, I'm a Bot. How can I help?"]
};

process.on("unhandledRejection", function(reason, p) {
  logger.warn(
    "Possibly Unhandled Rejection at: Promise ",
    p,
    " reason: ",
    reason
  );
  // application specific logging here
});

/**
 * Sets the current node in the conversation to be equal to the node with given ID.
 * 
 * @param {String} id 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 */
const setCurrentConversation = (id, session, args, next) => {
  return databases.conversation
    .get(id)
    .then(conversation => {
      session.userData.conversation = {
        current: conversation
      };
      logger.debug("[CONVERSATION] Setting current");
      next();
    })
    .catch(error => {
      logger.error("[CONVERSATION] Failed to set current", error);
      next();
    });
};

/**
 * Identifies the next node in the conversation by comparing available 
 * child paths against the conversation intent.
 * 
 * Then calls setCurrentConversation to update state to reflect the current node
 * 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 * @param {Object} conversationData 
 */
const progressConversation = (session, args, next, conversationData) => {
  logger.debug("[PROGRESSION] INTENT: " + args.intent);
  let chosenOne = conversationData.current.children.find(
    child =>
      child.intentId === "*" ||
      (child.intentId === args.intent &&
        botUtils.checkConditions(child, session, args, next, builder))
  );
  if (chosenOne) {
    logger.debug("[PROGRESSION] Valid node present.");
    setCurrentConversation(chosenOne.nodeId, session, args, next);
  } else {
    logger.debug("[PROGRESSION] No valid node present.");
    checkForFallbacks(session, args, next, conversationData);
  }
};

/**
 * A function to allow retrieving the root node and checking for any potential 
 * fallback routes - navigating through that option if possible.
 * 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 * @param {Object} conversationData 
 */
const checkForFallbacks = (session, args, next, conversationData) => {
  // Get the root of the conversation
  return databases.conversation.get("root").then(conversation => {
    logger.debug("[FALLBACK] Retrieved root.");
    // Check the root node for a fallback.
    let chosenOne = conversation.children.find(child => {
      return (
        child.intentId === args.intent &&
        botUtils.checkConditions(child, session, args, next, builder)
      );
    });
    if (chosenOne) {
      logger.debug("[FALLBACK] Direct child of root is valid. Using.");
      // We have a viable path from the root - use it.
      setCurrentConversation(chosenOne.nodeId, session, args, next);
    } else {
      logger.debug("[FALLBACK] Direct child of root is NOT valid.");
      /*
          We're unable to find a good option on the 'root' node.
          So let's inspect it's children for a good option.
        */
      let childDocs = [];

      // Generate list of documents for bulk operation
      conversation.children.forEach(child => {
        childDocs.push({ id: child.nodeId });
      });

      //Perform bulk_get operation
      databases.conversation
        .bulk_get({ docs: childDocs })
        .then(response => {
          let children = [];
          response.results.forEach(child => {
            children.push(child.docs[0].ok.children);
          });
          let chosenOne = children.find(child => {
            return (
              child.intentId === args.intent &&
              botUtils.checkConditions(child, session, args, next, builder)
            );
          });
          if (chosenOne) {
            logger.debug("[CONVERSATION] Retrieved fallback by children.");
            // If we have a response for the given intent.... USE IT.
            setCurrentConversation(chosenOne.nodeId, session, args, () => {
              next();
            });
          } else {
            next();
          }
        })
        .catch(err => {
          logger.error("[ERROR] Loading child nodes.", err);
          next();
        });
    }
  });
};

/**
 * A middleware function to manage the current conversation state. Setting 
 * the current position in the conversation to the root if not already 
 * set. Then orchestrating the logic to advance through the conversation flow.
 * 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 */
const conversationManager = (session, args, next) => {
  let conversationData = session.userData.conversation;
  if (!session.userData.summary) {
    session.userData.summary = {};
  }
  if (!conversationData) {
    logger.debug("[CONVERSATION] RESETTING TO ROOT");
    setCurrentConversation("root", session, args, next);
  } else {
    if (conversationData.current.children.length < 1) {
      logger.debug("[CONVERSATION] RESETTING TO ROOT AND PROGRESSING");
      setCurrentConversation("root", session, args, response => {
        conversationData = session.userData.conversation;
        progressConversation(session, args, next, conversationData);
      });
    } else {
      logger.debug("[CONVERSATION] PROGRESSING BASED ON INTENT");
      progressConversation(session, args, next, conversationData);
    }
  }
};

/**
 * Responds to the user by retrieving the knowledge for the given ID.
 * 
 * @param {Object} session 
 * @param {String} knowledgeID 
 */
const respondFromKnowledge = (session, knowledgeID) => {
  databases.knowledge
    .get(knowledgeID)
    .then(result => {
      logger.debug("[RESPONDER] RESPONDING - SUCCESS");
      if (result.responses) {
        result.responses.forEach(function(response) {
          session.send(botUtils.processResponse(session, response));
        });
      } else {
        session.send(
          botUtils.processResponse(session, defaultResponse.responses[0])
        );
      }
    })
    .catch(error => {
      logger.error(
        "[RESPONDER] RESPONDING - FAILED GETTING KNOWLEDGE FROM DB",
        error
      );
      session.send(
        botUtils.processResponse(session, defaultResponse.responses[0])
      );
    });
};

/**
 * Skip the current node.
 * 
 * @param {*} session 
 * @param {*} args 
 * @param {*} next 
 */
const skip = (session, args, next) => {
  logger.debug("[SKIP] Requested.");
  progressConversation(
    session,
    args,
    () => {
      responder(session, args, next);
    },
    session.userData.conversation
  );
};

/**
 * Identifies responses based on conversation data and responds with 
 * an appropriate message from the knowledge item.
 * 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 */
const responder = (session, args, next) => {
  logger.debug("[RESPONDER] ENTERED RESPONDER");
  let conversationData = session.userData.conversation;
  if (session.message.summary) {
    try {
      session.userData.summary = Object.assign(
        {},
        session.userData.summary,
        JSON.parse(session.message.summary)
      );
    } catch (error) {
      logger.error(
        "[RESPONDER] RESPONDING - Failed setting userdata summary",
        error
      );
    }
  }
  if (conversationData.current) {
    if (
      conversationData.current.supercharger &&
      conversationData.current.supercharger
    ) {
      logger.debug("[RESPONDER] Calling Supercharger.");
      supercharger.execute(
        session,
        args,
        next,
        conversationData.current,
        skip,
        conversationData
      );
    } else {
      logger.debug("[RESPONDER] Responding from knowledge");
      respondFromKnowledge(session, conversationData.current.message);
    }
  } else {
    logger.debug("[RESPONDER] RESPONDING - NO INTENT");
    session.send(defaultResponse.responses[0]);
  }
};

// Bot is a sequence of middleware functions to be executed on each message

module.exports = {
  // Setup databases
  bot: (knowledgeDB, conversationDB, botBuilder, middleware) => {
    databases.knowledge = knowledgeDB;
    databases.conversation = conversationDB;
    builder = botBuilder;

    /*
      Setup Superchargers 
     */
    // Provide bot-builder
    supercharger.init(builder);

    // Clear existing superchargers
    supercharger
      .clear()
      // Then register new ones in DB
      .then(supercharger.apply);

    // Get default message
    databases.knowledge
      .get("default")
      .then(result => {
        defaultResponse = result;
      })
      .catch(error => {
        defaultResponse = {
          responses:
            "I'm not sure how to reply to that. Please ask me again or in a different way?"
        };
      });
    return [].concat(middleware, [conversationManager, responder]);
  }
};
