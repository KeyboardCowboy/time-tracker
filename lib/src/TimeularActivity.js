#!/usr/local/bin/node

/**
 * Class to manage Timeular activity objects.
 */
class TimeularActivity {
    /**
     * The object returned from Timeular.
     * @type {{}}
     */
    timeularObject = {};

    /**
     * Class to manage Timeular Activities.
     */
    constructor(activity) {
        /**
         * The activity object returned from the API.
         */
        this.timeularObject = activity;

        /**
         * Get the name of the activity.
         * @returns {string}
         */
        this.getName = () => {
            return this.timeularObject.name;
        }

        /**
         * Get the Activity ID number.
         * @returns {string}
         */
        this.getId = () => {
            return this.timeularObject.id;
        }
    }
}

module.exports = TimeularActivity;