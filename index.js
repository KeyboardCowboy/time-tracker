require('./src/prototype');
const program = require('commander');
const inquirer = require('inquirer');
const TimeularApi = require('./lib/TimeularApi');
const NokoApi = require('./lib/NokoApi');
const config = require('./config');
const utils = require('./src/utils');
const reports = require('./src/reports');

// Grab any user provided variables.
program
    .option("-r, --report <string>", 'The report to run.')
    .option("-m, --roundUp <minutes>", "Round each time entry up by this increment.  Defaults to 5 minutes.")
    .parse(process.argv);
const options = program.opts();

// Default time entry rounding up to 5 minute increments.
config.roundEntry = options.roundUp || 5;

utils.getReport(options, reports).then(reportName => {
    const Timeular = new TimeularApi();
    const Noko = new NokoApi(config.nokoToken);

    // Make sure we have a valid report name.
    if (!reports.hasOwnProperty(reportName)) {
        throw new Error(`${reportName} is not a valid report name.`);
    }

    // Make sure the report has defined a processor.
    if (!reports[reportName].hasOwnProperty('getEntries')) {
        throw new Error(`No processor was defined for the ${reports[reportName].label} report.`);
    }

    Timeular.connect(config.timeularKey, config.timeularSecret).then(token => {
        // Grab the Timeular entries for the report.
        reports[reportName].getEntries(Timeular, Noko).then(entries => {
            // Print the time report from Timeular with proper formatting.
            utils.printByDate(entries, config);
            return entries;
        }).then(entries => {
            // Ask about submitting the Timeular time to Noko.
            console.log("\n@todo: Ask to report the entries to Noko.");
        });
    }).catch(err => {
        console.error('❌️ ' + err.message);
    });
}).catch(err => {
    console.error('❌️ ' + err.message);
});