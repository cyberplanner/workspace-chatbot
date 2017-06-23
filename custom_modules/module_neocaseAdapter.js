/*
    An module with async functions (through Promises) for calling Neocase's Rest API
 */

const http = require("http");
const fetch = require("node-fetch");
const neocaseHostName = process.env.NEOCASE_HOSTNAME;
const neocasePort = process.env.NEOCASE_PORT;
const neocaseAuthCredentials = {
    "userName": process.env.NEOCASE_USERNAME,
    "password": process.env.NEOCASE_PASSWORD
};
const endpoint = "http://" + neocaseHostName + ":" + neocasePort + "/RestAPI/";
exports = {};

const commonOptions = {
    hostname: neocaseHostName,
    port: neocasePort,
};

// Abstracted function that contains the logic to actually make a http call.
// Async - Due to http module and Promises.
function sendRequest(requestOptions, requestBody) {
    return new Promise((resolve, reject) => {
        const req = http.request(requestOptions, (res) => {
            if (res.statusCode !== 200) {
                reject(res.statusCode);
            }
            else {
                let data;
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            }
        });
        requestBody === undefined ? console.log("No body in request") : req.write(requestBody);
        req.end();
    });
}

function authenticate() {
    return fetch(endpoint + "authentication?language=English", {
        body: JSON.stringify(neocaseAuthCredentials),
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        return response.json();
    });
}

exports.authenticate = authenticate;

exports.getAllCases = () => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "GET",
                    path: "/cases",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.createNewCase = (body) => {
    return authenticate()
    .then((authenticationData) => {
        return fetch(endpoint + "cases?language=English", {
            body: JSON.stringify(body),
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
            }
        })
        .then(function(response) {
            return response.json();
        });
    })
    .catch((authStatusCode) => {
        reject(authStatusCode + ": Failed to authenticate!")
    });
};

exports.getCase = (id) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "GET",
                    path: "/cases/" + id,
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.updateCase = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id,
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.updateCaseDueDate = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id + "/update/due_date",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.updateCaseProperties = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id + "/update/case_properties",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.updateCustomFields = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id + "/update/case_customfields",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.attachFileToCase = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id + "/attach_file_to_case",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

exports.transferToTeam = (id, body) => {
    return new Promise((resolve, reject) => {
        authenticate()
            .then((authenticationData) => {
                let options = Object.assign({
                    method: "PUT",
                    path: "/cases/" + id + "/update/transfer_to_team",
                    headers: {
                        "Authorization": authenticationData["token_type"] + " " + authenticationData["access_token"]
                    }
                }, commonOptions);
                sendRequest(options, body)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((statusCode) => {
                        reject(statusCode);
                    })
            })
            .catch((authStatusCode) => {
                reject(authStatusCode + ": Failed to authenticate!")
            });
    });
};

module.exports = exports;
