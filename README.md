# Bolivia MAEs data

The data used in the [Bolivia MAEs](https://github.com/BoliviaMaes) account are stored in a private AirTable base.

This repository contains a script to export the data as JSON and download the images.

It also publishes the data with GitHub Pages at https://boliviamaes.github.io/data/.

## Configuration

The script depends on several environment variables which you can set a `.env`
file if you run this locally:

```
TABLES=Table 1,Table 2
AIRTABLE_PERSONAL_TOKEN=xxxxxx
AIRTABLE_BASE_ID=airtable_base_id
```

To fill all these variables:

- Airtable Personal Token: go to https://airtable.com/create/tokens
- Airtable base id: go to https://airtable.com/api, click on your database, and
  search for "The ID of this base is appFyez....x9V."

## Launch

Install with `npm i`

Run the export with `npm run start`

