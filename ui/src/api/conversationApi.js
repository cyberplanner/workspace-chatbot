import "whatwg-fetch";
import jsonFetch from "./jsonFetch";

const parseJSON = response => response.json();
const conversationEndpoint = `${process.env
  .REACT_APP_API_ENDPOINT}/conversation`;

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  try {
    const error = new Error(response.text());
    error.response = response;
    throw error;
  } catch (e) {
    console.error(e);
  }
};

export const retrieveAllConversationNodes = () => {
  return jsonFetch(`${conversationEndpoint}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(results => {
      return results.rows.map(item => {
        return Object.assign({}, item, {
          doc: Object.assign({}, item.doc, {
            children: item.doc.children.map(child =>
              Object.assign({}, child, {
                conditions: child.conditions.map(condition =>
                  Object.assign({}, condition, {
                    caseSensitive: Boolean(condition.caseSensitive),
                    checkUserData: Boolean(condition.checkUserData),
                    comparator: condition.comparator,
                    entityId: condition.entityId,
                    not: Boolean(condition.not),
                    value: condition.value
                  })
                )
              })
            )
          })
        });
      });
    });
};

export const retrieveConversationNode = id => {
  return jsonFetch(`${conversationEndpoint}/${id}`, {})
    .then(checkStatus)
    .then(parseJSON);
};

export const addNewChildToNode = (parentId, child) => {
  return jsonFetch(`${conversationEndpoint}/${parentId}`, {})
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
  return jsonFetch(`${conversationEndpoint}/${parentId}`, {})
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

export const deleteChildOfNode = (parentId, childId) => {
  return jsonFetch(`${conversationEndpoint}/${parentId}`, {})
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      let children = [].concat(response.children);
      let index = children.findIndex(item => {
        return item.nodeId === childId;
      });

      children.splice(index, 1);

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
  return jsonFetch(`${conversationEndpoint}`, {
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
  return jsonFetch(`${conversationEndpoint}/${id}`, {
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
  return jsonFetch(`${conversationEndpoint}/${id}`, {
    method: "DELETE"
  })
    .then(checkStatus)
    .then(parseJSON);
};

export const bulkDeleteConversationNodes = arrayOfIDs => {
  return jsonFetch(
    `${conversationEndpoint}/bulk/all?id=${arrayOfIDs.join("&id=")}`,
    {
      method: "DELETE"
    }
  )
    .then(checkStatus)
    .then(parseJSON);
};
