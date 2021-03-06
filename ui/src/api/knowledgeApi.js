import "whatwg-fetch";
import jsonFetch from "./jsonFetch";

const parseJSON = response => response.json();
const knowledgeEndpoint = `${process.env.REACT_APP_API_ENDPOINT}/knowledge`;

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.text());
  error.response = response;
  throw error;
};

export const getKnowledgeById = id => {
  return jsonFetch(`${knowledgeEndpoint}/${id}`, {})
    .then(checkStatus)
    .then(parseJSON);
};

export const bulkDeleteKnowledge = arrayOfIDs => {
  return jsonFetch(
    `${knowledgeEndpoint}/bulk/all?id=${arrayOfIDs.join("&id=")}`,
    {
      method: "DELETE"
    }
  )
    .then(checkStatus)
    .then(parseJSON);
};
