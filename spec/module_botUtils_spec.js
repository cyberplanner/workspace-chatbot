var utils = require("../custom_modules/module_botUtils.js");


describe("processResponse should replace {}", () => {
    
	it("Should replace at start of string", () => {
        let testString = "{forename} - welcome...";
        let sesh =  {
            userData: {
                summary: {
                    forename: "Dan"
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Dan - welcome...");
    });

	it("Should fallback if no data at start of string", () => {
        let testString = "{forename} - welcome...";
        let sesh =  {
            userData: {
                summary: {
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("- welcome...");
    });

	it("Should replace mid string", () => {
        let testString = "Hi {forename} - welcome...";
        let sesh =  {
            userData: {
                summary: {
                    forename: "Dan"
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi Dan - welcome...");
    });

	it("Should fallback if not available mid string", () => {
        let testString = "Hi {forename} - welcome...";
        let sesh =  {
            userData: {
                summary: {
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome...");
    });

	it("Should replace at end of string", () => {
        let testString = "Hi - welcome {forename}";
        let sesh =  {
            userData: {
                summary: {
                    forename: "Dan"
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome Dan");
    });

	it("Should fallback if not available at end of string", () => {
        let testString = "Hi - welcome {forename}";
        let sesh =  {
            userData: {
                summary: {
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome");
    });

	it("Should handle multiple in string", () => {
        let testString = "Hi - welcome {forename} - your surname is {surname}";
        let sesh =  {
            userData: {
                summary: {
                    forename: "Dan",
                    surname: "Cotton"
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome Dan - your surname is Cotton");
    });

	it("Should fallback if multiple in string and all unavailable", () => {
        let testString = "Hi - welcome {forename} - your surname is {surname}";
        let sesh =  {
            userData: {
                summary: {
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome - your surname is");
    });

	it("Should fallback if multiple in string and some are available", () => {
        let testString = "Hi - welcome {forename} - your surname is {surname}";
        let sesh =  {
            userData: {
                summary: {
                    surname: "Cotton"
                }
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome - your surname is Cotton");
    });
});