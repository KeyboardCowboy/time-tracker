#!/usr/local/bin/node

/**
 * Defines class NokoProject.
 */
class NokoProject {
    /**
     * The project object from the API.
     * @type {{}}
     */
    project = {};

    /**
     * Constructor
     */
    constructor(project) {
        this.project = project;
    }

    getId = () => this.project.id;
    getName = () => this.project.name;
    isBillable = () => this.project.billable;
    isValid = () => this.project.id !== 0;
}

module.exports = NokoProject;