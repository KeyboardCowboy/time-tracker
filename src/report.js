const TimeularEntry = require('./timeularEntry');

module.exports = {
    printByDate: (timeularEntries, config) => {
        let entries = [];
        timeularEntries.forEach(value => {
            let entry = {
                duration: 0,
                date: 0,
                day: '',
                label: '',
                notes: '',
                project: ''
            };

            let te = new TimeularEntry(value);

            entry.duration = Math.ceilX(te.getDuration(), config.roundUp);
            entry.date = te.getDate();
            entry.day = te.getDay();
            entry.project = config.activityMap[value.activityId];
            entry.notes = te.getNotes();
            entries.push(entry);
        });

        // Sort entries by date/time.
        entries.timeSort();

        // Summarize entry values.
        let groupings = {};
        entries.forEach(entry => {
            groupings[entry.day] = groupings[entry.day] || {};
            groupings[entry.day][entry.project] = groupings[entry.day][entry.project] || {};
            groupings[entry.day][entry.project].duration = (groupings[entry.day][entry.project].duration || 0) + entry.duration;
            groupings[entry.day][entry.project].tasks = groupings[entry.day][entry.project].tasks || [];
            groupings[entry.day][entry.project].tasks = groupings[entry.day][entry.project].tasks.concat(entry.notes);
        });

        // Generate printable report.
        for (let day in groupings) {
            console.log(day);

            for (let i in groupings[day]) {
                // Ceilings each project to the next 15 minute increment.
                console.log("    " + i + ": " + Math.ceilX(groupings[day][i].duration, 15) / 60 + " hours");
                console.log("        " + groupings[day][i].tasks.join(", ") + "\n");
            }
        }
    }
}