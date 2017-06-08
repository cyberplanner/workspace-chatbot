// Imports
const RestifyRouter = require('restify-routing');

// Setup Router
const knowledgeRouter = new RestifyRouter();

// Setup basic subroute
/**
* @swagger
* /:
*   get:
*     description: Returns hello message
*     required:
*      - username
*     properties:
*       username:
*         type: string  
*     responses:
*       200:
*         description: hello username
*/
knowledgeRouter.get('/:username', function(req, res){
    res.send(200, 'Hello ' + req.params.username)
})

module.exports = knowledgeRouter;