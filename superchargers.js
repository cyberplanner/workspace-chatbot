const genericSuperchargers = require('./superchargers/genericSuperchargers');

/*
  Supercharger registration document
*/
const init = () => {
  let supercharger = require('./custom_modules/module_supercharger');
  supercharger.clear()
    .then(() => {

      // Register Generic superchargers
      supercharger.register(
        new supercharger.Detail([
          new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"),
          new supercharger.Parameter("QUESTION", "The message to sent as the Question.", "string"),
        ],
        "Optional Question",
        genericSuperchargers.optionalQuestion,
        "generic__optional_question")
      );
      supercharger.register(
        new supercharger.Detail([
          new supercharger.Parameter("KEY", "The key to store the value under (may be used later)", "string"),
          new supercharger.Parameter("MESSAGE", "The message to be sent after storage.", "string"),
        ],
        "Store Answer",
        genericSuperchargers.storeAnswer,
        "generic__store_answer")
      );

      // EXAMPLE.
      supercharger.register(
        new supercharger.Detail([
          new supercharger.Parameter("TEST_PARAM", "A parameter used in testing", "string")
        ], "Test_Supercharger", (session, args, next, customArguments) => {
          session.send(customArguments.TEST_PARAM);
        }, "testFunction")
      );
    })
    .catch(error => {
      console.log(error)
    });

  return supercharger;
};

module.exports = init;