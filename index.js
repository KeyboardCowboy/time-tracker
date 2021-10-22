require('./src/prototype');
const program = require('commander');
const inquirer = require('inquirer');
const Timeular2Noko = require('./src/Timeular2Noko');
const config = require('./config');
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
T2N.init(options).then(response => {
    T2N.getReport(options, reports)

        // Validate the chosen report.
        .then(answers => {
            const reportName = answers.reportName;

            // Append the date from the prompt to the report that requested it.
            if (answers.reportDate !== null) {
                reports[reportName].reportDate = answers.reportDate;
            }

            // Make sure we have a valid report name.
            if (!reports.hasOwnProperty(reportName)) {
                throw new Error(`${reportName} is not a valid report name.`);
            }

            // Make sure the report has defined a processor.
            if (!reports[reportName].hasOwnProperty('load')) {
                throw new Error(`No loading function was defined for the ${reports[reportName].label} report.`);
            }

            return reports[reportName];
        })

        // Load the report entries.
        .then(async report => {
            const entries = report.hasOwnProperty('reportDate') ? await report.load(T2N, report.reportDate) : await report.load(T2N);
            return [report, entries];
        })

        // Print the report.
        .then(async response => {
            await response[0].print(T2N, response[1]);
            return response;
        })

        // Send to Noko.
        .then(response => {
            // If there are no entries to send to Noko, don't ask.
            if (response[0]?.sendToNoko === false || response[1].length === 0) {
                process.exit(0);
            }

            // Confirm sending Noko entries.
            console.log('');
            inquirer.prompt([{
                'type': 'confirm',
                'name': 'sendToNoko',
                'message': "Submit the report to Noko?"
            }]).then(answers => {
                if (answers.sendToNoko) {
                    T2N.submitEntriesToNoko(entries);
                } else {
                    console.log("Bye!");
                }
            }).catch(err => {
                throw err;
            });
        })

        // Round up any errors.
        .catch(err => {
            console.error('❌️ ' + err.message);

            if (options.debug) {
                console.error(err);
            }
        });
}).catch(err => {
    console.error('❌️ ' + err.message);

    if (options.debug) {
        console.error(err);
    }
});