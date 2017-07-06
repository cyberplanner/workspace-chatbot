/*
  Supercharger registration document
*/
const init = () => {
  let supercharger = require('./custom_modules/module_supercharger');

  supercharger.register(
    new supercharger.Detail([
      new supercharger.Parameter("TEST_PARAM", "A parameter used in testing", "string")
    ], "Test_Supercharger", (session, args, next, customArguments) => {
      console.log(customArguments.TEST_PARAM);
    })
  );

  return supercharger;
};

module.exports = init;