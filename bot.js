
let db;
let defaultResponse = [];

let bot = [(session, args, next) => {
  console.log(args);
  if (args.intent && args.intent != null) {
      db.get(args.intent)
          .then(result => {
              console.log("Successfully responding: ");
              session.send(result.responses[0]);
          })
          .catch(error => {
              session.send(defaultResponse.responses[0]);
          });
  } else {
      session.send(defaultResponse.responses[0]);
  }
}];

module.exports = (database) => {
  db = database;
  db.get("default")
          .then(result => {
              defaultResponse = result;
          })
          .catch(error => {
              defaultResponse = {
                responses: "I\'m not sure how to reply to that. Please ask me again or in a different way?"
              };
          });
  return bot;
}
