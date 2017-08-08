import "whatwg-fetch";

const parseJSON = response => response.json();
const conversationEndpoint = `${process.env
  .REACT_APP_API_ENDPOINT}/conversation`;

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.text());
  error.response = response;
  throw error;
};

export const retrieveAllConversationNodes = () => {
  return fetch(`${conversationEndpoint}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => {
      return results.rows;
    });
};

export const retrieveConversationNode = id => {
  return fetch(`${conversationEndpoint}/${id}`, {})
    .then(checkStatus)
    .then(parseJSON);
};

export const addNewChildToNode = (parentId, child) => {
  return fetch(`${conversationEndpoint}/${parentId}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      console.log(response);
      let req = Object.assign({}, response, {
        children: [].concat(child).concat(response.children)
      });
      console.log(req);
      return fetch(`${conversationEndpoint}/${parentId}`, {
        method: "PUT",
        body: JSON.stringify(req),
        headers: {
          "Content-Type": "application/json"
        }
      });
    })
    .then(checkStatus)
    .then(parseJSON);
};

export const updateChildOfNode = (parentId, child) => {
  return fetch(`${conversationEndpoint}/${parentId}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      let children = [].concat(response.children);
      let index = children.findIndex(item => {
        return item.nodeId === child.nodeId;
      });
      children[index] = child;

      let req = Object.assign({}, response, {
        children: children
      });

      return fetch(`${conversationEndpoint}/${parentId}`, {
        method: "PUT",
        body: JSON.stringify(req),
        headers: {
          "Content-Type": "application/json"
        }
      });
    })
    .then(checkStatus)
    .then(parseJSON);
};

export const createNewConversationNode = nodeData => {
  return fetch(`${conversationEndpoint}`, {
    method: "POST",
    body: JSON.stringify(nodeData),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then(parseJSON);
};

export const updateConversationNode = (id, nodeData) => {
  return fetch(`${conversationEndpoint}/${id}`, {
    method: "PUT",
    body: JSON.stringify(nodeData),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then(parseJSON);
};

export const deleteConversationNode = id => {
  return fetch(`${conversationEndpoint}/${id}`, {
    method: "DELETE"
  })
    .then(checkStatus)
    .then(parseJSON);
};
