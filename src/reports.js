/**
 * Define the various reports that can be run.
 */
const inquirer = require('inquirer');
const utils = require('./utils');
const timeularUtils = require('./timeularUtils');

module.exports = {
    /**
     * Define the report to print today's hours.
     */
    today: {
        label: "Today's Hours",
        process: (timeularApi, config) => {
            return new Promise((resolve, reject) => {
                timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                    let date1 = new Date();
                    date1.setDayStart();

                    let date2 = new Date();
                    date2.setDayEnd();

                    timeularUtils.getTimeEntries(timeularApi, token, date1, date2).then(entries => {
                        utils.printByDate(entries, config);
                        resolve(true);
                    });
                });
            });
        }
    },
    /**
     * Define the report to print yesterday's hours.
     */
    yesterday: {
        label: "Yesterday's Hours",
        process: (timeularApi, config) => {
            return new Promise((resolve, reject) => {
                timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                    let date1 = new Date();
                    date1.setDayStart(-1);

                    let date2 = new Date();
                    date2.setDayEnd(-1);

                    timeularApi.getTimeEntries(token, date1, date2).then(response => {
                        utils.printByDate(response.timeEntries, config)
                        resolve(true);
                    });
                }).catch(err => {
                    console.error(err.message);
                });
            });
        }
    },
    /**
     * Report all of this week's hours by day.
     */
    thisWeek: {
        label: "This Week's Hours",
        process: (timeularApi, config) => {
            timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                let date1 = new Date();
                date1.setWeekStart();

                let date2 = new Date();
                date2.setWeekEnd();

                timeularApi.getTimeEntries(token, date1, date2).then(response => {
                    utils.printByDate(response.timeEntries, config);
                });
            }).catch(err => {
                console.error(err.message);
            });
        }
    },
    /**
     * Define the report to list all hours recorded last week by day.
     */
    lastWeek: {
        label: "Last Week's Hours",
        process: (timeularApi, config) => {
            timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                let date1 = new Date();
                date1.setWeekStart(-1);

                let date2 = new Date();
                date2.setWeekEnd(-1);

                timeularApi.getTimeEntries(token, date1, date2).then(response => {
                    utils.printByDate(response.timeEntries, config);
                });
            }).catch(err => {
                console.error(err.message);
            });
        }
    },
    /**
     * Retrieve all hours for a specific day.
     */
    customDate: {
        label: "Specific Day",
        process: (timeularApi, config) => {
            // Get the custom date.
            const dateQuestion = {name: 'reportDate', message: "Get Report for Date [yyyy-mm-dd]:"};

            // @todo: Validate reportDate as a valid date string.
            inquirer.prompt([dateQuestion]).then(answer => {
                timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                    let date1 = new Date(answer.reportDate);
                    date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset());
                    date1.setDayStart();

                    let date2 = new Date(answer.reportDate);
                    date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset());
                    date2.setDayEnd();

                    timeularApi.getTimeEntries(token, date1, date2).then(response => {
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
        process: (timeularApi, config) => {
            timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
                timeularApi.getActivities(token).then(response => {
                    console.log(response);
                });
            }).catch(err => {
                console.error(err);
            });
        }
    },
};