#!/usr/local/bin/node
"use strict";

const assert = require('assert');
require('../src/prototype');

describe('SetWeekStart', () => {
    it('should set the date to 12:00:00am of the previous Sunday', () => {
        const date = new Date();
        date.setWeekStart();
        assert.strictEqual(date.getDay(), 0, 'Day is not Sunday (0)');
        assert.strictEqual(date.getHours(), 0, 'Hour is not 0');
        assert.strictEqual(date.getMinutes(), 0, 'Minute is not 0');
        assert.strictEqual(date.getSeconds(), 0, 'Seconds is not 0');
    });

    it('should set the date to 11:59:59pm of the following Saturday', () => {
        const date = new Date();
        date.setWeekEnd();
        assert.strictEqual(date.getDay(), 6, 'Day is not Sunday (6)');
        assert.strictEqual(date.getHours(), 23, 'Hour is not 23');
        assert.strictEqual(date.getMinutes(), 59, 'Minute is not 59');
        assert.strictEqual(date.getSeconds(), 59, 'Seconds is not 59');
    });
});

