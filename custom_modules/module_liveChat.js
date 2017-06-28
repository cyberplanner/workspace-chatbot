const User = require('./model/user');
const STATES = {BOT: "BOT", WAITING: "WAITING", LIVE: "LIVE"};
let BOT;
let BUILDER;
let queue = [];
let agents = {};

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
  if (!session.conversationData.agentData) {
    connectAgent(session, next, message, conversation);
  } else {
    if (session.message.text.startsWith("/exit")) {
      if (agents[session.conversationData.agentData.user._id]) {
        session.send("The user must exit the chat before you.");
        return;
      } else {
        session.conversationData.agentData = null;
        session.send("You've exited the chat. To connect to another, simply send a message.");
      }
    } else {
      routeMessage(session.message.text, session.conversationData.agentData.user._address);
      return;
    }
  }
}

const handleUser = (session, next, message, conversation) => {
  if (agents[session.message.user.id]) {
    if (session.message.text.startsWith("/exit")) {
      routeMessage("The user has left the chat. Please use /exit to become available again.", agents[session.message.user.id]._address);
      delete agents[session.message.user.id];
      session.conversationData.inQueue = false;
      session.send("You've exited the livechat.");
      return;
    } else {
      routeMessage(session.message.text, agents[session.message.user.id]._address);
    }
  } else if (!session.conversationData.inQueue) {
    next();
  }
}

const connectAgent = (session, next, message, conversation) => {
  if (queue.length > 0) {
    let user = queue.shift();
    session.send("You are connected to: " + user.name);
    session.conversationData.agentData = {
      user: user
    }
    agents[user.id] = new User(session.message.user.id, session.message.address, session.message.user.name);
    return;
  } else {
    session.send("No users in the queue, please message to retry.");
    return;
  }
}

const handoverUser = (session, args, next) => {
  queue.push(new User(session.message.user.id, session.message.address, session.message.user.name));
  session.send("You're in the queue, an agent will be with you shortly.");
  session.conversationData.inQueue = true;
}

const routeMessage = (message, address) => {
  BOT.send(new BUILDER.Message().address(address).text(message));
}

module.exports = {
  middleware: (bot, builder) => {
    BOT = bot;
    BUILDER = builder;
    return liveChat;
  },
  handoverUser: handoverUser
};