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

	it("Should fallback if summary unavailable", () => {
        let testString = "Hi - welcome {forename} - your surname is {surname}";
        let sesh =  {
            userData: {
            }
        }
        expect(utils.processResponse(sesh, testString)).toEqual("Hi - welcome - your surname is");
    });
});


describe("checkConditions", () => {
    
	it("should return true if empty conditions present in node", () => {
        let node = {
            conditions: []
        };
        let session = {};
        let args = {};
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });
    
	it("should return true if no conditions present in node", () => {
        let node = {};
        let session = {};
        let args = {};
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });
    
	it("should return true if valid equality condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "EQUALS",
                    value: "Company Car"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Company Car"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });

	it("should return true if valid contains condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "CONTAINS",
                    value: "Company"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Company Car"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });

	it("should return true if valid regex condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "REGEX_MATCH",
                    value: "^([A-Z])\\w+$"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Welcome"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });
    
	it("should return false if invalid equality condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "EQUALS",
                    value: "Payroll"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Company Car"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(false);
    });

	it("should return false if invalid contains condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "CONTAINS",
                    value: "Payroll"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Company Car"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(false);
    });

	it("should return false if invalid regex condition present in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "REGEX_MATCH",
                    value: "^([A-Z])$"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "Welcome"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(false);
    });

	it("should return false if valid regex condition present however 'not' is defined in node", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: true,
                    comparator: "REGEX_MATCH",
                    value: "^([A-Z])$"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "A"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(false);
    });



	it("should return true if multiple valid conditions", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "REGEX_MATCH",
                    value: "^([A-Z])$"
                },
                {
                    entityId: "test2",
                    not: false,
                    comparator: "CONTAINS",
                    value: "ABcD"
                },
                {
                    entityId: "test3",
                    not: false,
                    comparator: "EQUALS",
                    value: "TEST-3"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "A"
                        ]
                    }
                },
                {
                    type: "test2",
                    resolution: {
                        values: [
                            "ABcDeFg"
                        ]
                    }
                },
                {
                    type: "test3",
                    resolution: {
                        values: [
                            "TEST-3"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(true);
    });

	it("should return false if multiple valid conditions and one failure", () => {
        let node = {
            conditions: [
                {
                    entityId: "test",
                    not: false,
                    comparator: "REGEX_MATCH",
                    value: "^([a-b])$"
                },
                {
                    entityId: "test2",
                    not: false,
                    comparator: "CONTAINS",
                    value: "ABcD"
                },
                {
                    entityId: "test3",
                    not: false,
                    comparator: "EQUALS",
                    value: "TEST-3"
                }
            ]
        };
        let session = {};
        let args = {
            entities: [
                {
                    type: "test",
                    resolution: {
                        values: [
                            "A"
                        ]
                    }
                },
                {
                    type: "test2",
                    resolution: {
                        values: [
                            "ABcDeFg"
                        ]
                    }
                },
                {
                    type: "test3",
                    resolution: {
                        values: [
                            "TEST-3"
                        ]
                    }
                }
            ]
        };
        let next = () => {};
        expect(utils.checkConditions(node, session, args, next)).toEqual(false);
    });
});