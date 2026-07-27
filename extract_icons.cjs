const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

const lambSvgMatch = content.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(146,64,14,0\.6\)\] relative z-10">.*?<\/svg>)/s);
const steakSvgMatch = content.match(/(<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-\[0_0_25px_rgba\(251,191,36,0\.4\)\] relative z-10">.*?<\/svg>)/s);

console.log(lambSvgMatch ? "Found Lamb" : "No Lamb");
console.log(steakSvgMatch ? "Found Steak" : "No Steak");

