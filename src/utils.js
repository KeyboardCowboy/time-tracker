/**
 * Collection of general utility methods.
 */
const inquirer = require('inquirer');

module.exports = {
    /**
     * Get the  name of the report to run.  If not supplied, give users a choice.
     *
     * @param options
     * @param reports
     * @param defaultReport
     * @returns {Promise<unknown>}
     */
    getReport: (options, reports, defaultReport) => {
        return new Promise((resolve, reject) => {
            if (!options.hasOwnProperty('report')) {
                const reportQuestion = {
                    type: 'list',
                    name: 'reportName',
                    message: "What report would you like to run?",
                    choices: reports,
                    default: defaultReport || 'Today'
                }

                inquirer.prompt([reportQuestion]).then(answer => {
                    resolve(answer.reportName);
                });
            }
            else {
                resolve(options.report);
            }
        });
    }
}