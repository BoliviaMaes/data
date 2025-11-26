import { fetchAirtableRecords } from "./airtable.js";
import { synchronizeImages } from "./images.js";
import { config as envConfig } from "dotenv";

envConfig();

const config = {
  tables: process.env.TABLES.split(","),
  githubToken: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPO,
  owner: process.env.GITHUB_OWNER,
  airtableToken: process.env.AIRTABLE_PERSONAL_TOKEN,
  base: process.env.AIRTABLE_BASE_ID,
  branches: process.env.GITHUB_BRANCH
    ? process.env.GITHUB_BRANCH.split(",")
    : ["master"],
  filename: process.env.GITHUB_FILENAME || "data.json",
  baseUrl: process.env.BASE_URL || "https://yourdomain.com/data/",
};

const cacheDirectory = "./cache";
const buildDirectory = "./dist";
const airtableSubDirectory = "airtable";
const imagesSubDirectory = "images";

const airtableCacheDirectory = `${cacheDirectory}/${airtableSubDirectory}`;
await fetchAirtableRecords({
  airtableCacheDirectory,
  imagesSubDirectory,
  baseUrl: config.baseUrl,
  buildDirectory,
  skip: false,
  base: config.base,
  tables: config.tables,
  apiKey: config.airtableToken,
});

const imagesCacheDirectory = `${buildDirectory}/${imagesSubDirectory}`;
await synchronizeImages({
  airtableCacheDirectory,
  imagesCacheDirectory,
  skip: false,
});
