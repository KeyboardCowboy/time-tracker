/**
 * Test Timeular API
 */

const assert = require('assert');
const TimeularApi = require('../lib/TimeularApi');
const config = require('../config');

const Timeular = new TimeularApi();

describe('Connect to Developer API', () => {
    it('Should retrieve an API token', () => {
        Timeular.connect(config.timeularKey, config.timeularSecret).then(token => {
            assert(Timeular.apiToken.length > 0, "Token length is 0.");
        });
    });

    it('Should return Timeular activities', () => {
        Timeular.connect(config.timeularKey, config.timeularSecret).then(token => {
            Timeular.getActivities().then(activities => {
                assert(typeof activities?.activities === 'array', "Invalid data structure returned.");
            });
        });
    });
});
