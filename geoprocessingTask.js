var Promise = require("bluebird");
var request = require('request');

class GeoprocessingTask {
	constructor() {
		
	}

    submitJob (toolName, params, url) {
        return new Promise((resolve, reject) => {
            var submitJobUrl = url + "/submitJob";
            params.f = "json";

            request.post({
                url: submitJobUrl,
                form: params
                }, 
                (error, response, body) => {
                    if(error) {
                        reject(error.message);
                    } else {
                        // Get the job jobId
                        body = JSON.parse(body);
                        var jobId = body.jobId;

                        // Start polling to see if the job gp task is complete.
                        var interval = setInterval( () => {
                            this._isJobComplete(toolName, url, jobId).then( (result) => {
                                if(result.isComplete === true) {
                                    clearInterval(interval);

                                    // Get the results from the server
                                    this._getAllResults(url, result.results, jobId).then( (allResults) => {
                                        resolve(allResults);
                                    });
                                }
                            }, (error) => {
                                clearInterval(interval);
                                reject(error);
                            });
                        }, 1000);
                    }
            });
        });
    }

    _isJobComplete (toolName, url , jobId) {
        return new Promise((resolve, reject) => {
            url = url + "/jobs/" + jobId + "?f=json";
            request.post({
                url: url
                }, 
                (error, response, body) => {
                    if (error) {
                        reject(error.message);
                    }
                    else {
                        var resultJSON = JSON.parse(body);
                        if(resultJSON.jobStatus === "esriJobSucceeded") {
                            resolve({isComplete: true, results: resultJSON.results});
                        } else if(resultJSON.jobStatus === "esriJobFailed") {
                            console.log(resultJSON.messages);
                            reject(resultJSON.jobStatus);
                        } else {
                            console.log(toolName + " is running...");
                            resolve({isComplete: false});
                        }
                    }
            });
        });
    }

    _getAllResults (url, paramURLs, jobId) {
        return new Promise((resolve, reject) => {

            var promises = [];
            var results = {};

            for (var prop in paramURLs) {
                if (paramURLs.hasOwnProperty(prop)) {
                    var promise = this._getResult(url, prop, jobId).then( (paramResult) => {
                        results[paramResult.paramName] = paramResult.value;
                    });
                    promises.push(promise);
                }
            }

            Promise.all(promises).then( () => {
                resolve(results);
            });
        });
    }

    _getResult (url, paramUrl, jobId) {
        return new Promise((resolve, reject) => {
            url = url + "/jobs/" + jobId + "/results/" + paramUrl + "?f=json";
            request.post({
                url: url
                }, 
                (error, response, body) => {
                    var resultJSON = JSON.parse(body);
                    resolve(resultJSON);
            });
        });
    }


} // end class

module.exports = GeoprocessingTask;