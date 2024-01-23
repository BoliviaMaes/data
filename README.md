# airtable-github-json-export

> Export airtable tables to json in Github

It will export one or more tables in [Airtable](https://airtable.com/) to a JSON
file on Github. The exported file will be of the format:

```
{
  <table_name>: [
    {
      airtableId: <id>,
      ... // all fields of the table record
    }
  ]
}
```

This repository is heavily inspired by
https://github.com/digidem/airtable-github-export.

## Configuration

The script depends on several environment variables which you can set a `.env`
file if you run this locally:

```
TABLES=Table 1,Table 2
GITHUB_TOKEN=xxxxxx
GITHUB_REPO=github_repo_name
GITHUB_OWNER=github_repo_owner_name
AIRTABLE_PERSONAL_TOKEN=xxxxxx
AIRTABLE_BASE_ID=airtable_base_id
GITHUB_FILENAME=filename_for_github_export
```

**Important**: you have to provide the list of tables, since Airtable doesn't
give access to it through its API. There are
[some ways](https://github.com/cape-io/airtable-schema) to fetch it, but these
methods might break at any moment, and we preferred not to rely on them.

To fill all these variables:

- GitHub token: go to https://github.com/settings/tokens/new, and select the
  <code>repo</code> scope
- Airtable Personal Token: go to https://airtable.com/create/tokens
- Airtable base id: go to https://airtable.com/api, click on your database, and
  search for "The ID of this base is appFyez....x9V."

## Run

Run the export with `node airtable-export.js`

## Heroku

You can run this as a scheduled task on Heroku using the deploy button below
(note that Heroku might
[charge you](https://devcenter.heroku.com/articles/scheduler)):

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Once the app is deployed visit the 'Resources' page for your app on the Heroku
dashboard, make sure the dynos are turned off, and configure the scheduler to
run the export command `node airtable-export.js` at the schedule of your
preference.

## Contribute

PRs accepted.

See also the upstream repo: https://github.com/digidem/airtable-github-export.
