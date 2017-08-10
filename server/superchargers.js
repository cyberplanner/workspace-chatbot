const genericSuperchargers = require('./superchargers/genericSuperchargers');

/*
  Supercharger registration document
*/
const init = () => {
  let supercharger = require('./lib/supercharger');
  supercharger.clear()
    .then(() => {

      /**
       * Register all Generic Superchargers.
       */
      supercharger.register(genericSuperchargers.optionalQuestion);
      supercharger.register(genericSuperchargers.storeAnswer);

    })
    .catch(error => {
      console.log(error)
    });

  return supercharger;
};

module.exports = init;