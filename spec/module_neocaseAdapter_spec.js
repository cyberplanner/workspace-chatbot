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
            if (options.body && options.body === JSON.stringify(neocaseAuthCredentials)) {
                return {
                    status: 200,
                    json: () => new Promise((resolve) => resolve({token_type: "Neocase", access_token: "aabb123"}))
                };
            } else {
                return {
                    status: 500,
                    json: () => new Promise((resolve) => resolve({success: false}))
                };
            }
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
            if (options.headers.Authorization === "Neocase aabb123") {
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
            }
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