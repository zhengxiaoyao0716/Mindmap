import fetch from 'dva/fetch';

// function parseJSON(response) {
//   return response.json();
// }

// function checkStatus(response) {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   }

//   const error = new Error(response.statusText);
//   error.response = response;
//   throw error;
// }

// /**
//  * Requests a URL, returning a promise.
//  *
//  * @param  {string} url       The URL we want to request
//  * @param  {object} [options] The options we want to pass to "fetch"
//  * @return {object}           An object containing either "data" or "err"
//  */
// export default function request(url, options) {
//   return fetch(url, options)
//     .then(checkStatus)
//     .then(parseJSON)
//     .then(data => ({ data }))
//     .catch(err => ({ err }))
//     ;
// }

import { message } from 'antd';

export default function request(url, data = undefined) {
  return fetch(`/Mindmap${url}`, {
    method: data ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': data ? 'application/json; charset="UTF-8"' : 'application/x-www-form-urlencoded',
    },
    body: data && JSON.stringify(data),
    credentials: 'include',
  }).then(
    r => r.json().catch(
      () => Promise.reject(new Error(r.statusText)),
    ).then(
      (json) => {
        if (r.status >= 200 && r.status < 300) {
          return json.body;
        }
        message.error(json.reas);
        throw new Error(json.reas);
      },
    ),
  );
}
