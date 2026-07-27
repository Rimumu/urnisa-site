const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');
let originalContent = fs.readFileSync('pages/Gacha.tsx', 'utf8');

const lambSvgMatch = originalContent.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(146,64,14,0\.6\)\] relative z-10">.*?<\/svg>)/s);
const steakSvgMatch = originalContent.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(251,191,36,0\.4\)\] relative z-10">.*?<\/svg>)/s);

// In the JSX, replace them. BUT remember string.replace only replaces the FIRST occurrence.
// Since the first occurrence is now our component definition, the SECOND occurrence is the inline JSX!
// Actually, if we use a regex or string replacement, we can replace the last occurrence, or just find it by index.

const lastIndexOfLamb = content.lastIndexOf('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(146,64,14,0.6)] relative z-10">');
if (lastIndexOfLamb > 1000) {
    const lambEnd = content.indexOf('</svg>', lastIndexOfLamb) + 6;
    content = content.substring(0, lastIndexOfLamb) + '<LambCrateSVG stage={stage} selectedCrate={selectedCrate} />' + content.substring(lambEnd);
}

const lastIndexOfSteak = content.lastIndexOf('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.4)] relative z-10">');
if (lastIndexOfSteak > 1000) {
    const steakEnd = content.indexOf('</svg>', lastIndexOfSteak) + 6;
    content = content.substring(0, lastIndexOfSteak) + '<SteakCrateSVG stage={stage} selectedCrate={selectedCrate} />' + content.substring(steakEnd);
}

fs.writeFileSync('pages/GachaDev.tsx', content);
