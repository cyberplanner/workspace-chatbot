// Module Imports
const RestifyRouter = require('restify-routing');
const validator = require( 'restify-json-schema-validation-middleware' )();

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
*/
knowledgeRouter.post('/:id', 
    validator.body( createKnowledgeSchema ),
    (req, res) => {
        db.insert(Object.assign(req.body, {
            _id: req.params.id
        }))
        .then(() => {
            res.json(200, {message: "Successfully saved knowledge."});
        })
        .catch(error => {
            console.error(error);  
            res.json(500, {error: error.reason});
        });
    });

module.exports = (database) => {
    db = database;
    return knowledgeRouter
};