const express = require("express");
const logger = require("../../logger.js");

const expressJSONSchema = require("express-jsonschema").validate;
const validator = {
  body: schema => {
    return expressJSONSchema({
      body: schema
    });
  }
};
// Setup Router
const luisRouter = express.Router();

// Import Fetch
const fetch = require("node-fetch");

const createIntentSchema = require("./schemas/createIntent.json");
const createEntityExtractorSchema = require("./schemas/createEntityExtractor.json");
const createClosedListEntitySchema = require("./schemas/createClosedListEntity.json");
const createUtteranceSchema = require("./schemas/createUtterance.json");

const luisAuthCredentials = {
  endpoint: process.env.LUIS_ENDPOINT,
  endpointV2: `${process.env.LUIS_ENDPOINT_V2}/${process.env
    .LUIS_APP_ID}/versions/${process.env.LUIS_APP_VERSION}`,
  appId: process.env.LUIS_APP_ID,
  programmaticApiKey: process.env.LUIS_PROGRAMMATIC_API_KEY,
  appVersion: process.env.LUIS_APP_VERSION
};

const publishData = {
  versionId: "0.1",
  isStaging: false
};

function sendRequest(requestOptions, endpoint) {
  logger.debug("url :" + endpoint + requestOptions.path);
  return fetch(endpoint + requestOptions.path, {
    body: requestOptions.body,
    method: requestOptions.method,
    headers: requestOptions.headers
  }).then(function(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    }

    throw new Error(
      "Failed HTTP request " + response.status + " " + response.statusText
    );
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
luisRouter.get("/intents", (req, res) => {
  let options = {
    method: "GET",
    path: "/intents",
    headers: {
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpointV2)
    .then(data => {
      res.json({
        Result: data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.readableType,
          typeId: item.typeId
        }))
      });
    })
    .catch(error => {
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
luisRouter.post("/intents", [
  validator.body(createIntentSchema),
  (req, res) => {
    let options = {
      body: JSON.stringify(req.body),
      method: "POST",
      path: "/intents",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
      }
    };

    sendRequest(options, luisAuthCredentials.endpointV2)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.json(500, { error: error.reason });
      });
  }
]);

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
luisRouter.get("/entities", (req, res) => {
  let options = {
    method: "GET",
    path: "/entities",
    headers: {
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpointV2)
    .then(data => {
      res.json({
        Result: data.map(item =>
          Object.assign(item, {
            type: item.readableType
          })
        )
      });
    })
    .catch(error => {
      res.json(error);
    });
});

/**
 * @swagger
 * /luis/closed-lists:
 *   get:
 *     description: Returns all closedlists
 *     responses:
 *       200:
 *         description: Successfully retrieved
 *       404:
 *          description: not found
 */
luisRouter.get("/closed-lists", (req, res) => {
  let options = {
    method: "GET",
    path: `/closedlists`,
    headers: {
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };
  sendRequest(options, luisAuthCredentials.endpointV2)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
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
luisRouter.post("/entityExtractor", [
  validator.body(createEntityExtractorSchema),
  (req, res) => {
    let options = {
      body: JSON.stringify(req.body),
      method: "POST",
      path: "/entities",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
      }
    };

    sendRequest(options, luisAuthCredentials.endpointV2)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.json(500, { error: error.reason });
      });
  }
]);

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
luisRouter.post("/closedListEntity", [
  validator.body(createClosedListEntitySchema),
  (req, res) => {
    let options = {
      body: JSON.stringify(req.body),
      method: "POST",
      path: "/closedlists",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
      }
    };

    sendRequest(options, luisAuthCredentials.endpointV2)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.json(500, { error: error.reason });
      });
  }
]);

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
luisRouter.put("/closedListEntity/:id", [
  validator.body(createClosedListEntitySchema),
  (req, res) => {
    let options = {
      body: JSON.stringify(req.body),
      method: "PUT",
      path: "/closedlists/" + req.params.id,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
      }
    };

    sendRequest(options, luisAuthCredentials.endpointV2)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.json(500, { error: error.reason });
      });
  }
]);

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
luisRouter.post("/utterance", [
  validator.body(createUtteranceSchema),
  (req, res) => {
    let options = {
      body: JSON.stringify(req.body),
      method: "POST",
      path: "/example",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
      }
    };

    sendRequest(options, luisAuthCredentials.endpointV2)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        console.log(error);
        res.json(500, { error: error.reason });
      });
  }
]);

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
luisRouter.get("/models", (req, res) => {
  let options = {
    method: "GET",
    path: luisAuthCredentials.appId + "/models",
    headers: {
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpoint)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

/**
* @swagger
* /luis/train:
*   post:
*     description: trains Luis.
*/
luisRouter.post("/train", (req, res) => {
  let options = {
    method: "POST",
    path: luisAuthCredentials.appId + "/train",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpoint)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
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
luisRouter.get("/train", (req, res) => {
  let options = {
    method: "GET",
    path: luisAuthCredentials.appId + "/train",
    headers: {
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpoint)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

/**
* @swagger
* /luis/publish:
*   post:
*     description: publish  Luis.
*/
luisRouter.post("/publish", (req, res) => {
  let options = {
    body: JSON.stringify(publishData),
    method: "POST",
    path: "/publish",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": luisAuthCredentials.programmaticApiKey
    }
  };

  sendRequest(options, luisAuthCredentials.endpointV2)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

module.exports = () => {
  return luisRouter;
};
