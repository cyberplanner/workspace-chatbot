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
const superchargerRouter = express.Router();

//Import Schemas
const bulkCreateSuperchargerSchema = require("./schemas/bulkCreateSupercharger.json");
const createSuperchargerSchema = require("./schemas/createSupercharger.json");

/**
 * @swagger
 * /supercharger:
 *   get:
 *     description: Returns all supercharger items from the storage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
superchargerRouter.get("/", (req, res) => {
  db
    .list({ include_docs: true })
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      logger.error(err);
      res.status(err.statusCode).json({ error: err.reason });
    });
});

/**
 * @swagger
 * /supercharger/all:
 *   delete:
 *     description: Returns the whole document for that id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The Id for the particular cloudant document
 *         in: path
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
superchargerRouter.delete("/all", (req, res) => {
  db
    .list()
    .then(body => {
      let req = body.rows.map(row => {
        return Object.assign(row, {
          _deleted: true,
          _id: row.id,
          _rev: row.value.rev
        });
      });
      logger.debug(JSON.stringify(req));
      return db.bulk({
        docs: req
      });
    })
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch(err => {
      logger.error(err);
      res.status(err.statusCode).json({ error: err.reason });
    });
});

/**
 * @swagger
 * /supercharger/:id:
 *   get:
 *     description: Returns the whole document for that id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The Id for the particular cloudant document
 *         in: path
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
superchargerRouter.get("/:id", (req, res) => {
  db
    .get(req.params.id)
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      logger.error(err);
      res.status(err.statusCode).json({ error: err.reason });
    });
});

/**
* @swagger
* /supercharger/:
*   post:
*     description: Creates a new supercharger item in storage.
*     produces:
*       - application/json
*     parameters:
*       - name: post-schema
*         description: The JSON body of the request
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/createSupercharger'     
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*/
superchargerRouter.post("/", [
  validator.body(createSuperchargerSchema),
  (req, res) => {
    db
      .insert(Object.assign(req.body))
      .then(() => {
        res.json({ message: "Successfully saved supercharger." });
      })
      .catch(error => {
        logger.error(error);
        res.status(500).json({ error: error.reason });
      });
  }
]);

/**
* @swagger
* /supercharger/bulk:
*   post:
*     description: Creates a new supercharger item in storage for each supercharger document provided.
*     produces:
*       - application/json
*     parameters:
*       - name: post-schema
*         description: An array of supercharger items
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/bulkCreateSupercharger'     
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. An item may already exist in DB.
*/
superchargerRouter.post("/bulk", [
  validator.body(bulkCreateSuperchargerSchema),
  (req, res) => {
    db
      .bulk({
        docs: req.body
      })
      .then(() => {
        logger.debug("[SUPERCHARGER] Bulk registration succeeded.");
        res.json({ message: "Successfully saved superchargers." });
      })
      .catch(error => {
        logger.error("[SUPERCHARGER] Bulk registration failed.");
        logger.error(error);
        res.status(500).json({ error: error.reason });
      });
  }
]);

/**
* @swagger
* /supercharger/:Id:
*   put:
*     description: Updates the supercharger item in the storage.
*     parameters:
*       - name: id
*         description: The Id for the particular supercharger item you wish to update
*         in: path
*         type: string
*         required: true
*       - name: put-schema
*         description: The JSON body of the request
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/createSupercharger'
*     responses:
*       200:
*         description: Successful Update
*       500:
*         description: Update failed. Item may not exist in DB.
*/
superchargerRouter.put("/:id", [
  validator.body(createSuperchargerSchema),
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
            res.json(200, { message: "Successfully updated supercharger." });
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
  return superchargerRouter;
};
