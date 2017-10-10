import "whatwg-fetch";
import jsonFetch from "./jsonFetch";

const parseJSON = response => response.json();
const luisEndpoint = `${process.env.REACT_APP_API_ENDPOINT}/luis/`;

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.text());
  error.response = response;
  throw error;
};

export const getIntents = () => {
  return jsonFetch(`${luisEndpoint}/intents`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => results.Result);
};

export const getEntities = () => {
  return jsonFetch(`${luisEndpoint}/entities`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => results.Result);
};

export const getClosedLists = () => {
  return jsonFetch(`${luisEndpoint}/closed-lists`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => results);
};

