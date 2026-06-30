const fs = require('fs');

function extractTagsFromTs(content) {
  const tags = [];
  const matches = content.matchAll(/\{ name: '([^']+)'/g);
  for (const match of matches) {
    tags.push(match[1]);
  }
  return new Set(tags);
}

const videoData = fs.readFileSync('./src/lib/video-tags-data.ts', 'utf8');
const definedVideoTags = extractTagsFromTs(videoData);

const imageData = fs.readFileSync('./src/lib/image-tags-data.ts', 'utf8');
const definedImageTags = extractTagsFromTs(imageData);

const webData = fs.readFileSync('./src/lib/web-tags-data.ts', 'utf8');
const definedWebTags = new Set();
for (const match of webData.matchAll(/'([^']+)'/g)) {
  definedWebTags.add(match[1]);
}

const videosJson = require('./public/prompts/placeholder-videos.json').placeholderVideos;
const imagesJson = require('./public/prompts/placeholder-images.json').placeholderImages;

function getActualTags(arr) {
  const tags = new Set();
  for (const item of arr) {
    if (item.tags) {
      for (const t of item.tags) tags.add(t);
    }
  }
  return tags;
}

const actualVideoTags = getActualTags(videosJson);
const actualImageTags = getActualTags(imagesJson);

console.log("Missing Video Tags:");
for (const tag of actualVideoTags) {
  if (!definedVideoTags.has(tag)) console.log(tag);
}

console.log("\nMissing Image Tags:");
for (const tag of actualImageTags) {
  if (!definedImageTags.has(tag)) console.log(tag);
}
