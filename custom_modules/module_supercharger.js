const uuidv1 = require('uuid/v1');

let superchargers = {

};


module.exports = {
  register: detail => {

  }, 
  Detail: class Detail {

    _arguments;
    _displayName;
    _function;
    _id;

    constructor(arguments, displayName, fn) {
      this._arguments = arguments.map(arg => arg + "");
      this._displayName = displayName;
      this._function = fn;
      this._id = uuidv1();
    }

  }
};