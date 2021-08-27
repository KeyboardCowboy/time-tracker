const assert = require('assert');

describe('Table Render Test', () => {
    it('Should print a table', () => {
        console.table({t1: 'val1', t2: 'val2'});
    });
});
