// Module Imports
const RestifyRouter = require('restify-routing');
const validator = require( 'restify-json-schema-validation-middleware' )();

let db;

// Setup Router
let superchargedRouter = new RestifyRouter();

//Import Schemas
const createSuperchargedSchema = require('./schemas/createSupercharged.json');

/**
* @swagger
* /supercharged/:
*   post:
*     description: Creates a new supercharged item in storage.
*     produces:
*       - application/json
*     parameters:
*       - name: post-schema
*         description: The JSON body of the request
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/createSupercharged'     
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*       404:
*        description: doc not found
*/
superchargedRouter.post('/', 
	    validator.body(createSuperchargedSchema),
	    (req, res) => {
	    	db.insert(Object.assign(req.body))
	        .then(() => {
	            res.json(200, {message: "Successfully saved supercharged conversation node."});
	        })
	        .catch(error => {
	            console.log(error);  
	            res.json(500, {error: error.reason});
	        });
	    });

module.exports = (database) => {
    db = database;
    return superchargedRouter
};