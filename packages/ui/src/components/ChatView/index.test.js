import React from "react";
import ChatView from "./index";
import Message from "../../model/Message";
import renderer from "react-test-renderer";

it("renders without crashing", () => {
  const tree = renderer.create(<ChatView />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders without crashing with an empty array of messages", () => {
  let messages = [];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly and without crashing with a single message from the bot", () => {
  let messages = [new Message("Hi there", "bot")];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly and without crashing with a single message from the bot", () => {
  let messages = [new Message("Hi there", "user")];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly and without crashing with a multiple messages from the bot", () => {
  let messages = [
    new Message("Hi there", "bot"),
    new Message("How's it going", "bot")
  ];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly and without crashing with a multiple messages from the user", () => {
  let messages = [
    new Message("Hi there", "user"),
    new Message("How's it going", "user")
  ];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correctly and without crashing with mixed messages", () => {
  let messages = [
    new Message("Hi there", "user"),
    new Message("How's it going", "bot")
  ];

  const tree = renderer.create(<ChatView messages={messages} />).toJSON();
  expect(tree).toMatchSnapshot();
});
