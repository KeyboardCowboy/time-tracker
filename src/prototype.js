/**
 * Date utilities.
 */
Date.prototype.setDayStart = function(offset) {
    offset = offset || 0;

    let tmzh = this.getTimezoneOffset() / 60;

    this.setDate((this.getDate() + offset));
    this.setHours(tmzh, 0, 0, 0);
};

Date.prototype.setDayEnd = function(offset) {
    offset = offset || 0;

    let tmzh = this.getTimezoneOffset() / 60;

    this.setDate((this.getDate() + offset));
    this.setHours(23 + tmzh, 59, 59, 999);
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

Date.prototype.getMonthAbbrev = function() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];
    return months[this.getMonth()];
}

Date.prototype.getDowFull = function () {
    const dows = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return dows[this.getDay() - 1];
}

Date.prototype.getDayFull = function () {
    return this.getDate() + "-" + this.getMonthAbbrev() + "-" + this.getFullYear() + ", " + this.getDowFull();
}

Math.ceilX = function(x, y) {
    return Math.ceil(x / y) * y;
}

Array.prototype.timeSort = function() {
    this.sort((a, b) => a.date.getTime() - b.date.getTime());
}

Array.prototype.TimeularEntryTimeSort = function() {
    this.sort((a, b) => a.getDate().getTime() - b.getDate().getTime());
}