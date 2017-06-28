module.exports = class User {
  constructor(address, name) {
    this._address = address;
    this._name = name;
  }
  get address() {
    return this._address;
  }
  get name() {
    return this._name;
  }
}