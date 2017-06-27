
let databases = {
    conversation: null,
    knowledge: null
};
let conversation;
let defaultResponse = [];

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

const progressConversation = (session, args, next, conversationData) => {
  let chosenOne = conversationData.current.children.find(child => child.intentId === args.intent);
  if (chosenOne) {
    setCurrentConversation(chosenOne.nodeId, session, args, next);
  } else {
    next();
  }
}

/**
 * Manage current position in conversation
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

let bot = [conversationManager, responder];

module.exports = (knowledgeDB, conversationDB) => {
  databases.knowledge = knowledgeDB;
  databases.conversation = conversationDB;
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
}
