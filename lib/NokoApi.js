/**
 * @file
 * Node.js implementation for Noko.
 * https://developer.nokotime.com/v2/
 */

const NokoTimeEntry = require("./NokoTImeEntry");
const request = require("request");

function NokoApi(token) {
    this.api = 'https://api.nokotime.com/v2';
    this.token = token;

    /**
     * Perform an API request to Noko.
     */
    this._request = function(endpoint, method, payload) {
        payload = payload || null;

        const options = {
            'method': method,
            'url': this.api + '/' + endpoint,
            'headers': {
                // @todo: Pull this from config?
                'User-Agent': 'LullabotTimeularMapper/1.0',
                'Content-Type': 'application/json',
                'X-NokoToken': this.token
            }
        };

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
                    resolve(data);
                }
            });
        });
    }

    this.newTimeEntry = function(date, minutes, project, description) {
        return new NokoTimeEntry(date, minutes, project, description);
    }

    /**
     * Retrieve a specific entry from Noko.
     *
     * @param entryId
     */
    this.getEntry = function(entryId) {
        return this._request(`entries/${entryId}`, 'GET');
    }

    /**
     * Create a time entry in Noko.
     *
     * @param TimeEntry {NokoTimeEntry}
     * @returns {*}
     */
    this.addEntry = function(TimeEntry) {
        if (TimeEntry instanceof NokoTimeEntry) {
            return this._request(`entries`, 'POST', TimeEntry.getPayloadData());
        }
        else {
            throw new Error("Invalid object used to create a Noko time record.  Must be NokoTimeEntry type.");
        }
    }
}

module.exports = NokoApi;