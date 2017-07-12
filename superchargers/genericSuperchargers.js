const storeAnswer = (session, args, next, customArguments) => {
    let result = session.message.text;
    session.userData.summary[customArguments.KEY] = result;
    session.send(session.userData.summary[customArguments.KEY]);
    session.send(customArguments.MESSAGE);
};

module.exports = {
  storeAnswer: storeAnswer
};