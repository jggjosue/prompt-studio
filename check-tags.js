const fs = require('fs');

// Simple parser for the ts files since we can't easily require them in node without ts-node
function extractTags(content) {
  const tags = [];
  const matches = content.matchAll(/\{ name: '([^']+)'/g);
  for (const match of matches) {
    tags.push(match[1]);
  }
  return new Set(tags);
}

const videoData = fs.readFileSync('./src/lib/video-tags-data.ts', 'utf8');
const definedVideoTags = extractTags(videoData);

const imageData = fs.readFileSync('./src/lib/image-tags-data.ts', 'utf8');
const definedImageTags = extractTags(imageData);

const webData = fs.readFileSync('./src/lib/web-tags-data.ts', 'utf8');
const definedWebTags = new Set();
for (const match of webData.matchAll(/'([^']+)'/g)) {
  // Rough extraction, it'll pick up other strings too but it's okay for set difference
  definedWebTags.add(match[1]);
}

// Now let's see what's in the placeholder files
const videosFile = fs.readFileSync('./src/lib/placeholder-videos.ts', 'utf8');
const imagesFile = fs.readFileSync('./src/lib/placeholder-images.ts', 'utf8');
const webPagesFile = fs.readFileSync('./src/lib/web-pages.ts', 'utf8');

function getActualTags(content) {
  const actualTags = new Set();
  const matches = content.matchAll(/tags: \[([^\]]+)\]/g);
  for (const match of matches) {
    const arrStr = match[1];
    const itemMatches = arrStr.matchAll(/'([^']+)'/g);
    for (const itemMatch of itemMatches) {
      actualTags.add(itemMatch[1]);
    }
  }
  return actualTags;
}

const actualVideoTags = getActualTags(videosFile);
const actualImageTags = getActualTags(imagesFile);
const actualWebTags = getActualTags(webPagesFile);

//console.log("Missing Video Tags:");
for (const tag of actualVideoTags) {
  if (!definedVideoTags.has(tag)) { //console.log(tag); 
  }
}

//console.log("\nMissing Image Tags:");
for (const tag of actualImageTags) {
  if (!definedImageTags.has(tag)) { //console.log(tag); 
  }
}

//console.log("\nMissing Web Tags:");
for (const tag of actualWebTags) {
  if (!definedWebTags.has(tag)) { //console.log(tag); 
  }
}

