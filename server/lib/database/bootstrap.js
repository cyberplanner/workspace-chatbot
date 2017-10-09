const logger = require('../../logger.js');

const conversationRoot = require("./assets/conversation_root.json");
const knowledgeWelcome = require("./assets/knowledge_welcome.json");

/**
 * Bootstraps the provided "knowledge"/"conversation"
 * databases by populating their "root" documents
 * if not already provided.
 * @param {CloudantDB} knowledge The knowledge cloudant database object.
 * @param {CloudantDB} conversation The Conversation cloudant database object.
 */
module.exports = (knowledge, conversation) => {
  // Attempt get conversation root from DB.
  conversation.get(conversationRoot._id) 
    .then(doc => {
      // No need to bootstrap DB.
      logger.info("[BOOTSTRAP] Conversation Present");
    })
    .catch(error => {
      if (error.error === "not_found") {
        // Missing doc.
        conversation.insert(conversationRoot)
          .then(() => logger.info("[BOOTSTRAP] Conversation Success"))
          .catch(error => {
            logger.error("[BOOTSTRAP] Conversation Error.");            
            logger.error(error);
          });
      }
    });
  // Attempt get knowledge root from DB.
  knowledge.get(knowledgeWelcome._id) 
    .then(doc => {
      // No need to bootstrap DB.
      logger.info("[BOOTSTRAP] Knowledge Present");      
    })
    .catch(error => {
      if (error.error === "not_found") {
        // Missing doc.
        knowledge.insert(knowledgeWelcome)
          .then(() => logger.info("[Bootstrap] Knowledge Success"))
          .catch(error => {
            logger.error("[BOOTSTRAP] Knowledge Error.");            
            logger.error(error);
          });
      }
    });
};