require('./src/dateUtil');
const config = require('./config');
const timeularApi = require('./src/timeular');

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
