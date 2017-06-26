const RestifyRouter = require('restify-routing');
const validator = require( 'restify-json-schema-validation-middleware' )();

let db;

// Setup Router
let conversationRouter = new RestifyRouter();

//Import Schemas

const createConversationSchema = require('./schemas/createConversation.json');

/**
 * @swagger
 * /conversation:
 *   get:
 *     description: Returns all conversation from the storage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: doc not found
 */
conversationRouter.get('/', 
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
 * /conversation/:id:
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
conversationRouter.get('/:id', 
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
* /conversation/:
*   post:
*     description: Creates a new Conversation item in storage.
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*       404:
*        description: doc not found
*/
conversationRouter.post('/', 
	    validator.body( createConversationSchema ),
	    (req, res) => {
	    	db.insert(Object.assign(req.body))
	        .then(() => {
	            res.json(200, {message: "Successfully saved conversation."});
	        })
	        .catch(error => {
	            console.log(error);  
	            res.json(500, {error: error.reason});
	        });
	    });

module.exports = (database) => {
    db = database;
    return conversationRouter
};