require('./src/prototype');
const program = require('commander');
const config = require('./config');
const utils = require('./src/utils');
const timeularApi = require('./lib/timeular');
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
    // Make sure we have a valid report name.
    if (!reports.hasOwnProperty(reportName)) {
        throw new Error('Invalid report selected.');
    }

    // Make sure the report has defined a processor.
    if (!reports[reportName].hasOwnProperty('process')) {
        throw new Error(`No processor was defined for the ${reports[reportName].label} report.`);
    }

    timeularApi.connect(config.timeularKey, config.timeularSecret).then(token => {
        // Run the report.
        reports[reportName].process(config, token).then(entries => {
            console.log("\n@todo: Ask to report the entries to Noko.");
        });
    }).catch(err => {
        console.error('❌️ ' + err.message);
    });
}).catch(err => {
    console.error('❌️ ' + err.message);
});