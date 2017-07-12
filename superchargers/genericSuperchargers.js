const NeocaseAdapter = require('./custom_modules/module_neocaseAdapter');

const storeAnswer = (session, args, next, customArguments) => {
    let result = session.message.text;
    session.userData.summary[customArguments.KEY] = result;
    session.send(customArguments.MESSAGE);
};

module.exports = {
  storeAnswer: storeAnswer
};