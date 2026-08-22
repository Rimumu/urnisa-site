const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

const targetDropdown = `.filter(s => !s.isHidden || user?.minecraftUsername === 'GreatRimu')`;
const replaceDropdown = `.filter(s => !s.isHidden || user?.minecraftUsername === 'GreatRimu' || adminDummyId !== null)`;

if (file.includes(targetDropdown)) {
    file = file.replace(targetDropdown, replaceDropdown);
    fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
    console.log("Patched dropdown.");
} else {
    console.log("Could not find dropdown target.");
}
