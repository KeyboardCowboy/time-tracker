/**
 * Define the various reports that can be run.
 */
const inquirer = require('inquirer');
const utils = require('./utils');
const timeularUtils = require('./timeularUtils');
const timeularApi = require('../lib/timeular');

module.exports = {
    /**
     * Define the report to print today's hours.
     */
    today: {
        label: "Today's Hours",
        process: (config, token) => {
            return new Promise((resolve, reject) => {
                let date1 = new Date();
                date1.setDayStart();

                let date2 = new Date();
                date2.setDayEnd();

                timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(entries);
                });
            });
        }
    },
    /**
     * Define the report to print yesterday's hours.
     */
    yesterday: {
        label: "Yesterday's Hours",
        process: (config, token) => {
            return new Promise((resolve, reject) => {
                let date1 = new Date();
                date1.setDayStart(-1);

                let date2 = new Date();
                date2.setDayEnd(-1);

                timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(entries);
                });
            });
        }
    },
    /**
     * Report all of this week's hours by day.
     */
    thisWeek: {
        label: "This Week's Hours",
        process: (config, token) => {
            return new Promise((resolve, reject) => {
                let date1 = new Date();
                date1.setWeekStart();

                let date2 = new Date();
                date2.setWeekEnd();

                timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(entries);
                });
            });
        }
    },
    /**
     * Define the report to list all hours recorded last week by day.
     */
    lastWeek: {
        label: "Last Week's Hours",
        process: (config, token) => {
            return new Promise((resolve, reject) => {
                let date1 = new Date();
                date1.setWeekStart(-1);

                let date2 = new Date();
                date2.setWeekEnd(-1);

                timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(entries);
                });
            });
        }
    },
    /**
     * Retrieve all hours for a specific day.
     */
    customDate: {
        label: "Specific Day",
        process: (config, token) => {
            // Get the custom date.
            const dateQuestion = {name: 'reportDate', message: "Get Report for Date [yyyy-mm-dd]:"};

            // @todo: Validate reportDate as a valid date string.
            inquirer.prompt([dateQuestion]).then(answer => {
                timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
                    let date1 = new Date(answer.reportDate);
                    date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset());
                    date1.setDayStart();

                    let date2 = new Date(answer.reportDate);
                    date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset());
                    date2.setDayEnd();

                    timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(response => {
                        utils.printByDate(response.timeEntries, config);
                    });
                }).catch(err => {
                    console.error(err.message);
                });
            });
        }
    },
    /**
     * List all your defined Timeular activities.
     */
    activities: {
        label: "Timeular Activities",
        process: (config, token) => {
            timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
                timeularApi.getActivities(token).then(response => {
                    console.log(response);
                });
            }).catch(err => {
                console.error(err);
            });
        }
    },
};