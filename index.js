require('./src/dateUtil');
const program = require('commander');
const config = require('./config');
const timeularApi = require('./src/timeular');

program
    .option("-r, --report <string>", 'The report to run.')
    .parse(process.argv);
const options = program.opts();

// Get a listing of all Timeular activities for the account.
if (options.report === "activities") {
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        timeularApi.getActivities(token).then(response => {
            console.log(response);
        });
    }).catch(err => {
        console.error(err);
    });
}
// Run a report for this week's data.
else if (options.report === "thisweek")
{
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        let date1 = new Date();
        date1.setWeekStart();

        let date2 = new Date();
        date2.setWeekEnd();

        timeularApi.getTimeEntries(token, date1, date2).then(response => {
            console.log(response);
        });
    }).catch(err => {
        console.error(err);
    });
}
else {
    console.log('No report selected.');
}