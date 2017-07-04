// Module Imports
const RestifyRouter = require('restify-routing');
const validator = require('restify-json-schema-validation-middleware')();

let db;

// Setup Router
let knowledgeRouter = new RestifyRouter();

/*
    Import Schemas
*/
const createKnowledgeSchema = require('./schemas/createKnowledge.json');

/**
* @swagger
* /knowledge/:id:
*   post:
*     description: Creates a new Knowledge Management item in storage.
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
knowledgeRouter.post('/:id',
  validator.body(createKnowledgeSchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    db.insert(Object.assign(req.body, {
      _id: req.params.id
    }))
      .then(() => {
        res.json(200, { message: "Successfully saved knowledge." });
      })
      .catch(error => {
        console.log(error);
        res.json(500, { error: error.reason });
      });
  });


/**
* @swagger
* /knowledge/:
*   post:
*     description: Creates a new Knowledge Management item in storage.
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
knowledgeRouter.post('/',
  validator.body(createKnowledgeSchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    var knowledge = db.insert(Object.assign(req.body))
      .then(() => {
        res.json(200, { message: "Successfully saved knowledge.", id: db._id });
      })
      .catch(error => {
        console.log(error);
        res.json(500, { error: error.reason });
      });
  });


/**
* @swagger
* /knowledge/:
*   post:
*     description: Creates a new Knowledge Management item in storage.
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
knowledgeRouter.post('/',
  validator.body(createKnowledgeSchema),
  (req, res) => {
    res.header("Access-Control-Allow-Origin", req.header.origins);
    var knowledge = db.insert(Object.assign(req.body))
      .then(() => {
        res.json(200, { message: "Successfully saved knowledge.", id: db._id });
      })
      .catch(error => {
        console.log(error);
        res.json(500, { error: error.reason });
      });
  });


/**
 * @swagger
 * /knowledge/:id:
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
knowledgeRouter.get('/:id',
  (req, res) => {
    db.get(req.params.id)
      .then(doc => {
        res.json(doc);
      })
      .catch(err => {
        console.log("Error :" + err)
        res.json(err.statusCode, { error: err.reason });
      });
  });


/**
 * @swagger
 * /knowledge:
 *   get:
 *     description: Returns all Knowledge Management items from the storage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
knowledgeRouter.get('/',
  (req, res) => {
    db.list({ include_docs: true })
      .then(doc => {
        res.json(doc);
      })
      .catch(err => {
        console.log("Error :" + err)
        res.json(err.statusCode, { error: err.reason });
      });
  });


/**
* @swagger
* /knowledge/:id:
*   put:
*     description: Updates a new Knowledge Management item in storage.
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
knowledgeRouter.put('/:id',
  validator.body(createKnowledgeSchema),
  (req, res) => {
    db.get(req.params.id)
      .then(doc => {
        db.insert(Object.assign(req.body, {
          _rev: doc._rev,
          _id: req.params.id
        }))
          .then(() => {
            res.json(200, { message: "Successfully updated knowledge." });
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
  });


module.exports = (database) => {
  db = database;
  return knowledgeRouter
};