export default class ConversationNode {
  _nodeId;
  _messageId;
  _fallbackMessages;
  _children;
  _parentId;

  constructor(nodeId, messageId, fallbackMessages, children, supercharger) {
    this._nodeId = nodeId;
    this._messageId = messageId;
    this._fallbackMessages = fallbackMessages.map(message => message + "");
    this._children = children.map(child => ({
      intentId: child.intentId,
      nodeId: child.nodeId,
      conditions: child.conditions
    }));
    this._supercharger = supercharger;
  }
  set parentId(parentId) {
    this._parentId = parentId;
  }
  get parentId() {
    return this._parentId;
  }
  get id() {
    return this._nodeId;
  }
  get message() {
    return this._messageId;
  }
  get fallback() {
    return this._fallbackMessages;
  }
  get children() {
    return this._children;
  }
  get supercharger() {
    return this._supercharger;
  }
}
