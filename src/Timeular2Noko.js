/**
 * Custom class to report Timeular time to Noko.
 */

const inquirer = require("inquirer");
const TimeularApi = require('../lib/TimeularApi');
const NokoApi = require('../lib/NokoApi');
const TimeularEntry = require("../lib/src/TimeularEntry");
const colors = require('colors');

class Timeular2Noko {
    /**
     * The application config.
     */
    config = {};

    /**
     * A connection to the Timeular API for this account.
     * @type {TimeularApi}
     */
    timeularApi = null;

    /**
     * A connection to the Noko API for this account.
     * @type {NokoApi}
     */
    nokoApi = null;

    /**
     * Instantiate a new project instance.
     *
     * @param config
     * @constructor
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Establish API connections.
     *
     * @returns {Promise<void>}
     */
    init(options) {
        // Instantiate a Noko API object.  Does not require a request.
        this.nokoApi = new NokoApi(this.config.nokoToken);
        this.nokoApi.debug(options.debug);

        return new Promise((resolve, reject) => {
            // Instantiate a Timeular API object.
            this.timeularApi = new TimeularApi();
            this.timeularApi.debug(options.debug);

            this.timeularApi.connect(this.config.timeularKey, this.config.timeularSecret).then(response => {
                resolve(response);
            }).catch(err => {
                console.error(err);
            });
        });
    }

    /**
     * Get an array of tags and notes from each entry.
     *
     * @param timeularEntries
     * @returns {*[]}
     */
    getTasksFromTimeularEntries(timeularEntries) {
        let tasks = [];

        // Gather tags and notes from each entry.
        timeularEntries.forEach(entry => {
            let notes = entry.getNotes();

            // If there are no tags or text on the entry, use the Timeular Activity label.
            if (notes.length === 0) {
                notes.push(entry.activity.getName());
            }

            tasks = tasks.concat(notes);
        });

        // Remove duplicate and empty notes and tags.
        return tasks.filter((val, index) => {
            return (typeof val !== "undefined") &&
                (val.trim() !== "") &&
                (tasks.indexOf(val) === index);
        });
    }

    /**
     * Print a report of the time entries for the dates selected to the console.
     *
     * @param date
     * @param {array} groupedByProject
     */
    async printDaySummary(date, groupedByProject) {
        let billableHours = 0;
        let nonBillableHours = 0;

        // Print the date.
        console.log(`\n${date.getDayFull()}`.bold.red);

        // Run through each project and print summarized data.
        for (let projId in groupedByProject) {
            // Get the project from the Id.
            const project = await this.nokoApi.getProject(projId);

            // Get the total duration of time worked on this project for this day.
            const projHours = this.sumTimeularEntries(groupedByProject[projId]);

            // Get a filtered array of tasks and tags for the entries in this project.
            const projTasks = this.getTasksFromTimeularEntries(groupedByProject[projId]);

            // Print the project summary.
            console.log(`    ${projHours} hours \t ${project.getName().blue} | ${projTasks.join(", ")}`);

            // Log billable and non-billable time.
            if (project.isBillable()) {
                billableHours += projHours;
            } else {
                nonBillableHours += projHours;
            }
        }

        console.log(`\n    Billable:\t\t${billableHours} hours`);
        console.log(`    Not Billable:\t${nonBillableHours} hours`);
        console.log(`    Total:\t\t${billableHours + nonBillableHours} hours`.bold);
    }

    /**
     * Given an array of timeular entries, group them by the day they were recorded.
     * @param timeularEntries
     * @returns {{}}
     */
    groupTimeularEntriesByDate(timeularEntries) {
        const grouped = {};

        timeularEntries.forEach(entry => {
            grouped[entry.getDay()] = grouped[entry.getDay()] || [];
            grouped[entry.getDay()].push(entry);
        });

        return grouped;
    }

    /**
     * Given an array of timeular entries, group them by the Noko project they are associated with.
     * @param timeularEntries
     * @returns {{}}
     */
    groupTimeularEntriesByProject(timeularEntries) {
        const grouped = {};

        timeularEntries.forEach(entry => {
            const activity = entry.getActivity();
            let nokoProjectId = 0;

            if (this.config.activityProjectMap.hasOwnProperty(activity.getId())) {
                nokoProjectId = this.config.activityProjectMap[activity.getId()];
            }

            grouped[nokoProjectId] = grouped[nokoProjectId] || [];
            grouped[nokoProjectId].push(entry);
        });


        return grouped;
    }

    /**
     * Get the  name of the report to run.  If not supplied, give users a choice.
     *
     * @param options
     * @param reports
     * @returns {Promise<unknown>}
     */
    getReport(options, reports) {
        return new Promise((resolve, reject) => {
            // Get a list of report names from the processor.
            let reportNames = [];
            for (let i in reports) {
                reportNames.push({name: reports[i].label, value: i});
            }

            // If a report was specified in the command, adjust the
            if (options?.report.length > 0) {

            }

            const reportName = {
                type: 'list',
                name: 'reportName',
                message: "What report would you like to run?",
                choices: reportNames,
                when(answers) {
                    return !options.hasOwnProperty('report') || options.report !== 'customDate';
                }
            };
            const reportDate = {
                name: 'reportDate',
                message: "Get Report for Date [yyyy-mm-dd]:",
                when(answers) {
                    return answers.reportName === 'customDate' || options?.report === 'customDate';
                }
            };

            // If a report wasn't specified as an option, ask the user for it.
            if (!options.hasOwnProperty('report') || options.report === 'customDate') {
                inquirer.prompt([reportName, reportDate]).then(answers => {
                    // Backfill the report name if it was supplied on the CLI.
                    answers.reportName = answers.reportName || options.report;

                    resolve(answers);
                });
            } else {
                resolve({reportName: options.report, reportDate: null});
            }
        });
    }

    /**
     * Default message if there are no time entries for a given report.
     */
    printEmptyReport() {
        console.log("There are no time entries in this report.".blue);
    }

    /**
     * Get the total duration worked from a set of timeular entries.
     *
     * @param {array[TimeularEntry]} timeularEntries
     * @returns {number}
     */
    sumTimeularEntries(timeularEntries) {
        let totalTime = 0;

        timeularEntries.forEach(entry => {
            totalTime += entry.getDuration();
        });

        return this.minsToProjHours(totalTime);
    }

    /**
     * Given a number of minutes, convert it to hours using the roundup set in the project config.
     *
     * @param {number} minutes
     * @returns {number}
     */
    minsToProjHours(minutes) {
        return Math.ceilX(minutes, this.config.roundProject) / 60;
    }
}

module.exports = Timeular2Noko;