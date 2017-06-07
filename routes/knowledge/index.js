// Module Imports
const RestifyRouter = require('restify-routing');
const validator = require('restify-ajv-middleware');

// Setup Router
let knowledgeRouter = new RestifyRouter();

/*
    Import Schemas
*/
const createKnowledgeSchema = require('./schemas/createKnowledge.json');

// Setup basic subroute
knowledgeRouter.post('/:username', (req, res) => {
    res.send(200, 'Hello ' + req.params.username);
});

module.exports = knowledgeRouter;