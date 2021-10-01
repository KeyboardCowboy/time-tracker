/**
 * Custom class to report Timeular time to Noko.
 */

const inquirer = require("inquirer");
const TimeularApi = require('../lib/TimeularApi');
const NokoApi = require('../lib/NokoApi');
const TimeularEntry = require("../lib/TimeularEntry");

/**
 * Instantiate a new project instance.
 *
 * @param config
 * @constructor
 */
function Timeular2Noko(config) {
    this.config = config;

    /**
     * The active Timeular activities for this account.
     * @type {*[]}
     */
    this._timeularActivities = [];

    /**
     * The Noko projects associated with the activities specified in the config.
     * @type {*[]}
     */
    this._nokoProjects = [];

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
     * Get an array of active Timeular activities.
     * @returns {Promise<unknown>}
     */
    this.getTimeularActivities = function () {
        return new Promise((resolve, reject) => {
            if (this._timeularActivities.length === 0) {
                this.timeularApi.getActivities().then(activities => {
                    this._timeularActivities = activities;
                    resolve(this._timeularActivities);
                }, err => {
                    reject(err);
                });
            } else {
                resolve(this._timeularActivities);
            }
        });
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
     * Print a report of the time entries for the dates selected to the console.
     *
     * @param {array[TimeularEntry]} rawEntries
     * @param config
     *
     * @todo: Set a message if there are no entries for the date.
     */
    this.printByDate = (rawEntries, config) => {
        // Create custom entry object with data that is easily sortable and printable.
        let customEntryObjects = [];
        rawEntries.forEach(value => {
            let customEntryObject = {
                duration: 0,
                date: 0,
                day: '',
                label: '',
                notes: '',
                project: '',
                activityName: ''
            };

            // Wrap the raw entry value to more easily extract data from it.
            let te = new TimeularEntry(value);
            customEntryObject.duration = Math.ceilX(te.getDuration(), config.roundEntry);
            customEntryObject.date = te.getDate();
            customEntryObject.day = te.getDay();
            customEntryObject.notes = te.getNotes();
            customEntryObject.activityName = value.activityName;

            // Used for grouping by Noko project.  Change this to the Noko project name once we start pulling that data.
            customEntryObject.project = config.activityMap[value.activityId].label;
            customEntryObject.billable = config.activityMap[value.activityId].billable;

            customEntryObjects.push(customEntryObject);
        });

        // Sort entries by date/time.
        customEntryObjects.timeSort();

        // Group by project.
        let groupByProject = {},
            groupByBillable = {false: 0, true: 0};

        customEntryObjects.forEach(entry => {
            // If there are no notes on an entry, use the activity name.
            if (entry.notes.length === 0) entry.notes.push(entry.activityName);

            groupByProject[entry.day] = groupByProject[entry.day] || {};
            groupByProject[entry.day].projects = groupByProject[entry.day].projects || {};
            groupByProject[entry.day].projects[entry.project] = groupByProject[entry.day].projects[entry.project] || {};
            groupByProject[entry.day].projects[entry.project].duration = (groupByProject[entry.day].projects[entry.project].duration || 0) + entry.duration;
            groupByProject[entry.day].projects[entry.project].tasks = groupByProject[entry.day].projects[entry.project].tasks || [];
            groupByProject[entry.day].projects[entry.project].tasks = groupByProject[entry.day].projects[entry.project].tasks.concat(entry.notes);

            // Log billable time by day.
            groupByProject[entry.day].billable = groupByProject[entry.day].billable || {};
            groupByProject[entry.day].billable[entry.billable] = (groupByProject[entry.day].billable[entry.billable] || 0) + entry.duration;

            // groupByBillable[entry.billable] = groupByBillable[entry.billable] || {};
            // Log billable time over the length of the report.
            groupByBillable[entry.billable] = groupByBillable[entry.billable] + entry.duration;
        });

        // Generate the project report by day.
        for (let day in groupByProject) {
            console.log(`\n${day}`.bold.red);

            // @todo: Improve sanitization
            // 1. Remove trailing commas and spaces
            // 2. Remove empty entries
            // 3. Remove duplicate entries
            for (let i in groupByProject[day].projects) {
                let project = i.blue;

                // Remove duplicate notes and tags.
                let uniqueTags = groupByProject[day].projects[i].tasks.filter((val, index) => {
                    return (typeof val !== "undefined") &&
                        (val.trim() !== "") &&
                        (groupByProject[day].projects[i].tasks.indexOf(val) === index);
                });

                // Ceilings each project to the next 15 minute increment.
                console.log(`    ` + Math.ceilX(groupByProject[day].projects[i].duration, config.roundProject) / 60 + ` hours \t ${project} | ${uniqueTags.join(", ")}`);
            }

            const billableByDay = Math.ceilX(groupByProject[day].billable.true, config.roundProject) / 60;
            const nonBillableByDay = Math.ceilX(groupByProject[day].billable.false, config.roundProject) / 60;
            const totalByDay = billableByDay + nonBillableByDay;

            console.log(`\n    Billable:\t\t${billableByDay} hours`);
            console.log(`    Not Billable:\t${nonBillableByDay} hours`);
            console.log(`    Total:\t\t${totalByDay} hours`.bold);
        }

        // Generate the billable report.
        const billableTotal = Math.ceilX(groupByBillable[true], config.roundProject) / 60;
        const nonBillableTotal = Math.ceilX(groupByBillable[false], config.roundProject) / 60;
        const total = billableTotal + nonBillableTotal;

        console.log("\nReport Summary:".bold.yellow);
        console.log(`    Billable:\t\t${billableTotal} hours`);
        console.log(`    Not Billable:\t${nonBillableTotal} hours`);
        console.log(`    Total:\t\t${total} hours`.bold);
    }
}

module.exports = Timeular2Noko;