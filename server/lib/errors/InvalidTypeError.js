class InvalidTypeError extends Error {
  /**
   * Constructs InvalidTypeError
   * @param {String} name The name of the object that is of invalid type
   * @param {String} expectedType The expected type of the object
   */
  constructor(name, expectedType) {
    super(
      `${name} passed is of an invalid type. Expected instance of: ${expectedType}`
    );
  }
}

module.exports = InvalidTypeError;
