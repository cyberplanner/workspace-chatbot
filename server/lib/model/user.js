module.exports = class User {
  constructor(id, address, name, conversationId) {
    this._id = id;
    this._address = address;
    this._name = name;
    this._conversationId = conversationId;
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
  get conversationId() {
    return this._conversationId;
  }
};
