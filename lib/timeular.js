/**
 * @file
 * Node.js implementation for Timeular.
 */

require('../src/prototype');
const request = require('request');
const apiUrl = 'https://api.timeular.com/api/v3/';

module.exports = {
    /**
     * Connect to the Timeular API and retrieve the necessary access token.
     */
    connect: (apiKey, apiSecret) => {
        let options = {
            'method': 'POST',
            'url': apiUrl + 'developer/sign-in',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "apiKey": apiKey,
                "apiSecret": apiSecret
            })
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response) => {
                if (error || response.statusCode == 404) {
                    let err = new Error();
                    err.message = "Unable to connect to the Timeular API: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    let data = JSON.parse(response.body);
                    resolve(data.token);
                }
            });
        });
    },

    /**
     * Get all defined activities.
     */
    getActivities: (token) => {
        let options = {
            'method': 'GET',
            'url': apiUrl + 'activities',
            'headers': {
                'Authorization': "Bearer " + token
            }
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response) => {
                if (error || response.statusCode == 404) {
                    let err = new Error();
                    err.message = "Unable to retrieve activities: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    resolve(JSON.parse(response.body));
                }
            });
        });
    },

    /**
     * Get time entries within a given time range.
     */
    getTimeEntries: (token, startDate, endDate) => {
        let options = {
            'method': 'GET',
            'url': apiUrl + 'time-entries/' + startDate.getTimeularTime() + '/' + endDate.getTimeularTime(),
            'headers': {
                'Authorization': 'Bearer ' + token
            }
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response) => {
                if (error || response.statusCode != 200) {
                    let err = new Error();
                    err.message = "Unable to connect to the Timeular API: " + error ? error?.message : response.statusMessage;
                    reject(err);
                } else {
                    resolve(JSON.parse(response.body));
                }
            });
        });
    }
}
