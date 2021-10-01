/**
 * Class to manage Timeular Activities.
 */
function TimeularActivity(activity) {
    /**
     * The activity object returned from the API.
     */
    this.activity = activity;

    /**
     * Get the name of the activity.
     * @returns {string}
     */
    this.getName = () => {
        return this.activity.name;
    }

    /**
     * Get the Activity ID number.
     * @returns {string}
     */
    this.getId = () => {
        return this.activity.id;
    }
}

module.exports = TimeularActivity;