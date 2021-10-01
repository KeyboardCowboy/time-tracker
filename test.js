require('./src/prototype');
const program = require('commander');
const Timeular2Noko = require('./src/Timeular2Noko');
const config = require('./config');
const utils = require('./src/utils');
const reports = require('./src/reports');

// Grab any user provided variables.
program
    .option("-r, --report <string>", 'The report to run.')
    .option("-m, --roundUp <minutes>", "Round each time entry up by this increment.  Defaults to 5 minutes.")
    .option("-d, --debug", "Show more details if the program errors out.")
    .parse(process.argv);
const options = program.opts();

// Default time entry rounding up to 5 minute increments.
config.roundEntry = options.roundUp || 5;

const T2N = new Timeular2Noko(config);

// Instantiate the APIs.
T2N.init().then(response => {
    T2N.getReport(options, reports)
        // Validate the chosen report.
        .then(reportName => {
            // Make sure we have a valid report name.
            if (!reports.hasOwnProperty(reportName)) {
                throw new Error(`${reportName} is not a valid report name.`);
            }

            // Make sure the report has defined a processor.
            if (!reports[reportName].hasOwnProperty('load')) {
                throw new Error(`No processor was defined for the ${reports[reportName].label} report.`);
            }

            return reports[reportName];
        })
        // Print the report to the console.
        .then(report => {
            report.load(T2N).then(entries => {
                report.printReport(T2N, entries);
                return entries;
            }, err => {
                throw err;
            });
        })
        // Ask to log entries to Noko.
        .then(entries => {

        }, err => {
            throw err;
        });
}).catch(err => {
    console.error('❌️ ' + err.message);

    if (options.debug) {
        console.error(err);
    }
});