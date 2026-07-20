const fs = require('fs');

const rewardsCode = `
const TOP_REWARDS = [
    "Exclusive VIP Badge",
    "Signed Poster",
    "Special Discord Role"
];

const PERSONALISED_REWARDS = [
    { cost: "10 NB", reward: "Custom Shoutout" },
    { cost: "25 NB", reward: "Choose Next Game" },
    { cost: "50 NB", reward: "VIP for 1 Month" },
    { cost: "100 NB", reward: "Exclusive Merch" }
];
`;

for (const file of ['pages/Nisathon.tsx', 'pages/ArchiveNisathon.tsx']) {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('TOP_REWARDS')) {
        // Just prepending to constants section
        code = code.replace(/\/\/ --- DATA CONSTANTS ---/, '// --- DATA CONSTANTS ---\n' + rewardsCode);
        fs.writeFileSync(file, code);
    } else if (!code.includes('const TOP_REWARDS')) {
        code = code.replace(/\/\/ --- DATA CONSTANTS ---/, '// --- DATA CONSTANTS ---\n' + rewardsCode);
        fs.writeFileSync(file, code);
    }
}
