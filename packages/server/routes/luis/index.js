const express = require('express');
const validator = require( 'restify-json-schema-validation-middleware' )();

// Setup Router
const luisRouter = express.Router();

// Import Fetch
const fetch = require("node-fetch");

const createIntentSchema = require('./schemas/createIntent.json');
const createEntityExtractorSchema = require('./schemas/createEntityExtractor.json');
const createClosedListEntitySchema = require('./schemas/createClosedListEntity.json');
const createUtteranceSchema = require('./schemas/createUtterance.json');

const luisAuthCredentials = {
    "endpoint":process.env.LUIS_ENDPOINT,
    "endpointV2":process.env.LUIS_ENDPOINT_V2,
    "appId": process.env.LUIS_APP_ID,
    "programmaticApiKey": process.env.LUIS_PROGRAMMATIC_API_KEY,
    "appVersion": process.env.LUIS_APP_VERSION
};

const publishData = {
   "versionId": "0.1",
   "isStaging": false
}

function sendRequest(requestOptions, endpoint) {
    console.log("url :"+endpoint+requestOptions.path)
    return fetch(endpoint + requestOptions.path, {
            body: requestOptions.body,
            method: requestOptions.method,
            headers: requestOptions.headers
        })
        .then(function(response) { 
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            }

            throw new Error("Failed HTTP request " + response.status + " " + response.statusText);
           
        });
}


/**
 * @swagger
 * /luis/intents:
 *   get:
 *     description: Returns all intents
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: not found
 */
luisRouter.get('/intents', (req,res) => {
    let options = Object.assign({
            method: "GET",
            path: luisAuthCredentials.appId + "/intents",
            headers: {
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


/**
* @swagger
* /luis/intents:
*   post:
*     description: Creates a new Intent in Luis.
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Internal error
*/
luisRouter.post('/intents', [validator.body(createIntentSchema),
    (req,res) => {
    let options = Object.assign({
          body: JSON.stringify(req.body),
          method: "POST",
          path: luisAuthCredentials.appId + "/intents",
          headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
          }
    }); 
        
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(500, {error: error.reason});
    });
}]);


/**
 * @swagger
 * /luis/entities:
 *   get:
 *     description: Returns all entities
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: not found
 */
luisRouter.get('/entities', (req,res) => {
    let options = Object.assign({
            method: "GET",
            path: luisAuthCredentials.appId + "/entities",
            headers: {
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


/**
* @swagger
* /luis/entityExtractor:
*   post:
*     description: Creates entity extractor in Luis.
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Internal error
*/
luisRouter.post('/entityExtractor', [validator.body(createEntityExtractorSchema),
    (req,res) => {
    let options = Object.assign({
          body: JSON.stringify(req.body),
          method: "POST",
          path: luisAuthCredentials.appId+/versions/+luisAuthCredentials.appVersion+"/entities",
          headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
          }
    }); 
        
    sendRequest(options,luisAuthCredentials.endpointV2)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(500, {error: error.reason});
    });
}]);


/**
* @swagger
* /luis/closedListEntity:
*   post:
*     description: Creates closed list entity in Luis.
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Internal error
*/
luisRouter.post('/closedListEntity', [validator.body(createClosedListEntitySchema),
    (req,res) => {
    let options = Object.assign({
          body: JSON.stringify(req.body),
          method: "POST",
          path: luisAuthCredentials.appId+/versions/+luisAuthCredentials.appVersion+"/closedlists",
          headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
          }
    }); 
        
    sendRequest(options,luisAuthCredentials.endpointV2)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(500, {error: error.reason});
    });
}]);


/**
* @swagger
* /luis/closedListEntity/:id:
*   put:
*     description: Updates closed list entity in Luis.
*     required:
*      - id
*     properties:
*       id:
*         type: string
*     responses:
*       200:
*         description: Successful update
*       500:
*         description: Internal error
*/
luisRouter.put('/closedListEntity/:id', [validator.body(createClosedListEntitySchema),
    (req,res) => {
    let options = Object.assign({
          body: JSON.stringify(req.body),
          method: "PUT",
          path: luisAuthCredentials.appId+/versions/+luisAuthCredentials.appVersion+"/closedlists/"+req.params.id,
          headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
          }
    }); 
        
    sendRequest(options,luisAuthCredentials.endpointV2)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(500, {error: error.reason});
    });
}]);


/**
* @swagger
* /luis/utterance:
*   post:
*     description: Creates utterance in Luis.
*     responses:
*       200:
*         description: Successful Creation
*       500:
*         description: Internal error
*/
luisRouter.post('/utterance', [validator.body(createUtteranceSchema),
    (req,res) => {
    let options = Object.assign({
          body: JSON.stringify(req.body),
          method: "POST",
          path: luisAuthCredentials.appId + "/example",
          headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
          }
    }); 
        
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        console.log(error);
        res.json(500, {error: error.reason});
    });
}]);


/**
 * @swagger
 * /luis/models:
 *   get:
 *     description: Returns all models
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: not found
 */
luisRouter.get('/models', (req,res) => {
    let options = Object.assign({
            method: "GET",
            path: luisAuthCredentials.appId + "/models",
            headers: {
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


/**
* @swagger
* /luis/train:
*   post:
*     description: trains Luis.
*/
luisRouter.post('/train', (req,res) => {
    let options = Object.assign({
            method: "POST",
            path: luisAuthCredentials.appId + "/train",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


/**
 * @swagger
 * /luis/train:
 *   get:
 *     description: Returns training state
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: not found
 */
luisRouter.get('/train', (req,res) => {
    let options = Object.assign({
            method: "GET",
            path: luisAuthCredentials.appId + "/train",
            headers: {
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpoint)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


/**
* @swagger
* /luis/publish:
*   post:
*     description: publish  Luis.
*/
luisRouter.post('/publish', (req,res) => {
    let options = Object.assign({
            body: JSON.stringify(publishData),
            method: "POST",
            path: luisAuthCredentials.appId + "/publish",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
            }
    });    
    
    sendRequest(options,luisAuthCredentials.endpointV2)
    .then(data => {
        res.json(data);
    }).catch(error => {
        res.json(error);
    });
});


module.exports = () => {
    return luisRouter
};