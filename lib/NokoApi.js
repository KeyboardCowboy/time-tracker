/**
 * @file
 * Node.js implementation for Noko.
 * https://developer.nokotime.com/v2/
 */

const request = require("request");
const NodeCache = require('node-cache');
const NokoTimeEntry = require("./src/NokoTimeEntry");
const NokoProject = require('./src/NokoProject');

/**
 * Defines the NokoApi class.
 */
class NokoApi {
    #api = 'https://api.nokotime.com/v2';
    #token = '';
    #cache = {};

    /**
     * Constructor.
     * @param token
     */
    constructor(token) {
        this.#token = token;
        this.#cache = new NodeCache();
    }

    /**
     * Perform an API request to Noko.
     */
    _request(endpoint, method, payload) {
        payload = payload || null;

        const options = {
            'method': method,
            'url': this.#api + '/' + endpoint,
            'headers': {
                // @todo: Pull this from config?
                'User-Agent': 'LullabotTimeularMapper/1.0',
                'Content-Type': 'application/json',
                'X-NokoToken': this.#token
            }
        };

        // Check the cache first.
        if (this.#cache.has(endpoint)) {
            return new Promise((resolve, reject) => {
                resolve(this.#cache.get(endpoint));
            });
        }

        // Verify this by POST request as well?
        if (payload) {
            options.body = JSON.stringify(payload);
        }

        return new Promise((resolve, reject) => {
            request(options, (error, response) => {
                if (error || (response.statusCode != 200 && response.statusCode != 201)) {
                    let err = new Error();
                    err.message = "Unable to connect to the Noko API: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    let data = JSON.parse(response.body);

                    // Store the response in cache to save on API requests if it's called again.
                    if (options.method === 'GET') {
                        this.#cache.set(endpoint, data);
                    }

                    resolve(data);
                }
            });
        });
    }

    /**
     * Create a new NokoTimeEntry object.
     *
     * @param date
     * @param minutes
     * @param project
     * @param description
     * @returns {NokoTimeEntry}
     */
    newTimeEntry(date, minutes, project, description) {
        return new NokoTimeEntry(date, minutes, project, description);
    }

    /**
     * Retrieve a specific entry from Noko.
     *
     * @param entryId
     */
    getEntry(entryId) {
        return this._request(`entries/${entryId}`, 'GET');
    }

    /**
     * Create a time entry in Noko.
     *
     * @param TimeEntry {NokoTimeEntry}
     * @returns {*}
     */
    addEntry(TimeEntry) {
        if (TimeEntry instanceof NokoTimeEntry) {
            return this._request(`entries`, 'POST', TimeEntry.getPayloadData());
        } else {
            throw new Error("Invalid object used to create a Noko time record.  Must be NokoTimeEntry type.");
        }
    }

    /**
     * Get a project from Noko by it's ID.
     * @param projectId
     * @returns {Promise<NokoProject>}
     */
    async getProject(projectId) {
        const project = await this._request(`projects/${projectId}`, 'GET');
        return new NokoProject(project);
    }
}

module.exports = NokoApi;