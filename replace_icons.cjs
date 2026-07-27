const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

const lambSvgMatch = content.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(146,64,14,0\.6\)\] relative z-10">.*?<\/svg>)/s);
const steakSvgMatch = content.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(251,191,36,0\.4\)\] relative z-10">.*?<\/svg>)/s);

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

// Insert the components before the CrateItem definition
content = content.replace('const CrateItem:', lambComponent + '\n' + steakComponent + '\nconst CrateItem:');

// Replace the inline SVGs with the components
content = content.replace(lambSvgMatch[1], `<LambCrateSVG stage={stage} selectedCrate={selectedCrate} />`);
content = content.replace(steakSvgMatch[1], `<SteakCrateSVG stage={stage} selectedCrate={selectedCrate} />`);

fs.writeFileSync('pages/GachaDev.tsx', content);
