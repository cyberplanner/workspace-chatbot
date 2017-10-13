/*
  Supercharger registration document
*/
const supercharger = require("./lib/supercharger");
const genericSuperchargers = require("./superchargers/genericSuperchargers");

// Register all Generic Superchargers.
supercharger.register(genericSuperchargers.optionalQuestion);
supercharger.register(genericSuperchargers.storeAnswer);
