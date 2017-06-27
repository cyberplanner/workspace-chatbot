// Module Imports
const RestifyRouter = require('restify-routing');
const validator = require( 'restify-json-schema-validation-middleware' )();

let db;

// Setup Router
let superchargerRouter = new RestifyRouter();

//Import Schemas
const createSuperchargerSchema = require('./schemas/createSupercharger.json');

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
superchargerRouter.get('/', 
    (req,res) => {
    		db.list({include_docs:true})
	        .then(doc => {
	            res.json(doc);
	        })
	        .catch(err => {
	            console.log("Error :"+err)
	            res.json(err.statusCode, {error: err.reason});
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
superchargerRouter.get('/:id', 
    (req,res) => {
        db.get(req.params.id)
        .then(doc => {
            res.json(doc);
        })
        .catch(err => {
            console.log("Error :"+err)
            res.json(err.statusCode, {error: err.reason});
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
*       404:
*        description: doc not found
*/
superchargerRouter.post('/', 
	    validator.body(createSuperchargerSchema),
	    (req, res) => {
	    	db.insert(Object.assign(req.body))
	        .then(() => {
	            res.json(200, {message: "Successfully saved supercharger."});
	        })
	        .catch(error => {
	            console.log(error);  
	            res.json(500, {error: error.reason});
	        });
	    });

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
 superchargerRouter.put('/:id', 
 validator.body(createSuperchargerSchema),
    (req, res) => {
    	db.get(req.params.id)
        .then(doc => {
              db.insert(Object.assign(req.body, {
  		            _rev: doc._rev,
                    _id:  req.params.id
  		      }))
  		      .then(() => {
  		           res.json(200, {message: "Successfully updated supercharger."});
  		      })
  		      .catch(error => {
  		            console.error(error);  
  		            res.json(500, {error: error.reason});
  		      });
        })
        .catch(err => {
            console.log("Error :"+err)
            res.json(err.statusCode, {error: err.reason});
        });		      
    });


module.exports = (database) => {
    db = database;
    return superchargerRouter
};

