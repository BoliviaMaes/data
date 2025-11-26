import stringify from "json-stable-stringify";
import Airtable from "airtable";
import fs from "fs";

async function fetchTable({ base, table }) {
  return new Promise((resolve, reject) => {
    const data = [];

    base(table).select().eachPage(page, done);

    function page(records, next) {
      // This function will get called for each page of records.
      for (const record of records) {
        data.push({
          ...record.fields,
          airtableId: record.id,
        });
      }
      next();
    }

    function done(err) {
      if (err) reject(err);
      resolve(data);
    }
  });
}

// remove the derived fields
function removeDerivedFields(records) {
  return records.map((record) => {
    return Object.fromEntries(
      Object.entries(record).filter(([k]) => !k.includes(" (from "))
    );
  });
}

// replace image URLs with local paths
function replaceImageUrlsWithLocal(records, baseUrl, imagesSubDirectory) {
  const imageIndex = {};
  const withLocalImages = [];
  for (const record of records) {
    const newRecord = {};
    for (const [k, v] of Object.entries(record)) {
      if (
        Array.isArray(v) &&
        v.every(
          (item) =>
            item.url &&
            item.id &&
            item.filename &&
            item.type?.split("/")[0] === "image"
        )
      ) {
        // This field contains images
        const images = [];
        for (const image of v) {
          const extension = image.filename.split(".").pop();
          const filename = `${image.id}.${extension}`;

          // update the image index
          imageIndex[filename] = image.url;

          const newImage = {
            ...image,
            // override the existing filename
            filename,
            url: `${baseUrl}${imagesSubDirectory}/${filename}`,
          };

          // process the thumbnails
          if (image.thumbnails) {
            const newThumbnails = {};
            for (const [kind, thumbnail] of Object.entries(image.thumbnails)) {
              // airtable preserves the original extension/format when creating thumbnails
              const filename = `${image.id}-${kind}.${extension}`;

              // update the image index
              imageIndex[filename] = thumbnail.url;

              newThumbnails[kind] = {
                ...thumbnail,
                filename,
                url: `${baseUrl}${imagesSubDirectory}/${filename}`,
              };
            }
            newImage.thumbnails = newThumbnails;
          }

          images.push(newImage);
        }
        newRecord[k] = images;
      } else {
        newRecord[k] = v;
      }
    }
    withLocalImages.push(newRecord);
  }

  return { records: withLocalImages, imageIndex };
}

export async function fetchAirtableRecords({
  airtableCacheDirectory,
  buildDirectory,
  imagesSubDirectory,
  baseUrl,
  skip,
  base,
  tables,
  apiKey,
}) {
  const log = (m) => console.log(`[airtable] ${m}`);
  const runAirtable = !fs.existsSync(airtableCacheDirectory);
  if (!runAirtable || skip) {
    log("Airtable export process skipped");
  } else {
    const airtableBase = new Airtable({ apiKey }).base(base);
    log(`Starting Airtable export process for base "${base}"`);
    log(`Create local directories if they don't exist`);
    if (!fs.existsSync(airtableCacheDirectory)) {
      fs.mkdirSync(airtableCacheDirectory, { recursive: true });
      log(`    -> ${airtableCacheDirectory} created`);
    }
    for (const table of tables) {
      log(`Process table "${table}"`);

      // check if the table export already exists
      const jsonPath = `${airtableCacheDirectory}/${table}.json`;
      if (fs.existsSync(jsonPath)) {
        log(`  -> Table export "${table}" already exists`);
        continue;
      }

      log(`  Fetch table "${table}" from Airtable base "${base}"`);
      const records = await fetchTable({ base: airtableBase, table });
      log(`    -> ${records.length} records fetched`);

      log("  Remove derived fields and replace image URLs with local paths");
      const withoutDerived = removeDerivedFields(records);
      const { records: withLocalImages, imageIndex } =
        replaceImageUrlsWithLocal(withoutDerived, baseUrl, imagesSubDirectory);
      log("    -> derived fields removed and image URLs replaced");

      // Store the images index
      log("  Store image index file");
      const imageIndexPath = `${airtableCacheDirectory}/${table}.image-index.json`;
      const imageIndexJson = stringify(imageIndex, { space: 2 });
      fs.writeFileSync(imageIndexPath, imageIndexJson, "utf-8");
      log(`    -> ${imageIndexPath} created`);

      log("  Store JSON in the cache");
      // Use json-stable-stringify to ensure the JSON to be the same, even if the order has changed
      const json = stringify(withLocalImages, { space: 2 });
      fs.writeFileSync(jsonPath, json, "utf-8");
      log(`    -> ${jsonPath} created`);

      log("  Store JSON in the build directory");
      const buildPath = `${buildDirectory}/${table}.json`;
      fs.writeFileSync(buildPath, json, "utf-8");
      log(`    -> ${buildPath} created`);
    }
    log("Airtable export process completed successfully.");
  }
}
