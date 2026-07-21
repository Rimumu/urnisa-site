const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');

const regex = /\/\/ Discord logging removed;[\s\S]*?res\.json\(\{ success: true \}\);/m;
code = code.replace(regex, 'res.json({ success: true });');

fs.writeFileSync('backend-references/urnisa-dbot/server.js', code);
