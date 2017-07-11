let botUtils = require('./custom_modules/module_botUtils.js');
let superchargers = require('./superchargers.js')();

let databases = {
    conversation: null,
    knowledge: null
};
let conversation;
let defaultResponse = [];

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
    if (botUtils.checkConditions(chosenOne, session, args, next)) {
      setCurrentConversation(chosenOne.nodeId, session, args, next);
    } else {
      checkForFallbacks(session, args, next, conversationData);
    }
  } else {
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
      // Check the root node for a fallback.
      console.log("[CONVERSATION] Retrieved fallback.");
      let chosenOne = conversation.children.find(child => child.intentId === args.intent);
      if (chosenOne) {
        if (botUtils.checkConditions(chosenOne, session, args, next)) {
          // We have a viable path from the root - use it.
          setCurrentConversation(chosenOne.nodeId, session, args, next);
        }
      } else {
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
                console.log("[CONVERSATION] Retrieved fallback.");
                let chosenOne = node.children.find(child => child.intentId === args.intent);
                if (chosenOne) {
                  if (!replied && botUtils.checkConditions(chosenOne, session, args, next)) {
                    // If we have a response for the given intent.... USE IT.
                    setCurrentConversation(chosenOne.nodeId, session, args, () => {
                      resolve();
                      next();
                      replied = true;
                    });
                  } else {
                    resolve();
                  }
                } else {
                  // Otherwise - resolve
                  resolve();
                }
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
            // If we've not already replied - move on.
            next();
          })
      }
    })
    .catch(error => {
      session.send(defaultResponse.responses[0]);
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
          session.send(botUtils.processResponse(session, defaultResponse.response[0]));
        }
      })
      .catch(error => {
        console.log("[RESPONDER] RESPONDING - FAILED GETTING INTENT");
        session.send(botUtils.processResponse(session, defaultResponse.response[0]));
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
  if (session.message.summary) {
    try {
      session.userData.summary = Object.assign({}, session.userData.summary, JSON.parse(session.message.summary));
    } catch (error) {

    }
  }
  if (conversationData.current) {
    console.log(conversationData);
    if (conversationData.current.supercharger && conversationData.current.supercharger) {
      console.log("[RESPONDER] Calling Supercharger.");
      superchargers.execute(session, args, next, conversationData.current);
    } else {
      console.log("[RESPONDER] Responding from knowledge");
      respondFromKnowledge(session, conversationData.current.message);
    }
  } else {
    console.log("[RESPONDER] RESPONDING - NO INTENT");
    session.send(defaultResponse.responses[0]);
  }
};

// Bot is a sequence of middleware functions to be executed on each message
const bot = [conversationManager, responder];

module.exports = (knowledgeDB, conversationDB, builder) => {
  // Setup databases
  databases.knowledge = knowledgeDB;
  databases.conversation = conversationDB;
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
  // Return middleware functions
  return bot;
}
