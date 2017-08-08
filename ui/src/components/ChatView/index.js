import React from "react";
import styled from "styled-components";

const Chat = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  overflow-y: scroll;
`;

const Message = styled.p`
  background: ${props =>
    props.user.toLowerCase() === "bot" ? "#eceff1" : "#3a96dd"};
  color: ${props => (props.user.toLowerCase() === "bot" ? "#000" : "#fff")};
  align-self: ${props =>
    props.user.toLowerCase() === "bot" ? "flex-start" : "flex-end"};
  width: 80%;
  max-width: 300px;
  border-radius: 15px;
  padding: 10px 20px;
  box-sizing: border-box;
  text-align: left;
`;

export default class ChatView extends React.Component {
  render() {
    let { messages = [] } = this.props;
    return (
      <Chat>
        {messages.map((message, index) => {
          if (!message) {
            return <div />;
          }
          return (
            <Message key={index} user={message.user}>
              {message.text}
            </Message>
          );
        })}
      </Chat>
    );
  }
}
