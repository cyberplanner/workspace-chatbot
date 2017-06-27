
let databases = {
    conversation: null,
    knowledge: null
};
let conversation;
let defaultResponse = [];

/**
 * Sets the current node in the conversation to be equal to the node with given ID.
 * 
 * @param {String} id 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 */
const setCurrentConversation = (id, session, args, next) => {
  return databases.conversation.get(id)
    .then(conversation => {
      session.userData.conversation = {
        current: conversation
      };
      console.log("[CONVERSATION] Setting current");
      next();
    })
    .catch(error => {
      session.send(defaultResponse.responses[0]);
      next();
    });
}

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
  let chosenOne = conversationData.current.children.find(child => child.intentId === args.intent);
  if (chosenOne) {
    setCurrentConversation(chosenOne.nodeId, session, args, next);
  } else {
    next();
  }
}

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

  if (!conversationData) {
    console.log("[CONVERSATION] RESETTING TO ROOT");
    setCurrentConversation('root', session, args, next);
  } else {
    if (conversationData.current.children.length < 1) {
      console.log("[CONVERSATION] RESETTING TO ROOT AND PROGRESSING");
      setCurrentConversation('root', session, args, response => {
          conversationData = session.userData.conversation;
          progressConversation(session, args, next, conversationData);
        });
    } else {
      console.log("[CONVERSATION] PROGRESSING BASED ON INTENT");
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
  databases.knowledge.get(knowledgeID)
      .then(result => {
        console.log("[RESPONDER] RESPONDING - SUCCESS");
        session.send(result.responses[0]);
      })
      .catch(error => {
        console.log("[RESPONDER] RESPONDING - FAILED GETTING INTENT");
        session.send(defaultResponse.responses[0]);
      });
}

/**
 * Identifies responses based on conversation data and responds with 
 * an appropriate message from the knowledge item.
 * 
 * @param {Object} session 
 * @param {Object} args 
 * @param {Function} next 
 */
const responder = (session, args, next) => {
  console.log("[RESPONDER] ENTERED RESPONDER");
  let conversationData = session.userData.conversation;
  if (conversationData.current) {
    respondFromKnowledge(session, conversationData.current.message);
  } else {
    console.log("[RESPONDER] RESPONDING - NO INTENT");
    session.send(defaultResponse.responses[0]);
  }
};

// Bot is a sequence of middleware functions to be executed on each message
const bot = [conversationManager, responder];

module.exports = (knowledgeDB, conversationDB) => {
  // Setup databases
  databases.knowledge = knowledgeDB;
  databases.conversation = conversationDB;
  // Get default message
  databases.knowledge.get("default")
    .then(result => {
        defaultResponse = result;
    })
    .catch(error => {
        defaultResponse = {
          responses: "I\'m not sure how to reply to that. Please ask me again or in a different way?"
        };
    });
  // Return middleware functions
  return bot;
}
