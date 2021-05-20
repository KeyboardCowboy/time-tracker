require('./utils');
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
                project: '',
                activityName: ''
            };

            let te = new TimeularEntry(value);

            entry.duration = Math.ceilX(te.getDuration(), config.roundUp);
            entry.date = te.getDate();
            entry.day = te.getDay();
            entry.project = config.activityMap[value.activityId];
            entry.notes = te.getNotes();
            entry.activityName = value.activityName;
            entries.push(entry);
        });

        // Sort entries by date/time.
        entries.timeSort();

        // Summarize entry values.
        let groupings = {};
        entries.forEach(entry => {
            // If there are no notes on an entry, use the activity name.
            if (entry.notes.length === 0) entry.notes.push(entry.activityName);

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
                // Remove duplicate notes and tags.
                let uniqueTags = groupings[day][i].tasks.filter((val, index) => {
                    return (val.trim() !== "") && (groupings[day][i].tasks.indexOf(val) === index);
                });

                // Ceilings each project to the next 15 minute increment.
                console.log("    " + i + ": " + Math.ceilX(groupings[day][i].duration, 15) / 60 + " hours");
                console.log("        " + uniqueTags.join(", ") + "\n");
            }
        }
    }
}