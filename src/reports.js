/**
 * Define the various reports that can be run.
 */
module.exports = {
    /**
     * Define the report to print today's hours.
     */
    today: {
        label: "Today's Hours",
        load: async (T2N) => {
            const date1 = new Date();
            date1.setDayStart();

            const date2 = new Date();
            date2.setDayEnd();

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                const entryDate = timeularEntries[0].getDate();
                const projGroup = T2N.groupTimeularEntriesByProject(timeularEntries);

                // @todo: Sort by project id to keep reports consistently formatted.

                // Print the day's summary.
                await T2N.printDaySummary(entryDate, projGroup);
            }
        }
    },
    /**
     * Define the report to print yesterday's hours.
     */
    yesterday: {
        label: "Yesterday's Hours",
        load: async (T2N) => {
            const date1 = new Date();
            date1.setDayStart(-1);

            const date2 = new Date();
            date2.setDayEnd(-1);

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                const entryDate = timeularEntries[0].getDate();
                const projGroup = T2N.groupTimeularEntriesByProject(timeularEntries);

                // @todo: Sort by project id to keep reports consistently formatted.

                // Print the day's summary.
                await T2N.printDaySummary(entryDate, projGroup);
            }
        },
    },
    /**
     * Report all of this week's hours by day.
     */
    thisWeek: {
        label: "This Week's Hours",
        load: async (T2N) => {
            let date1 = new Date();
            date1.setWeekStart();

            let date2 = new Date();
            date2.setWeekEnd();

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                await T2N.printMultiDaySummary(timeularEntries);
            }
        }
    },
    /**
     * Define the report to list all hours recorded last week by day.
     */
    lastWeek: {
        label: "Last Week's Hours",
        load: async (T2N) => {
            let date1 = new Date();
            date1.setWeekStart(-1);

            let date2 = new Date();
            date2.setWeekEnd(-1);

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                await T2N.printMultiDaySummary(timeularEntries);
            }
        }
    },
    /**
     * Retrieve all hours for a specific day.
     */
    customDate: {
        label: "Specific Day",
        load: async (T2N, dateString) => {
            // Validate the date string.
            const regex = /\d{4}-\d{1,2}-\d{1,2}/gm;
            if (!dateString.match(regex)) {
                throw new Error('Invalid date string for custom report.');
            }

            let date1 = new Date(dateString);
            date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset());
            date1.setDayStart();

            let date2 = new Date(dateString);
            date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset());
            date2.setDayEnd();

            return await T2N.timeularApi.getTimeEntries(date1, date2);
        },
        print: async (T2N, timeularEntries) => {
            if (timeularEntries.length === 0) {
                T2N.printEmptyReport();
            } else {
                const entryDate = timeularEntries[0].getDate();
                const projGroup = T2N.groupTimeularEntriesByProject(timeularEntries);

                // @todo: Sort by project id to keep reports consistently formatted.

                // Print the day's summary.
                await T2N.printDaySummary(entryDate, projGroup);
            }
        },
        reportDate: null
    },
    /**
     * List all your defined Timeular activities.
     */
    activities: {
        label: "Timeular Activities",
        load: async (T2N) => {
            return await T2N.timeularApi.getActivities();
        },
        print: (T2N, activities) => {
            activities.forEach(activity => {
                console.log(activity.getId() + ': ' + activity.getName());
            });
        }
    },
};