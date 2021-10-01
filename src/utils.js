/**
 * Collection of general utility methods.
 */
require('./prototype');
const NokoApi = require('../lib/NokoApi');
const TimeularApi = require('../lib/TimeularApi');
const TimeularEntry = require('../lib/TimeularEntry');
const inquirer = require('inquirer');
const colors = require('colors');

module.exports = {

    /**
     * Get a list of Timeular Time Entries with the Activity Name included, not just the ID.
     *
     * @param {TimeularApi}Timeular
     * @param {NokoApi} Noko
     * @param {Date} date1
     * @param {Date} date2
     */
    getTimeularTimeEntries: (Timeular, Noko, date1, date2) => {
        return new Promise((resolve, reject) => {
            const promises = [];
            promises.push(Timeular.getActivities());
            promises.push(Timeular.getTimeEntries(date1, date2));
            resolve(Promise.all(promises));
        }).then(response => {
            const activities = {};
            const entries = [];

            // Create a simple referencable object for activities to their IDs.
            response[0].activities.forEach(activity => {
                activities[activity.id] = activity.name;
            });

            // Add activity name to entries.
            response[1].timeEntries.forEach(entry => {
                entry.activityName = activities[entry.activityId];

                // Attach the associated Noko project name.
                // Noko.getProject().then(project => {
                // });

                entries.push(entry);
            });

            return entries;
        });
    },

    logEntriesToNoko: (entries) => {

    }

}