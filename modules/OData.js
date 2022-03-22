const req = require('request');

module.exports.get = function (params) { 
    return new Promise(function (resolve, reject) {
     fetchOdata(params).then(function (res) {
        let jsonResponse = JSON.parse(res);
        let sapDataCollection = jsonResponse.d.results;
        let sapDataCollectionFormatted = sapDataCollection.map(({ __metadata, ...rest }) => rest);
        console.log(sapDataCollectionFormatted)
        resolve(sapDataCollectionFormatted) 
      });
    });
};

  function fetchOdata(params) {
    return new Promise(function (resolve, reject) {
      let url = params.url;
      let csrfToken;

      let urlReq = `/${params.entity}?$filter=(${params.filter} eq'${params.value}')&$format=json`;
   
      req({
        url: url + urlReq,
        method:'GET',
        headers: {
          'Authorization': `Basic ${params.basicAuth}`,
          'Content-Type': 'application/json',
          'x-csrf-token': 'Fetch'
        }
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          csrfToken = response.headers['x-csrf-token'];
          console.log("{ x-csrf token: " + csrfToken + " }");
          resolve(response.body);
        } else {
          reject(response);
        }
      });
    });
  }