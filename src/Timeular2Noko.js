/**
 * Custom class to report Timeular time to Noko.
 */

const inquirer = require("inquirer");
const TimeularApi = require('../lib/TimeularApi');
const NokoApi = require('../lib/NokoApi');
const TimeularEntry = require("../lib/src/TimeularEntry");
const colors = require('colors');

/**
 * Instantiate a new project instance.
 *
 * @param config
 * @constructor
 */
function Timeular2Noko(config) {
    this.config = config;

    /**
     * A connection to the Timeular API for this account.
     * @type {TimeularApi}
     */
    this.timeularApi = null;

    /**
     * A connection to the Noko API for this account.
     * @type {NokoApi}
     */
    this.nokoApi = null;

    /**
     * Initialize the project instance by connecting to the two required APIs.
     * @returns {Promise<unknown>}
     */
    this.init = function () {
        // Connect to Timeular.
        const p1 = new Promise((resolve, reject) => {
            this.timeularApi = new TimeularApi();
            this.timeularApi.connect(config.timeularKey, config.timeularSecret).then(response => {
                resolve(this.timeularApi);
            }, err => {
                err.message = "Unable to authenticate to the Timeular API.";
                reject(err);
            });
        });

        // Connect to Noko.
        const p2 = new Promise((resolve, reject) => {
            this.nokoApi = new NokoApi(config.nokoToken);
            resolve(this.nokoApi);
        });

        // Evaluate connections.
        return Promise.all([p1, p2]);
    }

    /**
     * Get the  name of the report to run.  If not supplied, give users a choice.
     *
     * @param options
     * @param reports
     * @returns {Promise<unknown>}
     */
    this.getReport = function (options, reports) {
        return new Promise((resolve, reject) => {
            // Get a list of report names from the processor.
            let reportNames = [];
            for (let i in reports) {
                reportNames.push({name: reports[i].label, value: i});
            }

            // If a report wasn't specified as an option, ask the user for it.
            if (!options.hasOwnProperty('report')) {
                const reportQuestion = {
                    type: 'list',
                    name: 'reportName',
                    message: "What report would you like to run?",
                    choices: reportNames
                }

                inquirer.prompt([reportQuestion]).then(answer => {
                    resolve(answer.reportName);
                });
            } else {
                resolve(options.report);
            }
        });
    }

    /**
     * Default message if there are no time entries for a given report.
     */
    this.printEmptyReport = () => {
        console.log("There are no time entries in this report.".blue);
    }

    /**
     * Print a report of the time entries for the dates selected to the console.
     *
     * @param date
     * @param {array} groupedByProject
     */
    this.printDaySummary = async (date, groupedByProject) => {
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
            const projTasks = await this.getTasksFromTimeularEntries(groupedByProject[projId]);

            // Print the project summary.
            console.log(`    ${projHours} hours \t ${project.getName().blue} | ${projTasks.join(", ")}`);

            // Log billable and non-billable time.
            if (project.isBillable()) {
                billableHours += projHours;
            }
            else {
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
    this.groupTimeularEntriesByDate = (timeularEntries) => {
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
    this.groupTimeularEntriesByProject = (timeularEntries) => {
        const grouped = {};

        timeularEntries.forEach(async entry => {
            const activity = await entry.getActivity(this.timeularApi);
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
     * Get the total duration worked from a set of timeular entries.
     *
     * @param {array[TimeularEntry]} timeularEntries
     * @returns {number}
     */
    this.sumTimeularEntries = function (timeularEntries) {
        let totalTime = 0;

        timeularEntries.forEach(entry => {
            totalTime += entry.getDuration();
        });

        return this.minsToProjHours(totalTime);
    }

    /**
     * Get an array of tags and notes from each entry.
     *
     * @param timeularEntries
     * @returns {*[]}
     */
    this.getTasksFromTimeularEntries = function (timeularEntries) {
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
     * Given a number of minutes, convert it to hours using the roundup set in the project config.
     *
     * @param {number} minutes
     * @returns {number}
     */
    this.minsToProjHours = function (minutes) {
        return Math.ceilX(minutes, this.config.roundProject) / 60;
    }
}

module.exports = Timeular2Noko;