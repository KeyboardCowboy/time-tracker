/**
 * Date utilities.
 */
Date.prototype.setTodayStart = function(offset) {
    offset = offset || 0;

    this.setDate((this.getDate() + offset));
    this.setHours(0, 0, 0, 0);
};

Date.prototype.setTodayEnd = function(offset) {
    offset = offset || 0;

    this.setDate((this.getDate() + offset));
    this.setHours(23, 59, 59, 999);
};

Date.prototype.setWeekStart = function(offset) {
    offset = offset || 0;

    let weekOffset = 7 * offset;
    let dow = this.getDay();
    this.setDate((this.getDate() + weekOffset) - dow);
    this.setHours(0, 0, 0, 0);
};

Date.prototype.setWeekEnd = function(offset) {
    offset = offset || 0;

    let weekOffset = 7 * offset;
    let dow = 6 - this.getDay();
    this.setDate(this.getDate() + dow + weekOffset);
    this.setHours(23, 59, 59, 999);
};

Date.prototype.getTimeularTime = function() {
    // Adjust timezone offset for GMT.
    this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return this.toISOString().slice(0, -1);
}

Math.ceilX = function(x, y) {
    return Math.ceil(x / y) * y;
}

Math.dround = function(x, y) {
    let scalar = 10 ^ y;
    return Math.round(x * scalar) / scalar;
}