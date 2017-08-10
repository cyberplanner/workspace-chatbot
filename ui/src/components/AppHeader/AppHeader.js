import React, { Component } from "react";
import styled from "styled-components";

import yak from "./Yak_White.svg";

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
    height: 80%;
    width: auto;
    margin-right: 1em;
  }
`;

class AppHeader extends Component {
  render() {
    return (
      <Header>
        <img src={yak} />
        <h3>Yak</h3>
      </Header>
    );
  }
}

export default AppHeader;
