import React, { Component } from "react";
import { Chat } from "botframework-webchat";
import styled from "styled-components";

import ChatView from "../../components/ChatView";
import Message from "../../model/Message";

const AgentContainer = styled.main`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;

  & > div {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    & > * {
      flex: 1;
    }
    & > h1 {
      flex: 0;
    }
  }
`;

const HistoryContainer = styled.div`
  width: 400px;
  background: white;
  flex: 0;
  min-width: 400px;
  max-width: 400px;
  padding: 20px;
  box-sizing: border-box;
  & > h3 {
    flex: 0;
  }
`;

class AgentChatContainer extends Component {
  state = {
    history: []
  };

  componentWillReceiveProps(nextProps) {
    let id = nextProps.location.hash.replace("#/?id=", "");
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/conversationHistory/${id}`)
      .then(response => response.json())
      .then(result => {
        this.setState({
          history: result.conversationHistory.map(message => {
            if (message.text && message.user) {
              return new Message(message.user, message.text);
            } else {
              return null;
            }
          })
        });
      });
  }

  render() {
    return (
      <AgentContainer className="App">
        <div>
          <h1>Agent Livechat</h1>
          <Chat
            directLine={{ secret: process.env.REACT_APP_DIRECT_LINE_SECRET }}
            user={{ id: "agent_", name: "Dan Cotton" }}
          />
        </div>
        {this.state.history.length > 0 && (
          <HistoryContainer>
            <h3> User chat history </h3>
            <ChatView messages={this.state.history} />
          </HistoryContainer>
        )}
      </AgentContainer>
    );
  }
}

export default AgentChatContainer;
