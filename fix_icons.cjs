const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

// Wait, since I overwrote it, the original SVGs are gone! I need to get them from Gacha.tsx!
let originalContent = fs.readFileSync('pages/Gacha.tsx', 'utf8');

const lambSvgMatch = originalContent.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(146,64,14,0\.6\)\] relative z-10">.*?<\/svg>)/s);
const steakSvgMatch = originalContent.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(251,191,36,0\.4\)\] relative z-10">.*?<\/svg>)/s);

const lambComponent = `
const LambCrateSVG: React.FC<{ stage: string; selectedCrate: string | null }> = ({ stage, selectedCrate }) => (
    ${lambSvgMatch[1]}
);
`;

const steakComponent = `
const SteakCrateSVG: React.FC<{ stage: string; selectedCrate: string | null }> = ({ stage, selectedCrate }) => (
    ${steakSvgMatch[1]}
);
`;

// Now replace the broken components in GachaDev.tsx
content = content.replace(/const LambCrateSVG.*?<LambCrateSVG.*?\);\s*/s, lambComponent);
content = content.replace(/const SteakCrateSVG.*?<SteakCrateSVG.*?\);\s*/s, steakComponent);

fs.writeFileSync('pages/GachaDev.tsx', content);
