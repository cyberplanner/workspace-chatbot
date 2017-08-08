import "whatwg-fetch";

const parseJSON = response => response.json();
const knowledgeManagment = `${process.env
  .REACT_APP_API_ENDPOINT}/knowledge`;
const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.text());
  error.response = response;
  throw error;
};

export const KnowledgeManagmentService = (path, option) => {
  return fetch(`${knowledgeManagment}${path}`, option)
    .then(checkStatus)
    .then(parseJSON);
};
