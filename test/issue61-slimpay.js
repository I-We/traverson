/*
Step: HTTP Basic Authentication
POST https://api-sandbox.slimpay.net/oauth/token

Accept: application/hal+json; profile="https://api.slimpay.net/alps/v1"
Authorization: Basic Base64(hbih9vahrbk5a:zjMzjc5HhdOtK#Rpo3dub2YfQQZ6)
  Content-Type: application/x-www-form-urlencoded

  grant_type=client_credentials&scope=api

equivalent in curl:
curl -u "democreditor01:demosecret01" \
-d "grant_type=client_credentials&scope=api" \
https://api-sandbox.slimpay.net/oauth/token
*/

'use strict';

const traverson = require('../traverson');
let btoa_ = null;
if (typeof btoa === 'function') {
  btoa_ = btoa
} else {
  btoa_ = require('btoa');
}

const api = traverson.from('https://api-sandbox.slimpay.net/oauth/token');
const auth = 'Basic ' + btoa_('democreditor01:demosecret01');

api
.newRequest()
.withRequestOptions({
  /*
  headers: {
    'Authorization': auth,
  },
  form: {
    'grant_type': 'client_credentials',
    'scope': 'api'
  }
  */
  headers: {
    'Authorization': auth,
    'content-type': 'application/x-www-form-urlencoded',
  },
  qs: {
    'grant_type': 'client_credentials',
    'scope': 'api'
  }

})
.post(null,function(err, response, traversal){
  console.log(err);
  console.log(response.statusCode);
  console.log(response.statusMessage);
  console.log(response.body);
});
