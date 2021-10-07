/**
 * Define the various reports that can be run.
 */
const inquirer = require('inquirer');
const utils = require('./utils');

module.exports = {
    /**
     * Define the report to print today's hours.
     */
    today: {
        label: "Today's Hours",
        load: async (T2N) => {
            const date1 = new Date();
            date1.setDayStart();

            const date2 = new Date();
            date2.setDayEnd();

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                const entryDate = timeularEntries[0].getDate();
                const projGroup = await T2N.groupTimeularEntriesByProject(timeularEntries);

                // @todo: Sort by project id to keep reports consistently formatted.

                // Print the day's summary.
                T2N.printDaySummary(entryDate, projGroup);
            }
        }
    },
    /**
     * Define the report to print yesterday's hours.
     */
    yesterday: {
        label: "Yesterday's Hours",
        load: async (T2N) => {
            const date1 = new Date();
            date1.setDayStart(-1);

            const date2 = new Date();
            date2.setDayEnd(-1);

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                const entryDate = timeularEntries[0].getDate();
                const projGroup = await T2N.groupTimeularEntriesByProject(timeularEntries);

                // @todo: Sort by project id to keep reports consistently formatted.

                // Print the day's summary.
                T2N.printDaySummary(entryDate, projGroup);
            }
        },
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

                timeularUtils.getTimeEntries(token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(true);
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
        process: (config, token) => {
            return new Promise((resolve, reject) => {
                let date1 = new Date();
                date1.setWeekStart(-1);

                let date2 = new Date();
                date2.setWeekEnd(-1);

                timeularUtils.getTimeEntries(token, date1, date2).then(entries => {
                    utils.printByDate(entries, config);
                    resolve(true);
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
        load: async (T2N) => {
            return await T2N.timeularApi.getActivities();
        },
        print: (T2N, activities) => {
            activities.forEach(activity => {
                console.log(activity.getId() + ': ' + activity.getName());
            });
        }
    },
};