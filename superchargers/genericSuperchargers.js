const optionalQuestion = (session, args, next, customArguments, skip) => {
  if (session.userData.summary[customArguments.KEY]) {
    console.log("[OPTIONAL-Q] DATA EXISTING: " + session.userData.summary[customArguments.KEY]);
    session.conversationData.skip = customArguments.KEY;
    skip(session, args, next);
  } else {
    console.log("[OPTIONAL-Q] DATA DOESN'T EXIST");
    session.send(customArguments.QUESTION);
  }
};

const storeAnswer = (session, args, next, customArguments, skip) => {
  if (session.userData.summary[customArguments.KEY] && session.conversationData.skip === customArguments.KEY) {
    session.conversationData.skip = null;
  } else {
    session.userData.summary[customArguments.KEY] = session.message.text;
  }
  session.send(session.userData.summary[customArguments.KEY]);
  session.send(customArguments.MESSAGE);
  skip(session, args, next);
};

module.exports = {
  storeAnswer: storeAnswer,
  optionalQuestion: optionalQuestion
};