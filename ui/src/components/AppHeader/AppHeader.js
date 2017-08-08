import React, { Component } from "react";
import styled from "styled-components";

import octo from "./Octopus-128.png";

const Header = styled.header`
  background-color: #455963;
  height: 60px;
  color: #ebebec;
  border-bottom: 2px solid rgba(100, 100, 100, 0.5);
  text-align: center;
  display: flex;
  align-items: center;
  padding: 0em 2em;
  & > img {
    height: 100%;
    width: auto;
  }
`;

class AppHeader extends Component {
  render() {
    return (
      <Header>
        <img src={octo} />
        <h3>Ubiqutious Octo Pancake</h3>
      </Header>
    );
  }
}

export default AppHeader;
