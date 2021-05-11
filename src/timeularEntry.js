function TimeularEntry() {
    this.entry = {};

    this.setEntry = (entry) => {
        this.entry = entry;
    };

    this.getDuration = () => {
        let timeStart = new Date(this.entry.duration.startedAt + 'z');
        let timeEnd = new Date(this.entry.duration.stoppedAt + 'z');
        return parseInt((timeEnd.valueOf() - timeStart.valueOf()) / (60 * 1000));
    };

    this.getDate = () => {
        return new Date(this.entry.duration.stoppedAt + 'z');
    };

    this.getNotes = () => {
        let notes = [];

        // Get tags.
        this.entry.note.tags.forEach(value => {
            notes.push("#" + value.label);
        });

        // Get text.
        const text = this.entry.note.text || "";
        const tagPattern = /(<{{\|t\|\d{0,}\|}}>)*/gi;
        let tagless = text.replace(tagPattern, "");
        if (tagless.length > 0) {
            notes.push(tagless);
        }
        
        // Get mentions.
        // @todo: Does this have any benefit outside of timeular?  If not, ignore it.

        return notes;
    };
}

module.exports = TimeularEntry;