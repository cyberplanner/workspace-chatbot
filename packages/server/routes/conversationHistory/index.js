const express = require('express');
const validator = require( 'restify-json-schema-validation-middleware' )();

let db;

// Setup Router
const conversationHistoryRouter = express.Router();

/*
    Import Schemas
*/
const createConversationHistorySchema = require('./schemas/createConversationHistory.json');

/**
* @swagger
* /ConversationHistory/:id:
*   post:
*     description: Creates a new Conversation History item in storage.
*     required:
*      - id
*     properties:
*       id:
*         type: string  
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*       404:
*        description: doc not found
*/
conversationHistoryRouter.post('/:id', [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    db.insert(Object.assign(req.body, {
      _id: req.params.id
    }))
      .then(() => {
        res.json(200, { message: "Successfully saved Conversation History." });
      })
      .catch(error => {
        console.log(error);
        res.json(500, { error: error.reason });
      });
}]);


/**
* @swagger
* /ConversationHistory/:
*   post:
*     description: Creates a new Conversation History item in storage.
*     properties:
*       id:
*         type: string  
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*       404:
*        description: doc not found
*/
conversationHistoryRouter.post('/', [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    var knowledge = db.insert(Object.assign(req.body))
      .then(() => {
        res.json(200, { message: "Successfully saved Conversation History.", id: db._id });
      })
      .catch(error => {
        console.error(error);
        res.json(500, { error: error.reason });
      });
}]);


/**
 * @swagger
 * /ConversationHistory/:id:
 *   get:
 *     description: Returns the whole document for that id
 *     produces:
 *       - application/json
 *     properties:
 *       id:
 *         type: string
 *     required:
*      - id
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
conversationHistoryRouter.get('/:id', 
  (req, res) => {
    db.get(req.params.id)
      .then(doc => {
        res.json(doc);
      })
      .catch(err => {
        console.error("Error :", err)
        res.json(err.statusCode, { error: err.reason });
      });
  });


/**
 * @swagger
 * /ConversationHistory:
 *   get:
 *     description: Returns all Conversation History items from the storage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
conversationHistoryRouter.get('/',
  (req, res) => {
    db.list({ include_docs: true })
      .then(doc => {
        res.json(doc);
      })
      .catch(err => {
        console.error("Error :", err)
        res.json(err.statusCode, { error: err.reason });
      });
  });


/**
* @swagger
* /ConversationHistory/:id:
*   put:
*     description: Updates a new Conversation History item in storage.
*     required:
*      - id
*     properties:
*       id:
*         type: string
*     responses:
*       200:
*         description: Successful Update
*       500:
*         description: Update failed. Item may not exist in DB.
*/
conversationHistoryRouter.put('/:id', [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    db.get(req.params.id)
      .then(doc => {
        db.insert(Object.assign(req.body, {
          _rev: doc._rev,
          _id: req.params.id
        }))
          .then(() => {
            res.json(200, { message: "Successfully updated Conversation History." });
          })
          .catch(error => {
            console.error(error);
            res.json(500, { error: error.reason });
          });
      })
      .catch(err => {
        console.log("Error :" + err)
        res.json(err.statusCode, { error: err.reason });
      });
  }]);


module.exports = (database) => {
  db = database;
  return conversationHistoryRouter;
};