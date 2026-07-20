const fs = require('fs');
let code = fs.readFileSync('pages/ArchiveNisathon.tsx', 'utf8');

code = code.replace(/stats\?\.subsRate/g, 'd?.subsRate');
code = code.replace(/stats\?\.bitsRate/g, 'd?.bitsRate');
code = code.replace(/stats\?\.donationRate/g, 'd?.donationRate');
code = code.replace(/stats\?\.timePerNb/g, 'd?.timePerNb');

fs.writeFileSync('pages/ArchiveNisathon.tsx', code);
