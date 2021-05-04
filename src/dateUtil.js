/**
 * Date utilities.
 */
Date.prototype.setWeekStart = function() {
    let dow = this.getDay();
    this.setDate(this.getDate() - dow);
    this.setHours(0, 0, 0, 0);
};

Date.prototype.setWeekEnd = function() {
    let dow = 6 - this.getDay();
    this.setDate(this.getDate() + dow);
    this.setHours(23, 59, 59, 999);
};

Date.prototype.getTimeularTime = function() {
    // Adjust timezone offset for GMT.
    this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return this.toISOString().slice(0, -1);
}
