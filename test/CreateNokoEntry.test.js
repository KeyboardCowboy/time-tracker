/**
 * Test Noko API
 */

const assert = require('assert');
const NokoApi = require('../lib/NokoApi');
const config = require('../config');

const date = new Date();

// Test data.
const entryPayload = {
    date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
    minutes: "30",
    projectId: "634324",
    description: "Item 1, #testTag"
};

describe('Fetch an entry', () => {
    it('Should return a Noko entry', () => {
        const Noko = new NokoApi(config.nokoToken);

        Noko.getEntry('29446572').then(entry => {
            console.log(entry);
        });
    });
});

/**
 * https://developer.nokotime.com/v2/entries/#create-an-entry
 */
describe('Create Noko Entry', () => {
    it('should create a new time entry against a test project', () => {
        const Noko = new NokoApi(config.nokoToken);
        const date = new Date();
        const timeEntry = Noko.newTimeEntry(date, 134, 637070, 'Test Alpha');

        Noko.addEntry(timeEntry).then(response => {
            console.log(response);
        })
    });
});
