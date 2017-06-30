module.exports = class User {
  constructor(id, address, name) {
    this._id = id;
    this._address = address;
    this._name = name;
  }
  get id() {
    return this._id;
  }
  get address() {
    return this._address;
  }
  get name() {
    return this._name;
  }
}