const uuidv1 = require('uuid/v1');
const fetch = require("node-fetch");

const PORT = process.env.PORT || "3978";

let botBuilder;

let superchargers = {

};

const VALID_TYPES = ["string", 
                    "array",
                    "boolean",
                    "integer",
                    "null",
                    "number",
                    "object"];

class Detail {
  /**
   * Allows you to create a new supercharger
   * 
   * @param {*} args an array of supercharger parameters
   * @param {*} displayName 
   * @param {*} fn The supercharger function (We'll pass these params: session, args, next, customArguments)
   */
  constructor(args, displayName, fn) {
    this.arguments = args;
    this.displayName = displayName;
    this.function = fn;
    this._id = uuidv1();
  }
  addToDB() {
    let req = {
      "arguments": this.arguments,
      "displayName": this.displayName,
      "functionName": this._id,
      "_id": this._id
    };

    return fetch(`http://localhost:${PORT}/supercharger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    })
    .then(result => result.json());
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

}

class Parameter {
  constructor(name, description, dataType) {
    if (VALID_TYPES.indexOf(dataType) < 0) {
      throw new Error("Datatype not supported");
    }

    this.name = name;
    this.description = description;
    this.dataType = dataType;
  }
}

const execute = (session, args, next, conversationDoc) => {
  console.log(conversationDoc);
  let customArguments = Object.keys(conversationDoc.supercharger.arguments)
    .map(key => {
      let value = conversationDoc.supercharger.arguments[key];
      if (value.indexOf("$") == 0) {
        // It's an entity - check the userData.
        if (session.userData && session.userData.summary && session.userData.summary[value.substring(1)]) {
          return {
            key: key,
            value: session.userData.summary[value.substring(1)]
          };
        } else {
          //If not in userdata - lookup to see if it was in an entity passed now.
          return {
            key: key,
            value: botBuilder.EntityRecognizer.findEntity(args.intent.entities, value.substring(1))
          }
        }
      } else {
        // It's a hardcoded parameter...
        return {
          key: key,
          value: value
        }
      }
    })
    .reduce((result, argument) => {
      result[argument.key] = argument.value;
      return result;
    }, {});
  let supercharger = superchargers[conversationDoc.supercharger.id];
  console.log("[SUPERCHARGER] Retrieving supercharger with ID: " + conversationDoc.supercharger.id);
  if (typeof supercharger === "function") {
    console.log("[SUPERCHARGER] Executing.");
    supercharger(session, args, next, customArguments);
  } else {
    console.log("[SUPERCHARGER] Failed to execute. No function available.");
  }
  
};

const clear = () => {
  return fetch(`http://localhost:${PORT}/supercharger/all`, {
    method: "DELETE"
  });
}

module.exports = {
  init: builder => botBuilder = builder,
  register: detail => {
    console.log("Registering...");
    detail.addToDB();
    superchargers[detail.id] = detail.function;
  },
  clear: clear,
  execute: execute,
  Detail: Detail,
  Parameter: Parameter
};