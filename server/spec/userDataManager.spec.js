var userDataManager = require("../lib/userDataManager");

describe("User data manager functions", function() {
  it("add entities to user data", function() {
    let userData = {};
    userDataManager.addEntitiesToUserData(userData, [
      {
        entity: "ball",
        type: "SPORTS"
      }
    ]);
    expect(userData.SPORTS).toEqual("ball");
  });
  it("adds nothing if entities are empty", function() {
    let userData = {};
    userDataManager.addEntitiesToUserData(userData, []);
    expect(userData).toEqual({});
  });
  it("adds nothing if entities are undefined", function() {
    let userData = {};
    userDataManager.addEntitiesToUserData(userData);
    //no assertion, checking it doesn't throw error
  });
});
