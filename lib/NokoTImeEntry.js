/**
 * Define a NokoTimeEntry object.
 *
 * @param date
 * @param minutes
 * @param project
 * @param description
 * @constructor
 */
function NokoTimeEntry(date, minutes, project, description) {
    // Required properties.
    this.date = date || new Date();
    this.minutes = minutes || 0;
    this.project_id = project || 0;
    this.description = description || '';

    // Optional properties.
    this.user_id = null;
    this.project_name = null;
    this.source_url = null;

    /**
     * Generate a properly formatted JSON object for a time entry.
     *
     * @returns {{date: string, project_id: NokoTimeEntry.project_id, minutes: NokoTimeEntry.minutes, description: NokoTimeEntry.description}}
     */
    this.getPayloadData = function() {
        return {
            "date": `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
            "minutes": this.minutes,
            "project_id": this.project_id,
            "description": this.description
        };
    }
}

module.exports = NokoTimeEntry;
