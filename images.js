import fs from "fs";

function getImageIndex({ airtableCacheDirectory, imagesCacheDirectory }) {
  const urlByImagePath = new Map();
  // Read all the index files from the Airtable cache directory
  const files = fs.readdirSync(airtableCacheDirectory);
  for (const file of files) {
    if (file.endsWith("image-index.json")) {
      const filePath = `${airtableCacheDirectory}/${file}`;
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const fileData = JSON.parse(fileContent);
      for (const [filename, url] of Object.entries(fileData)) {
        const imagePath = `${imagesCacheDirectory}/${filename}`;
        urlByImagePath.set(imagePath, url);
      }
    }
  }
  return urlByImagePath;
}

function getCachedImages({ imagesCacheDirectory }) {
  const cachedImages = new Set();
  // Read all the cached image files from the images cache directory
  const files = fs.readdirSync(imagesCacheDirectory);
  for (const file of files) {
    const imagePath = `${imagesCacheDirectory}/${file}`;
    cachedImages.add(imagePath);
  }
  return cachedImages;
}

function deleteUnusedCachedImages(imageIndex, cachedImages) {
  let deletedCount = 0;
  for (const imagePath of cachedImages) {
    if (!imageIndex.has(imagePath)) {
      // Delete the cached image file
      fs.unlinkSync(imagePath);
      deletedCount++;
    }
  }
  return deletedCount;
}

async function downloadMissingImages(imageIndex, cachedImages, log) {
  let downloadedCount = 0;
  let processedCount = 0;
  const imagesCount = imageIndex.size;

  process.stdout.write(
    `[images]     -> ${processedCount}/${imagesCount} images synchronized so far`
  );
  for (const [imagePath, imageUrl] of imageIndex.entries()) {
    processedCount++;
    if (processedCount % 100 === 0) {
      process.stdout.write(
        `\n[images]     -> ${processedCount}/${imagesCount} images synchronized so far`
      );
    } else if (processedCount % 10 === 0) {
      process.stdout.write(`.`); // progress dot
    }

    if (!cachedImages.has(imagePath)) {
      // Download the image from imageUrl and save it to imagePath
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(buffer));
      downloadedCount++;
    }
  }
  process.stdout.write(
    `\n[images]     -> ${processedCount}/${imagesCount} images synchronized - all done\n`
  );
  process.stdout.write(
    `[images]     -> ${downloadedCount} images downloaded\n`
  );
}

export async function synchronizeImages({
  airtableCacheDirectory,
  imagesCacheDirectory,
  skip,
}) {
  const log = (m) => console.log(`[images] ${m}`);
  if (skip || !fs.existsSync(airtableCacheDirectory)) {
    log("Images synchronization process skipped");
  } else {
    log("Synchronize the images");
    log(`Create local directories if they don't exist`);
    if (!fs.existsSync(imagesCacheDirectory)) {
      fs.mkdirSync(imagesCacheDirectory, { recursive: true });
      log(`    -> ${imagesCacheDirectory} created`);
    }
    log(`Get the list of images to download from the Airtable exports`);
    const imageIndex = getImageIndex({
      airtableCacheDirectory,
      imagesCacheDirectory,
    });
    log(`    -> ${imageIndex.size} images found`);
    log(`Get the list of cached images`);
    const cachedImages = getCachedImages({ imagesCacheDirectory });
    log(`    -> ${cachedImages.size} cached images found`);
    log(`Delete unused cached images`);
    const deletedImages = deleteUnusedCachedImages(imageIndex, cachedImages);
    log(`    -> ${deletedImages} unused cached images deleted`);
    log(`Download missing images`);
    await downloadMissingImages(imageIndex, cachedImages);
    log("Images synchronization process completed successfully.");
  }
}
