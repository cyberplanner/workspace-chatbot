export default class Message {
  _user;
  _text;

  constructor(user, text) {
    this._user = user;
    this._text = text;
  }

  get user() {
    return this._user;
  }

  get text() {
    return this._text;
  }
}
