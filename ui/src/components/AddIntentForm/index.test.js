import React from "react";
import AddIntentForm from "./index";
import renderer from "react-test-renderer";

it("renders without crashing", () => {
  const tree = renderer.create(<AddIntentForm />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders without crashing with params", () => {
  var state = {
    intentId: "test",
    response: "just for test"
  };

  const tree = renderer.create(<AddIntentForm {...state} />).toJSON();
  expect(tree).toMatchSnapshot();
});
