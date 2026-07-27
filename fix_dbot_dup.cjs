const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');

const dupStart = '// --- DATABASE ---';
const lastIndex = code.lastIndexOf(dupStart);

if (lastIndex > 1000) {
    code = code.substring(0, lastIndex);
    fs.writeFileSync('backend-references/urnisa-dbot/server.js', code);
    console.log("Removed duplicate at EOF");
}
