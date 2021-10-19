#!/usr/local/bin/node

/**
 * Class to manage Timeular time entry objects.
 */
class TimeularEntry {
    /**
     * The Timeular time entry object from the API.
     */
    timeularObject = {};

    /**
     * The activity the entry was logged to.
     */
    activity = {};

    /**
     * Constructor.
     * @param entry
     */
    constructor(entry) {
        this.timeularObject = entry;
        this.activity = null;
    }

    getDuration() {
        let timeStart = new Date(this.timeularObject.duration.startedAt + 'z');
        let timeEnd = new Date(this.timeularObject.duration.stoppedAt + 'z');
        return parseInt((timeEnd.valueOf() - timeStart.valueOf()) / (60 * 1000));
    }

    getDate() {
        return new Date(this.timeularObject.duration.stoppedAt + 'z');
    }

    getDay() {
        const date = this.getDate();
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }

    getNotes() {
        let notes = [];

        // Get tags.
        this.timeularObject.note.tags.forEach(value => {
            notes.push("#" + value.label);
        });

        // Get text.
        const text = this.timeularObject.note.text || "";
        const tagPattern = /(<{{\|t\|\d{0,}\|}}>)*/gi;
        let tagless = text.replace(tagPattern, "");
        if (tagless.length > 0) {
            notes.push(tagless);
        }

        // Get mentions.
        // @todo: Does this have any benefit outside of timeular?  If not, ignore it.

        return notes;
    };

    /**
     * Get the activity associated with this entry.
     * @param TimeularApi
     * @returns {TimeularActivity}
     */
    getActivity(TimeularApi) {
        return this.activity;
    }
}

module.exports = TimeularEntry;