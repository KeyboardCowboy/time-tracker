# Timeular to Noko
Report time logged to Timeular to Noko.

## What is Timeular?
https://timeular.com/

Timeular is a personal time tracking service that uses a physical octohedral device to easily switch tasks.  When turned on its side, it logs the time spent face up to that task, allowing for time to be tracked against 8 preset tasks.  More tasks can be configured and activated using the app.

## What is Noko?
https://nokotime.com/

Noko is a business time tracking utility organized by project and used to track billable and non-billable time against a variety of projects for an organization.

## What does this tool do?
If you log your time using Timeular, you can map the Timeular activities to Noko projects and automatically report that time to Noko.

## Getting Started
1. To begin, you will need to have at least one Timeular activity defined and optionally mapped to your otcohedron.  You will also need to have at least one Noko project defined.
2. Install this package.
    ```shell
    $ git clone git@github.com:KeyboardCowboy/time-tracker.git timeular2noko
    $ cd timeular2noko
    $ npm install
    ```
3. Next, copy `example.config.js` to `config.js`.
4. Obtain your [Timeular API Key and Secret](https://profile.timeular.com/#/settings/account) and copy them to the `config.js`.
5. Obtain your [Noko Personal Access Token](https://lullabot.nokotime.com/time/integrations/freckle_api) and copy it to `config.js`.
6. Finally, you'll need to map each Timeular activity to a Noko project.  That is to say, when you are tracking time to a Timeular activity, which Noko project should that time be billed to?  To do this, follow the steps in the next section.

## Mapping Activities to Projects
Once you have your authorization credentials in place, you can run your first Timeular report: getting a list of Activities and their IDs.  You can do this two ways: by prompt, or by command line parameter.
```shell
$ node index.js

? What report would you like to run?
  Today's Hours
  Yesterday's Hours
  This Week's Hours
  Last Week's Hours
  Specific Day
❯ Timeular Activities
```
OR, specify the report from the command line:
```shell
$ node index.js -r activities
```

The results should look similar to this:
```shell
749219: My First Activity
749226: Personal Time
749221: Administration
749223: Development
749224: Meeting
749277: One-on-One
1126049: Training
749220: Reading/Education
```

Add these IDs to the `activityProjectMap` section in `config.js`.  In Noko, open a project and extract its ID from the URL and map it to any activities that should bill to this project.
```shell
https://lullabot.nokotime.com/time/projects/613456  // ID is 613456
```

Now, you should have a section in `config.js` like this:
```json
    'activityProjectMap': {
        1126049: 613456,
        749224: 613456,
        749226: 17045,
        749223: 613456,
        749221: 17045,
        749220: 613456,
        749219: 613456,
        749277: 17045
    }
```

## Running Your First Report
At this point, you should be able to run a report on any day or timespan using the prompt.
```shell
$ node index.js

? What report would you like to run?
❯  Today's Hours
   Yesterday's Hours
   This Week's Hours
   Last Week's Hours
   Specific Day
   Timeular Activities
```
And get a report like this:

```shell
21-Oct-2021, Thursday
    1 hours 	 Internal | Administration, #WeeklyRoundupMeeting
    6.5 hours 	 My Big Project (1234) | #Standup, Ticket Gardening, #ClientMeeting, Jira Setup

    Billable:		6.5 hours
    Not Billable:	1 hours
    Total:		    7.5 hours

? Submit the report to Noko? (Y/n)
```
After which you will be prompted to report your time to Noko.  Enter 'y' to do it!

```shell
? Submit the report to Noko? Yes

2021-10-21: Logged 1 hours to Internal for Han Solo
2021-10-21: Logged 6.5 hours to My Big Project (1234) for Han Solo
```