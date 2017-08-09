const express = require('express');

const expressJSONSchema = require('express-jsonschema').validate;
const validator = {
	body: (schema) => {
		return expressJSONSchema({
			body: schema
		});
	}
}
let db;

// Setup Router
const conversationRouter = express.Router();

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
	            console.log("Error :"+JSON.stringify(err))
	            res.status(err.statusCode).json({error: err.reason});
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
            console.log("Error :"+JSON.stringify(err))
            res.status(err.statusCode).json({error: err.reason});
        });
    });

/**
* @swagger
* /conversation/:
*   post:
*     description: Creates a new conversation item in storage.
*     produces:
*       - application/json
*     parameters:
*       - name: post-schema
*         description: The JSON body of the request
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/createConversation'     
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Creation failed. Item may already exist in DB.
*       404:
*        description: doc not found
*/
conversationRouter.post('/', [
		validator.body( createConversationSchema ),
		(req, res) => {
			db.insert(req.body)
			.then((doc) => {
				res.json(200, {message: "Successfully saved conversation.", id: doc.id});
			})
			.catch(error => {
				console.log(error);  
				res.json(500, {error: error.reason});
			});
		}]);

/**
* @swagger
* /conversation/:nodeId:
*   put:
*     description: Updates the conversation item in the storage.
*     parameters:
*       - name: nodeId
*         description: The nodeId for the particular conversation item you wish to update
*         in: path
*         type: string
*         required: true
*       - name: put-schema
*         description: The JSON body of the request
*         in: body
*         required: true
*         schema:
*           $ref: '#/schemas/createConversation'
*     responses:
*       200:
*         description: Successful Update
*       500:
*         description: Update failed. Item may not exist in DB.
*/
 conversationRouter.put('/:nodeId', [
	validator.body( createConversationSchema ),
    (req, res) => {
    	db.get(req.params.nodeId)
        .then(doc => {
              db.insert(Object.assign(req.body, {
  		            _rev: doc._rev,
                    _id:  req.params.nodeId
  		      }))
  		      .then(() => {
  		           res.json(200, {message: "Successfully updated conversation."});
  		      })
  		      .catch(error => {
  		            console.error(error);  
  		            res.json(500, {error: error.reason});
  		      });
        })
        .catch(err => {
            console.log("Error :"+JSON.stringify(err))
            res.status(err.statusCode).json({error: err.reason});
        });		      
    }]);

/**
 * @swagger
 * /conversation/:id:
 *   delete:
 *     description: Deletes conversation node with the given ID
 *     produces:
 *       - application/json
 *     properties:
 *       id:
 *         type: string
 *     required:
*      - id
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       404:
 *          description: doc not found
 */
conversationRouter.delete('/:id', 
    (req,res) => {
        db.get(req.params.id)
        .then(doc => {
			return db.destroy(doc._id, doc._rev);
		})
		.then(complete => {
			res.json({
				deleted: true
			});
		})
        .catch(err => {
            console.log("Error :"+JSON.stringify(err))
            res.status(err.statusCode).json({error: err.reason});
        });
    });

module.exports = (database) => {
    db = database;
    return conversationRouter;
};