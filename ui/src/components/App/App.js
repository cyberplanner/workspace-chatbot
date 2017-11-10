import React, { Component } from "react";
import styled from "styled-components";
import "botframework-webchat/botchat.css";
import "./App.css";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ChatbotContainer from "../../containers/ChatbotContainer";
import ConversationContainer from "../../containers/ConversationContainer";
import AddIntentContainer from "../../containers/AddIntentContainer";
import AgentChatContainer from "../../containers/AgentChatContainer";
import AppHeader from "../../components/AppHeader/AppHeader";
import NotFound from "../NotFound";

const THEME = {
  mainColor: "#000000"
};

const RouteContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={THEME}>
        <Router>
          <RouteContainer>
            <AppHeader />
            <Switch>
              <Route exact path="/" component={ChatbotContainer} />
              <Route exact path="/admin" component={ConversationContainer} />
              <Route exact path="/admin/agent" component={AgentChatContainer} />
              <Route exact path="/addIntent" component={AddIntentContainer} />
              <Route
                path="/addIntent/:intentId/:response"
                component={AddIntentContainer}
              />
              <Route default component={NotFound} />
            </Switch>
          </RouteContainer>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
