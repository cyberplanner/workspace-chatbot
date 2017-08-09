import "whatwg-fetch";

const jsonFetch = (url, options) => {
  return fetch(url, Object.assign({}, options, {
    headers: Object.assign({}, options.headers, {
      "Accept": "application/json"
    })
  }));
};

export default jsonFetch;