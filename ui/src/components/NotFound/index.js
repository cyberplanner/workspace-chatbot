import React from "react";
import styled from "styled-components";

import ErrorSection from "../ErrorSection";
import Logo from "../Logo";
import HorizontalLine from "../HorizontalLine";

const ErrorContainer = styled(ErrorSection)`
  max-width: 500px;
  padding: 20px;
  margin: 0 auto;

  & #suggestions {
    text-align: left;
  }

  & h4 {
    font-weight: 200;
  }

  & ul {
    padding-left: 1em;
    list-style-type: none;

    & li {
      margin: 0.25em 0;

      &::before {
        content: "-";
        margin-right: 1em;
      }

      & > a {
        color: rgba(0, 0, 0, 0.8);
        &:visited {
          color: rgba(0, 0, 0, 0.8);
        }
        &:hover {
          color: rgba(50, 50, 50, 0.8);
        }
      }
    }
  }
`;

export default () => {
  return (
    <ErrorContainer id="error">
      <Logo />
      <h2>Page not found.</h2>
      <p>Unfortunately the page you're looking for can no longer be found.</p>
      <HorizontalLine />
      <section id="suggestions">
        <h4>Incase your page has moved, here's a few suggestions:</h4>
        <ul>
          <li>
            <a href="/">WebChat Window</a>
          </li>
          <li>
            <a href="/admin">Admin Panel (Conversation Manager)</a>
          </li>
        </ul>
      </section>
    </ErrorContainer>
  );
};
