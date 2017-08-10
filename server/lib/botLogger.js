
let databases = {
    conversationHistory: null,
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
  updateConversationHistory(conversationId, text, "user");
  next(args);
}

/**
 * Update the conversation history with a string of text.
 * @param {*} conversationId the id of the conversation and hense the conversation history object.
 * @param {*} text the text to be added to the conversation history.
 */
const updateConversationHistory = (conversationId, text, user) => { 
  databases.conversationHistory.get(conversationId)
    .then(result => {
      result.conversationHistory.push({
        user,
        text
      });
      databases.conversationHistory.insert(result)
        .then(result => {
          console.log("[LOGGER] Sucessfully updated Conversation History");
        }).catch(error => {
          console.error("[LOGGER] There was an unexpected error updating the Conversation History, ", error);
        });
    }).catch(error => {
      if (!error.error === "not_found") {
        // Unexpected error, log it.
        console.error("[LOGGER] There was an unexpected error retrieveing the Conversation History, ", error);
      }
      // Entry doesn't exist, create it.
      createNewConversationHistory(conversationId, text, "user");
    });
}

/**
 * Creates a new conversation history and stores the id in the session.
 */
const createNewConversationHistory = (conversationId, text, user) => { 
  databases.conversationHistory.insert({_id: conversationId, conversationHistory:[{text, user}]})
      .then(result => { 
        console.log("[LOGGER] Conversation History created.");
      }).catch(error => {
        console.error("[LOGGER] There was an error creating the Conversation History, ", error);
      });
}

module.exports = db => {
  databases.conversationHistory = db;
  return {
    createNewConversationHistory,
    updateConversationHistory,
    conversationLogger
  }
}