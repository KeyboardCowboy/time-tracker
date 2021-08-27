/**
 * Collection of general utility methods.
 */
require('./prototype');
const TimeularEntry = require('./timeularEntry');
const inquirer = require('inquirer');
const colors = require('colors');

module.exports = {
    /**
     * Get the  name of the report to run.  If not supplied, give users a choice.
     *
     * @param options
     * @param reports
     * @returns {Promise<unknown>}
     */
    getReport: (options, reports) => {
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
    },

    /**
     * Print a report of the time entries for the dates selected to the console.
     *
     * @param timeularEntries
     * @param config
     *
     * @todo: Set a message if there are no entries for the date.
     */
    printByDate: (timeularEntries, config) => {
        let entries = [];
        timeularEntries.forEach(value => {
            let entry = {
                duration: 0,
                date: 0,
                day: '',
                label: '',
                notes: '',
                project: '',
                activityName: ''
            };

            let te = new TimeularEntry(value);

            entry.duration = Math.ceilX(te.getDuration(), config.roundEntry);
            entry.date = te.getDate();
            entry.day = te.getDay();
            entry.notes = te.getNotes();
            entry.activityName = value.activityName;

            // Used for grouping by Noko project.  Change this to the Noko project name once we start pulling that data.
            entry.project = config.activityMap[value.activityId].label;
            entry.billable = config.activityMap[value.activityId].billable;

            entries.push(entry);
        });

        // Sort entries by date/time.
        entries.timeSort();

        // Group by project.
        // @todo: Add total time.
        let groupByProject = {},
            groupByBillable = {false: 0, true: 0};
        entries.forEach(entry => {
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
            console.log(`\n${day}`);

            // @todo: Improve sanitization
            // 1. Remove trailing commas and spaces
            // 2. Remove empty entries
            // 3. Remove duplicate entries
            for (let i in groupByProject[day].projects) {
                // Remove duplicate notes and tags.
                let uniqueTags = groupByProject[day].projects[i].tasks.filter((val, index) => {
                    return (typeof val !== "undefined") &&
                        (val.trim() !== "") &&
                        (groupByProject[day].projects[i].tasks.indexOf(val) === index);
                });

                // Ceilings each project to the next 15 minute increment.
                console.log(`    ` + Math.ceilX(groupByProject[day].projects[i].duration, config.roundProject) / 60 + ` hours \t ${i} | ${uniqueTags.join(", ")}`);
                // console.log("        " + uniqueTags.join(", ") + "\n");
            }

            const billableByDay = Math.ceilX(groupByProject[day].billable.true, config.roundProject) / 60;
            const nonBillableByDay = Math.ceilX(groupByProject[day].billable.false, config.roundProject) / 60;
            const totalByDay = billableByDay + nonBillableByDay;

            console.log(`\n    Billable:\t\t${billableByDay} hours`);
            console.log(`    Not Billable:\t${nonBillableByDay} hours`);
            console.log(`    Total:\t\t${totalByDay} hours`);
        }

        // Generate the billable report.
        const billableTotal = Math.ceilX(groupByBillable[true], config.roundProject) / 60;
        const nonBillableTotal = Math.ceilX(groupByBillable[false], config.roundProject) / 60;
        const total = billableTotal + nonBillableTotal;

        console.log("\nReport Summary:");
        console.log(`    Billable:\t\t${billableTotal} hours`);
        console.log(`    Not Billable:\t${nonBillableTotal} hours`);
        console.log(`    Total:\t\t${total} hours`);
    }
}