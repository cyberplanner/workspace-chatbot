var liveChat = require("../custom_modules/module_liveChat");
const User = require('../custom_modules/model/user');
let validateSend = () => {};

let callSend;
let expectedSendText;
let expectedAddress;

let middleware = liveChat.middleware({ send: () => {}}, {
    Message: class Message {
        address(add) {
            expect(add).toEqual(expectedAddress);
            return {
                text: (message) => expect(message).toEqual(expectedSendText)
            }
        }
    }
});
describe("Test liveChat", () => {
    // Create new user
    let user = (sendAssert) => ({
        session: {
            send: sendAssert,
            message: {
                user: {
                    id: "123-a",
                    name: "Dan Cotton"
                },
                address: {
                    userId: "1234-b",
                    conversation: {
                        id: "test"
                    }
                },
                text: "Hi"
            },
            conversationData: {
                
            },
            userData: {
                
            }
        },
        args: {

        },
        next: () => {

        }
    });

    // Create new agent
    let agent = (sendAssert, message) => ({
        session: {
            send: sendAssert,
            message: {
                user: {
                    id: "agent_123-a",
                    name: "Test Agent"
                },
                address: {
                    userId: "123a-b",
                    conversation: {
                        id: "test"
                    }
                },
                text: message || "HI"
            },
            conversationData: {
                
            },
            userData: {

            }
        },
        args: {

        },
        next: () => {

        }
    });
    let handoverUser;
    let agentEmptyQueue;

	it("Agent recieved a response mentioning no users are in the queue ", () => {
        let sendAssertion = message => {
            expect(message).toEqual("No users in the queue, please message to retry.");
        };

        let agentEmptyQueue = agent(sendAssertion);
		middleware(agentEmptyQueue.session, agentEmptyQueue.args, agentEmptyQueue.next);
    });

	it("Responds to the user when they join the queue", () => {

        let sendAssertion = message => {
            expect(message).toEqual("You're in the queue, an agent will be with you shortly.");
        };

        handoverUser = user(sendAssertion);
		liveChat.handoverUser(handoverUser.session, handoverUser.args, handoverUser.next);
    });
	it("With a user in the queue - an agent is able to connect", () => {
        let sendAssertion = message => {
            expect(message).toEqual("You are connected to: Dan Cotton");
        };

        agentEmptyQueue = agent(sendAssertion);
		middleware(agentEmptyQueue.session, agentEmptyQueue.args, agentEmptyQueue.next);
        expect(agentEmptyQueue.session.conversationData.agentData).toEqual({
            user: new User(handoverUser.session.message.user.id, handoverUser.session.message.address, handoverUser.session.message.user.name)
        });
    });

	it("An agent is unable to exit if the user is still in the chat.", () => {
        let sendAssertion = message => {
            expect(message).toEqual("The user must exit the chat before you.");
        };
        agentEmptyQueue.session.send = sendAssertion;
        agentEmptyQueue.session.message.text = "/exit";
        
		middleware(agentEmptyQueue.session, agentEmptyQueue.args, agentEmptyQueue.next);
        expect(agentEmptyQueue.session.conversationData.agentData).toEqual({
            user: new User(handoverUser.session.message.user.id, handoverUser.session.message.address, handoverUser.session.message.user.name)
        });
    });

	it("The user is able to leave livechat.", () => {
        let sendAssertion = message => {
            expect(message).toEqual("You've exited the livechat.");
        };
        handoverUser.session.send = sendAssertion;
        handoverUser.session.message.text = "/exit";

        expectedAddress = agentEmptyQueue.session.message.address;
        expectedSendText = "The user has left the chat. Please use /exit to become available again.";
        
		middleware(handoverUser.session, handoverUser.args, handoverUser.next);
        expect(agentEmptyQueue.session.conversationData.agentData).toEqual({
            user: new User(handoverUser.session.message.user.id, handoverUser.session.message.address, handoverUser.session.message.user.name)
        });
    });

	it("The agent is able to leave livechat.", () => {
        let sendAssertion = message => {
            expect(message).toEqual("You've exited the chat. To connect to another, simply send a message.");
        };
        agentEmptyQueue.session.send = sendAssertion;
        agentEmptyQueue.session.message.text = "/exit";
        
		middleware(agentEmptyQueue.session, agentEmptyQueue.args, agentEmptyQueue.next);
        expect(agentEmptyQueue.session.conversationData.agentData).toEqual(null);
    });
});