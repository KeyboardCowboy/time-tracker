/**
 * @file
 * Node.js implementation for Timeular.
 */

require('./Date.prototype');
const request = require('request');

function TimeularApi() {
    this.apiUrl = 'https://api.timeular.com/api/v3/';
    this.apiToken = '';

    /**
     * Make a request against the Timeular API.
     *
     * @param endpoint
     * @param method
     * @param payload
     * @returns {Promise<unknown>}
     * @private
     */
    this._request = function (endpoint, method, payload) {
        method = method || 'GET';
        payload = payload || null;

        const options = {
            'method': method,
            'url': this.apiUrl + endpoint,
            'headers': {
                // @todo: Pull this from config?
                'User-Agent': 'LullabotTimeularMapper/1.0',
                'Content-Type': 'application/json'
            }
        };

        // Attach the authorization header if it is set.
        if (this.apiToken.length > 0) {
            options.headers['Authorization'] = "Bearer " + this.apiToken;
        }

        // Attach a payload to the request if necessary.
        if (payload) {
            options.body = JSON.stringify(payload);
        }

        // Make the request against the API.
        return new Promise((resolve, reject) => {
            request(options, (error, response) => {
                if (error || (response.statusCode != 200 && response.statusCode != 201)) {
                    let err = new Error();
                    err.message = "Unable to connect to the Timeular API: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    resolve(JSON.parse(response.body));
                }
            });
        });
    }

    /**
     * Connect the Developer API account.
     *
     * @param apiKey
     * @param apiSecret
     * @returns {Promise<*>}
     */
    this.connect = function (apiKey, apiSecret) {
        // Prevent redundant connection requests.
        if (this.apiToken.length > 0) {
            return new Promise((resolve, reject) => {
                resolve(this.apiToken);
            });
        } else {
            // Create a new connection.
            return this._request('developer/sign-in', 'POST', {
                "apiKey": apiKey,
                "apiSecret": apiSecret
            }).then(data => {
                this.apiToken = data.token;
                return data.token;
            }, err => {
                throw err;
            });
        }
    }

    /**
     * Fetch a list of Timeular activities for the account.
     *
     * @returns {Promise<*>}
     */
    this.getActivities = function () {
        return this._request('activities');
    }

    /**
     * Retrieve a set of time entries between two timestamps.
     *
     * @param startDate {Date}
     * @param endDate {Date}
     * @returns {Promise<*>}
     */
    this.getTimeEntries = function (startDate, endDate) {
        return this._request(`time-entries/${startDate.getTimeularTime()}/${endDate.getTimeularTime()}`);
    }
}

module.exports = TimeularApi;
