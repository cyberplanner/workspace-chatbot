import "whatwg-fetch";
import jsonFetch from "./jsonFetch";

const parseJSON = response => response.json();
const superchargerEndpoint = `${process.env
  .REACT_APP_API_ENDPOINT}/supercharger`;

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.text());
  error.response = response;
  throw error;
};

export const retrieveAllSuperchargers = () => {
  return jsonFetch(`${superchargerEndpoint}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => {
      return results.rows;
    });
};
