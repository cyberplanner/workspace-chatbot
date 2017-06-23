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
*   post:
*     description: Creates a new Conversation item in the storage.
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
	    	res.header("Access-Control-Allow-Origin", req.header.origins);
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