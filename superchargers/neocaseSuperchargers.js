const NeocaseAdapter = require('./custom_modules/module_neocaseAdapter');

const createCase = (session, args, next, customArguments) => {
    let question = customArguments.MESSAGE;
    // Call Neocase
    NeocaseAdapter.createNewCase({
        "contact": {
            "email": customArguments.email,
        },
        "question": question,
        "serviceOption": {
          //UK-EMPLOYMENT CHANGES
            "name": customArguments.SERVICE_OPTION_NAME
        },
        "queue": {
            "id": 2
        }
    }).then(response => {
        if (!response[0] || !response[0].error) {
            session.send("I've successfully created your case for you, here's your reference ID: #" + response.id + ".");
            session.send("Is there anything else I can help with today?")
        } else {
            session.send(response[0].error_details);
        }
    })
    .catch(error => {
        session.send("We had a problem trying to create your ticket. Please try again.");
    });
    session.send("Thank you, I will raise the following ticket with HR: \n" + `"${question}"`);
};

module.exports = {
  createCase: createCase
};