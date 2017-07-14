let botUtils = require('./custom_modules/module_botUtils.js');
let superchargers = require('./superchargers.js')();

let databases = {
    conversation: null,
    conversationHistory: null,
    knowledge: null
};
let conversation;
let defaultResponse = {
  response: ["Hi, I'm a HR Bot. How can I help?"]
};

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
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
  return databases.conversation.get(id)
    .then(conversation => {
      session.userData.conversation = {
        current: conversation
      };
      console.log("[CONVERSATION] Setting current");
      next();
    })
    .catch(error => {
      console.log("[CONVERSATION] Failed to set current");
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
  console.log("[PROGRESSION] INTENT: " + args.intent);
  let chosenOne = conversationData.current.children.find(child => child.intentId === "*" || (child.intentId === args.intent && botUtils.checkConditions(child, session, args, next)));
  if (chosenOne) {
    console.log("[PROGRESSION] Valid node present.");
    setCurrentConversation(chosenOne.nodeId, session, args, next);
  } else {
    console.log("[PROGRESSION] No valid node present.");
    checkForFallbacks(session, args, next, conversationData);
  }
}

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
  return databases.conversation.get('root')
    .then(conversation => {
      console.log("[FALLBACK] Retrieved root.");
      // Check the root node for a fallback.
      let chosenOne = conversation.children.find(child => {
        return (child.intentId === args.intent) && botUtils.checkConditions(child, session, args, next);
      });
      if (chosenOne) {
        console.log("[FALLBACK] Direct child of root is valid. Using.");
        // We have a viable path from the root - use it.
        setCurrentConversation(chosenOne.nodeId, session, args, next);
      } else {
        console.log("[FALLBACK] Direct child of root is NOT valid.");
        /*
          We we're unable to find a good option on the 'root' node. 
          So let's inspect it's children for a good option.
        */
        let replied = false;
        let responses = [];
        
        // Iterate through
        conversation.children.forEach(child => {
          // Push promise into array of responses
          responses.push(new Promise((resolve, reject) => {
            // Get child from DB
            databases.conversation.get(child.nodeId)
              .then(node => {
                let chosenOne = node.children.find(child => {
                  return (child.intentId === args.intent) && botUtils.checkConditions(child, session, args, next); 
                });
                if (chosenOne && !replied) {
                  console.log("[CONVERSATION] Retrieved fallback by children.");
                  replied = true;
                  // If we have a response for the given intent.... USE IT.
                  setCurrentConversation(chosenOne.nodeId, session, args, () => {
                    resolve();
                    next();
                  });
                } else {
                  // Otherwise - resolve
                  resolve();
                }
              })
              .catch(err => {
                console.log("[ERROR] Loading child fallback node.");
                resolve();
              });
          }));
        });
        // Once we've checked every child's potential paths
        Promise.all(responses)
          .then(() => {
            // If we've not already replied - move on.
            if (!replied) {
              next();
            }
          }, () => {
            console.log("Check for fallbacks rejected.");
            // If we've not already replied - move on.
            next();
          })
      }
    })
    .catch(error => {
      console.log("[ERROR] Loading root node for fallback.");
      next();
    });

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
  if (!session.userData.summary) {
    session.userData.summary = {};
  }
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
        if (result.responses) { 
          result.responses.forEach(function(response) { 
            session.send(botUtils.processResponse(session, response));
          });
        } else { 
          session.send(botUtils.processResponse(session, defaultResponse.responses[0]));
        }
      })
      .catch(error => {
        console.log("[RESPONDER] RESPONDING - FAILED GETTING KNOWLEDGE FROM DB");
        session.send(botUtils.processResponse(session, defaultResponse.responses[0]));
      });
}

/**
 * Skip the current node.
 * 
 * @param {*} session 
 * @param {*} args 
 * @param {*} next 
 */
const skip = (session, args, next) => {
  console.log("[SKIP] Requested.");
  progressConversation(session, args, () => {
    responder(session, args, next);
  }, session.userData.conversation);
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
  if (session.message.summary) {
    try {
      session.userData.summary = Object.assign({}, session.userData.summary, JSON.parse(session.message.summary));
    } catch (error) {

    }
  }
  if (conversationData.current) {
    if (conversationData.current.supercharger && conversationData.current.supercharger) {
      console.log("[RESPONDER] Calling Supercharger.");
      superchargers.execute(session, args, next, conversationData.current, skip, conversationData);
    } else {
      console.log("[RESPONDER] Responding from knowledge");
      respondFromKnowledge(session, conversationData.current.message);
    }
  } else {
    console.log("[RESPONDER] RESPONDING - NO INTENT");
    session.send(defaultResponse.responses[0]);
  }
};

/**
 * Stores the history of the conversation. 
 * If the conversation history id is present in the session then the entry will be updated.
 * If the conversation history id is not present in the session then a new conversation history will be created 
 * @param {Object} session
 * @param {Object} args
 * @param {Function} next
 */
const conversationLogger = (session, args, next) => { 
  console.log("[LOGGER] LOGGING CONVERSATION");
  let conversationId = session.message.address.conversation.id;
  let text = session.message.text;
  updateConversationHistory(conversationId, text);
  next(args);
}

/**
 * Update the conversation history with a string of text.
 * @param {*} conversationId the id of the conversation and hense the conversation history object.
 * @param {*} text the text to be added to the conversation history.
 */
var updateConversationHistory = (conversationId, text) => { 
  databases.conversationHistory.get(conversationId)
    .then(result => {
      result.conversationHistory.push(text);
      console.log(result);
      databases.conversationHistory.insert(result)
        .then(result => {
          console.log("[LOGGER] Sucessfully updated Conversation History");
        }).catch(error => {
          console.log("[LOGGER] There was an unexpected error updating the Conversation History, " + error);
        });
    }).catch(error => {
      if (!error.error === "not_found") {
        // Unexpected error, log it.
        console.log("[LOGGER] There was an unexpected error retrieveing the Conversation History, " + error);
      }
      // Entry doesn't exist, create it.
      createNewConversationHistory(conversationId, text);
    });
}

/**
 * Creates a new conversation history and stores the id in the session.
 */
const createNewConversationHistory = (conversationId, text) => { 
  databases.conversationHistory.insert({_id: conversationId, conversationHistory:[text]})
      .then(result => { 
        console.log("[LOGGER] Conversation History created.");
      }).catch(error => {
        console.log("[LOGGER] There was an error creating the Conversation History, " + error);
      });
}

// Bot is a sequence of middleware functions to be executed on each message
const bot = [conversationLogger, conversationManager, responder];

module.exports = {
  // Setup databases
  bot: (knowledgeDB, conversationDB, conversationHistoryDB, builder) => {
  databases.knowledge = knowledgeDB;
  databases.conversation = conversationDB;
  databases.conversationHistory = conversationHistoryDB;
  superchargers.init(builder);
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
    return bot;
  },
  // Return middleware functions
  updateConversationHistory: updateConversationHistory
}
