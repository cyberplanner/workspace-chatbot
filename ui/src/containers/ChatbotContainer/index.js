import React, { Component } from "react";
import { Chat } from "botframework-webchat";

class ChatbotContainer extends Component {
  render() {
    return (
      <div className="App">
        <Chat
          directLine={{ secret: process.env.REACT_APP_DIRECT_LINE_SECRET }}
          user={{ id: "user_id_test", name: "You" }}
        />
      </div>
    );
  }
}

export default ChatbotContainer;
