module.exports = {
    /**
     * Get a list of Timeular Time Entries with the Activity Name included, not just the ID.
     *
     * @param tApi
     * @param token
     * @param date1
     * @param date2
     * @returns {Promise<unknown>}
     */
    getTimeEntries: (tApi, token, date1, date2) => {
        return new Promise((resolve, reject) => {
            const promises = [];
            promises.push(tApi.getActivities(token));
            promises.push(tApi.getTimeEntries(token, date1, date2));

            resolve(Promise.all(promises));
        }).then(response => {
            const activities = {};
            const entries = [];

            // Create a simple referencable object for activities to their IDs.
            response[0].activities.forEach(activity => {
                activities[activity.id] = activity.name.replace(/\ /g, "-");
            });

            // Add activity name to entries.
            response[1].timeEntries.forEach(entry => {
                entry.activityName = activities[entry.activityId];
                entries.push(entry);
            });

            return entries;
        });
    }
}