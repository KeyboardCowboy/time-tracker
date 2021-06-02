/**
 * Collection of general utility methods.
 */
require('./prototype');
const TimeularEntry = require('./timeularEntry');
const inquirer = require('inquirer');

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
            }
            else {
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
            entry.project = config.activityMap[value.activityId];
            entry.notes = te.getNotes();
            entry.activityName = value.activityName;
            entries.push(entry);
        });

        // Sort entries by date/time.
        entries.timeSort();

        // Summarize entry values.
        let groupings = {};
        entries.forEach(entry => {
            // If there are no notes on an entry, use the activity name.
            if (entry.notes.length === 0) entry.notes.push(entry.activityName);

            groupings[entry.day] = groupings[entry.day] || {};
            groupings[entry.day][entry.project] = groupings[entry.day][entry.project] || {};
            groupings[entry.day][entry.project].duration = (groupings[entry.day][entry.project].duration || 0) + entry.duration;
            groupings[entry.day][entry.project].tasks = groupings[entry.day][entry.project].tasks || [];
            groupings[entry.day][entry.project].tasks = groupings[entry.day][entry.project].tasks.concat(entry.notes);
        });

        // Generate printable report.
        for (let day in groupings) {
            console.log(day);

            // @todo: Improve sanitization
            // 1. Remove trailing commas and spaces
            // 2. Remove empty entries
            // 3. Remove duplicate entries
            for (let i in groupings[day]) {
                // Remove duplicate notes and tags.
                let uniqueTags = groupings[day][i].tasks.filter((val, index) => {
                    return (typeof val !== "undefined") &&
                        (val.trim() !== "") &&
                        (groupings[day][i].tasks.indexOf(val) === index);
                });

                // Ceilings each project to the next 15 minute increment.
                console.log("    " + i + ": " + Math.ceilX(groupings[day][i].duration, config.roundProject) / 60 + " hours");
                console.log("        " + uniqueTags.join(", ") + "\n");
            }
        }
    }
}