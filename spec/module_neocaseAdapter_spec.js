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