const User = require('./model/user');
const STATES = {BOT: "BOT", WAITING: "WAITING", LIVE: "LIVE"};
let BOT;
let BUILDER;
let queue = [];

const liveChat = (session, next) => {
  // Are we an agent?
  const isAgent = session.message.user.id.startsWith("agent_");
  session.userData.isAgent = isAgent;

  const message = session.message;
  const conversation = message.address.conversation.id;

  if (isAgent) {
    handleAgent(session, next, message, conversation);
  } else {
    handleUser(session, next, message, conversation);
  }

}

const handleAgent = (session, next, message, conversation) => {
  if (!session.userData.connected) {
    connectAgent(session, next, message, conversation);
    //routeMessage();
  } else {
    //routeMessage();
    next();
  }
}

const handleUser = (session, next, message, conversation) => {
  next();
}

const connectAgent = (session, next, message, conversation) => {
  if (queue.length > 0) {
    let user = queue.shift();
    session.send("You are connected to: " + user.name);
    return;
  } else {
    session.send("No users in the queue, please message to retry.");
    return;
  }
}

const handoverUser = (session, args, next) => {
  queue.push(new User(session.message.address, session.message.user.name));
  session.send("You're in the queue, an agent will be with you shortly.");
}

module.exports = {
  middleware: (bot, builder) => {
    BOT = bot;
    BUILDER = builder;
    return liveChat;
  },
  handoverUser: handoverUser
};