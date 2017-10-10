const express = require("express");
const logger = require("../../logger.js");

const expressJSONSchema = require("express-jsonschema").validate;
const validator = {
  body: schema => {
    return expressJSONSchema({
      body: schema
    });
  }
};
let db;

// Setup Router
const conversationHistoryRouter = express.Router();

/*
    Import Schemas
*/
const createConversationHistorySchema = require("./schemas/createConversationHistory.json");

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
conversationHistoryRouter.post("/:id", [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    db
      .insert(
        Object.assign(req.body, {
          _id: req.params.id
        })
      )
      .then(() => {
        res.json(200, { message: "Successfully saved Conversation History." });
      })
      .catch(error => {
        logger.error("Error processing post id: ", error);
        res.json(500, { error: error.reason });
      });
  }
]);

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
conversationHistoryRouter.post("/", [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    var knowledge = db
      .insert(Object.assign(req.body))
      .then(() => {
        res.json(200, {
          message: "Successfully saved Conversation History.",
          id: db._id
        });
      })
      .catch(error => {
        logger.error("Error processing post", error);
        res.json(500, { error: error.reason });
      });
  }
]);

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
conversationHistoryRouter.get("/:id", (req, res) => {
  db
    .get(req.params.id)
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      logger.error("Error processing get id: ", err);
      res.status(err.statusCode).json({ error: err.reason });
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
conversationHistoryRouter.get("/", (req, res) => {
  db
    .list({ include_docs: true })
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      logger.error("Error processing get: ", err);
      res.status(err.statusCode).json({ error: err.reason });
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
conversationHistoryRouter.put("/:id", [
  validator.body(createConversationHistorySchema),
  (req, res) => {
    db
      .get(req.params.id)
      .then(doc => {
        db
          .insert(
            Object.assign(req.body, {
              _rev: doc._rev,
              _id: req.params.id
            })
          )
          .then(() => {
            res.json(200, {
              message: "Successfully updated Conversation History."
            });
          })
          .catch(error => {
            logger.error(error);
            res.json(500, { error: error.reason });
          });
      })
      .catch(err => {
        logger.error(err);
        res.status(err.statusCode).json({ error: err.reason });
      });
  }
]);

module.exports = database => {
  db = database;
  return conversationHistoryRouter;
};
