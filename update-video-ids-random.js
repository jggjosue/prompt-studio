const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/placeholder-videos.json');
const data = require(filePath);

data.placeholderVideos = data.placeholderVideos.map(item => ({
  ...item,
  id: crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex').substring(0, 16)
}));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('IDs de placeholderVideos actualizados con hashes aleatorios de 16 caracteres.');