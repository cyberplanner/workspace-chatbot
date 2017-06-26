const mock = require('mock-require');

const neocaseHostName = process.env.NEOCASE_HOSTNAME;
const neocasePort = process.env.NEOCASE_PORT;
const neocaseAuthCredentials = {
    "userName": process.env.NEOCASE_USERNAME,
    "password": process.env.NEOCASE_PASSWORD
};

const endpoint = "http://" + neocaseHostName + ":" + neocasePort + "/RestAPI";

// Setup mock functions
const functions = {
    POST: {
        
    },
    GET: {

    },
    PUT: {

    }
}

mock('node-fetch', (url, options) => {
    let ep = url.replace(endpoint, "");
    let fn = functions[options.method][ep];
    if (fn) {
        return new Promise(resolve => resolve(fn(options)));
    } else {
        return false;
    }
});

const Neocase = require("../custom_modules/module_neocaseAdapter");

describe("Test Authentication call", function() {
	it("Tests that authentication sends a correctly formatted call", function(done) {
        /* 
            Mock out fetch functions
        */
        functions.POST["/authentication?language=English"] = (options) => {
            expect(options.body).toEqual(JSON.stringify(neocaseAuthCredentials));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({token_type: "Neocase", access_token: "aabb123"}))
            };
        };

        return Neocase.authenticate()
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({token_type: "Neocase", access_token: "aabb123"});
            done();
        });
    });
});

describe("Test getAllCases call", function() {
	it("Tests that getAllCases calls the correct endpoint - with the correct method and correct authentication header.", function(done) {
        /* 
            Mock out fetch functions
        */
        functions.GET["/cases"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve([{
                    name: "case123",
                    id: 1020202
                }, {
                    name: "case495",
                    id: 1020202123
                }]))
            };
        };

        return Neocase.getAllCases()
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual([{
                    name: "case123",
                    id: 1020202
                }, {
                    name: "case495",
                    id: 1020202123
                }]);
            done();
        });
    });
});

describe("Test createNewCase call", function() {
	it("Tests that createNewCase calls the correct endpoint - with the correct method and correct authentication header and Body.", function(done) {
        /* 
            Mock out fetch functions
        */
        functions.POST["/cases?language=English"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: 1230123,
                message: "I'd like to raise a ticket with HR for a base change"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyCreated: true }))
            };
        };

        return Neocase.createNewCase({
            caseID: 1230123,
            message: "I'd like to raise a ticket with HR for a base change"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyCreated: true });
            done();
        });
    });
});

describe("Test getCase call", function() {
	it("Tests that getCase calls the correct endpoint - with the correct authentication header", function(done) {
        /* 
            Mock out fetch functions
        */
        functions.GET["/cases/1234aaa"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ caseID: 12301401, message: "I'd like to change base please." }))
            };
        };

        return Neocase.getCase("1234aaa")
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ caseID: 12301401, message: "I'd like to change base please." });
            done();
        });
    });
});

describe("Test updateCase call", function() {
	it("Tests that updateCase calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 1230;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                message: "I'd like to raise a ticket with HR for a flex change"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyUpdated: true }))
            };
        };

        return Neocase.updateCase(caseID, {
            caseID: caseID,
            message: "I'd like to raise a ticket with HR for a flex change"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyUpdated: true });
            done();
        });
    });
});

describe("Test updateCase call", function() {
	it("Tests that updateCase calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 1230;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                message: "I'd like to raise a ticket with HR for a flex change"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyUpdated: true }))
            };
        };

        return Neocase.updateCase(caseID, {
            caseID: caseID,
            message: "I'd like to raise a ticket with HR for a flex change"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyUpdated: true });
            done();
        });
    });
});

describe("Test updateCaseDueDate call", function() {
	it("Tests that updateCaseDueDate calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 12311;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID + "/update/due_date"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                dueDate: "10/12/18"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyUpdatedDueDate: true }))
            };
        };

        return Neocase.updateCaseDueDate(caseID, {
            caseID: caseID,
            dueDate: "10/12/18"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyUpdatedDueDate: true });
            done();
        });
    });
});

describe("Test updateCaseProperties call", function() {
	it("Tests that updateCaseProperties calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 1999202;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID + "/update/case_properties"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                props: {
                    queued: true
                }
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyUpdatedCaseProps: true }))
            };
        };

        return Neocase.updateCaseProperties(caseID, {
            caseID: caseID,
            props: {
                queued: true
            }
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyUpdatedCaseProps: true });
            done();
        });
    });
});

describe("Test updateCustomFields call", function() {
	it("Tests that updateCustomFields calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 1999202;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID + "/update/case_customfields"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                fields: {
                    approver: "DC"
                }
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ successfullyUpdatedCustomFields: true }))
            };
        };

        return Neocase.updateCustomFields(caseID, {
            caseID: caseID,
            fields: {
                approver: "DC"
            }
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ successfullyUpdatedCustomFields: true });
            done();
        });
    });
});

describe("Test attachFileToCase call", function() {
	it("Tests that attachFileToCase calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 123009992;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID + "/attach_file_to_case"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                file: "url/to/file"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ attachedFile: true }))
            };
        };

        return Neocase.attachFileToCase(caseID, {
            caseID: caseID,
            file: "url/to/file"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ attachedFile: true });
            done();
        });
    });
});

describe("Test transferToTeam call", function() {
	it("Tests that transferToTeam calls the correct endpoint - with the correct method, correct authentication header and Body.", function(done) {
        const caseID = 8571230912;
        /* 
            Mock out fetch functions
        */
        functions.PUT["/cases/" + caseID + "/update/transfer_to_team"] = (options) => {
            expect(options.headers.Authorization).toEqual("Neocase aabb123");
            expect(options.body).toEqual(JSON.stringify({
                caseID: caseID,
                teamID: "Team-123"
            }));
            return {
                status: 200,
                json: () => new Promise((resolve) => resolve({ transferred: true }))
            };
        };

        return Neocase.transferToTeam(caseID, {
            caseID: caseID,
            teamID: "Team-123"
        })
        .then(response => {
            expect(response).not.toEqual({});
            expect(response).toEqual({ transferred: true });
            done();
        });
    });
});