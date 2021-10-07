#!/usr/local/bin/node

/**
 * @file
 * Node.js implementation for Timeular.
 */

require('./Date.prototype');
const request = require('request');
const NodeCache = require('node-cache');
const TimeularEntry = require('./src/TimeularEntry');
const TimeularActivity = require('./src/TimeularActivity');

class TimeularApi {
    #apiUrl = 'https://api.timeular.com/api/v3/';
    #apiToken = '';
    #cache = {};

    /**
     * Constructor.
     */
    constructor() {
        this.#cache = new NodeCache();
    }

    /**
     * Make a request against the Timeular API.
     *
     * @param endpoint
     * @param method
     * @param payload
     * @returns {Promise<unknown>}
     * @private
     */
    _request(endpoint, method, payload) {
        method = method || 'GET';
        payload = payload || null;

        const options = {
            'method': method,
            'url': this.#apiUrl + endpoint,
            'headers': {
                // @todo: Pull this from config?
                'User-Agent': 'LullabotTimeularMapper/1.0',
                'Content-Type': 'application/json'
            }
        };

        // Check the cache first.
        if (this.#cache.has(endpoint)) {
            return new Promise((resolve, reject) => {
                console.log(endpoint + ' retrieved from cache.');
                resolve(this.#cache.get(endpoint));
            });
        }

        // Attach the authorization header if it is set.
        if (this.#apiToken.length > 0) {
            options.headers['Authorization'] = "Bearer " + this.#apiToken;
        }

        // Attach a payload to the request if necessary.
        if (payload) {
            options.body = JSON.stringify(payload);
        }

        // Make the request against the API.
        return new Promise((resolve, reject) => {
            console.log('API request: ' + endpoint);
            request(options, (error, response) => {
                if (error || (response.statusCode != 200 && response.statusCode != 201)) {
                    let err = new Error();
                    err.message = "Unable to connect to the Timeular API: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    let value = JSON.parse(response.body);

                    // Store the response in cache to save on API requests if it's called again.
                    if (options.method === 'GET') {
                        this.#cache.set(endpoint, value);
                    }
                    resolve(value);
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
    connect(apiKey, apiSecret) {
        // Prevent redundant connection requests.
        if (this.#apiToken.length > 0) {
            return new Promise((resolve, reject) => {
                resolve(this.#apiToken);
            });
        } else {
            // Create a new connection.
            return this._request('developer/sign-in', 'POST', {
                "apiKey": apiKey,
                "apiSecret": apiSecret
            }).then(data => {
                this.#apiToken = data.token;
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
    async getActivities() {
        const response = await this._request('activities');
        const activities = response.activities.map(activity => new TimeularActivity(activity));
        return new Promise((resolve, reject) => resolve(activities));
    }

    /**
     * Get a specific activity object.
     * @param activityId
     * @returns {Promise<*>}
     */
    async getActivity(activityId) {
        const activities = await this.getActivities();
        return activities.find((item) => item.activity.id === activityId);
    }

    /**
     * Retrieve a set of time entries between two timestamps.
     *
     * @param startDate {Date}
     * @param endDate {Date}
     * @returns {Promise<*>}
     */
    async getTimeEntries(startDate, endDate) {
        const response = await this._request(`time-entries/${startDate.getTimeularTime()}/${endDate.getTimeularTime()}`);
        const activities = await this.getActivities();
        return response.timeEntries.map(entry => {
            let te = new TimeularEntry(entry);
            te.activity = activities.find(activity => entry.activityId === activity.getId());
            return te;
        });
    }

}

module.exports = TimeularApi;
