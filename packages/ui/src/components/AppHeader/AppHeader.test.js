import React from "react";
import AppHeader from "./AppHeader";
import renderer from "react-test-renderer";

it("renders without crashing", () => {
  const tree = renderer.create(<AppHeader />).toJSON();
  expect(tree).toMatchSnapshot();
});
