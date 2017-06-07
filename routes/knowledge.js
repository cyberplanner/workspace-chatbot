// Imports
const RestifyRouter = require('restify-routing');

// Setup Router
const knowledgeRouter = new RestifyRouter();

// Setup basic subroute
knowledgeRouter.get('/:username', function(req, res){
    res.send(200, 'Hello ' + req.params.username)
})

module.exports = knowledgeRouter;