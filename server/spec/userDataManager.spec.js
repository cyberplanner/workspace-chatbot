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
});
