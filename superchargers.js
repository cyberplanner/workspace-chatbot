/*
  Supercharger registration document
*/
const init = () => {
  let supercharger = require('./custom_modules/module_supercharger');
  supercharger.clear()
    .then(() => {

      // Register your supercharger
      supercharger.register(
        new supercharger.Detail([
          new supercharger.Parameter("TEST_PARAM", "A parameter used in testing", "string")
        ], "Test_Supercharger", (session, args, next, customArguments) => {
          session.send(customArguments.TEST_PARAM);
        })
      );

    })
    .catch(error => {
      console.log(error)
    });

  return supercharger;
};

module.exports = init;