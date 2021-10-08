/**
 * Date object extensions.
 */

/**
 * Format a time string to match Timeular's specs.
 *
 * @returns {string}
 */
Date.prototype.getTimeularTime = function() {
    // Adjust timezone offset for GMT.
    this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return this.toISOString().slice(0, -1);
}

Array.prototype.timeularEntryTimeSort = function() {
    this.sort((a, b) => a.getDate().getTime() - b.getDate().getTime());
}