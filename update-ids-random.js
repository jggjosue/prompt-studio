const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const filePath = path.join(__dirname, 'public/prompts/placeholder-images.json');
const data = require(filePath);

data.placeholderImages = data.placeholderImages.map(item => ({
  ...item,
  // Genera bytes aleatorios, crea un hash SHA-256 y toma los primeros 16 caracteres
  id: crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex').substring(0, 16)
}));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log('IDs de placeholderImages actualizados con hashes aleatorios de 16 caracteres.');