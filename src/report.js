#!/usr/local/bin/node

/**
 * Defines class Report.
 */
class Report {
    label = '';
    entries = [];

    /**
     * Constructor
     */
    constructor(data) {
        this.label = data.label;
        this.load = data.load;
        this.print = data.print;
    }

    async load() {}

    async print() {}
}

module.exports = Report;