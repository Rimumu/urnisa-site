const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

content = content.replace(/gachaPoolsDev/g, 'gachaPools');
content = content.replace(/GachaDev/g, 'Gacha');

fs.writeFileSync('pages/Gacha.tsx', content);
