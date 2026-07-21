const fs = require('fs');

const lambChopHole = `    {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#0f172a" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Lamb Chop Impression */}
    <g transform="translate(63, 56)" strokeLinecap="round" strokeLinejoin="round">
        {/* Bone */}
        <path d="M14 14 l 6 6 a 2 2 0 0 1 -2.8 2.8 l -0.4 -0.4 a 2 2 0 0 1 -2.8 -2.8 l 6 -6" stroke="#fcd34d" strokeWidth="1" fill="#fef3c7" />
        {/* Meat */}
        <path d="M15 15 C 10 20 2 18 2 12 C 2 7 6 2 12 4 C 16 6 18 10 15 15 Z" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
        <path d="M6 10 Q 8 8 10 11" stroke="#92400e" strokeWidth="1" fill="none"/>
    </g>`;

const steakMeatHole = `    {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#1c1917" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Steak Impression */}
    <g transform="translate(63, 55)" strokeLinecap="round" strokeLinejoin="round">
        {/* Meat outline */}
        <path d="M3 10 C 3 5 8 4 12 4 C 18 4 21 6 21 11 C 21 16 16 18 10 18 C 5 18 3 15 3 10 Z" fill="#7a2034" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Medium Rare Pink center */}
        <path d="M6 10 C 6 7 9 6 12 6 C 16 6 18 8 18 11 C 18 14 14 15 10 15 C 7 15 6 13 6 10 Z" fill="#fb7185" />
        {/* Marbling (White/Gold) */}
        <path d="M8 10 Q 10 8 12 11 T 16 9" stroke="#fef08a" strokeWidth="1" fill="none" opacity="0.8"/>
        <path d="M7 12 Q 9 14 11 12 T 15 13" stroke="#fef08a" strokeWidth="1" fill="none" opacity="0.8"/>
    </g>`;

for (const file of ['pages/Gacha.tsx', 'pages/GachaDev.tsx']) {
    let code = fs.readFileSync(file, 'utf8');

    // Replace Lamb Crate Keyhole Area
    code = code.replace(/{\/\* Lock \/ Keyhole Area \*\/}[\s\S]*?<\/g>/, lambChopHole);
    // The second match is Steak
    code = code.replace(/{\/\* Lock \/ Keyhole Area \*\/}[\s\S]*?<\/g>/, steakMeatHole);

    // Now for keys:
    // We already replaced keys? No, `fix_final_keys.cjs` had wrong target SVG.
    // Let's replace the whole <svg ... > for the keys.
    // We can search for <svg ... </svg> between `<div className="bg-amber-900/30` and `</div>`
    
    const lambKeySvgTarget1 = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10C10 6 6 5 4 7C2 9 3 12 5 13C7 14 9.5 12.5 10 10Z" fill="#92400e" fillOpacity="0.8"/><path d="M10 10C10 6 6 5 4 7C2 9 3 12 5 13C7 14 9.5 12.5 10 10Z"/><path d="M8 9L19 20"/><path d="M15 16L18 13"/><path d="M19 20C20 22 23 19 21 17L18 20"/></svg>`;
    const lambKeySvgTarget2 = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10C10 6 6 5 4 7C2 9 3 12 5 13C7 14 9.5 12.5 10 10Z" fill="#92400e" fillOpacity="0.8"/><path d="M10 10C10 6 6 5 4 7C2 9 3 12 5 13C7 14 9.5 12.5 10 10Z"/><path d="M8 9L19 20"/><path d="M15 16L18 13"/><path d="M19 20C20 22 23 19 21 17L18 20"/></svg>`;

    const steakKeySvgTarget1 = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8C13 4 7 3 4 5C2 6 1 9 3 12C5 14 11 14 13 8Z" fill="#e37b88" fillOpacity="0.8"/><path d="M13 8C13 4 7 3 4 5C2 6 1 9 3 12C5 14 11 14 13 8Z"/><path d="M6 7L9 10"/><path d="M10 10L21 21"/><path d="M16 17L20 13"/><path d="M19 20L23 16"/></svg>`;
    const steakKeySvgTarget2 = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8C13 4 7 3 4 5C2 6 1 9 3 12C5 14 11 14 13 8Z" fill="#e37b88" fillOpacity="0.8"/><path d="M13 8C13 4 7 3 4 5C2 6 1 9 3 12C5 14 11 14 13 8Z"/><path d="M6 7L9 10"/><path d="M10 10L21 21"/><path d="M16 17L20 13"/><path d="M19 20L23 16"/></svg>`;

    const lambKey18 = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#92400e" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" /></svg>`;
    const lambKey20 = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#92400e" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" /></svg>`;

    const steakKey18 = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="url(#steakKeyGrad18)" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="steakKeyGrad18" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7a2034"/><stop offset="50%" stopColor="#fb7185"/><stop offset="100%" stopColor="#9f1239"/></linearGradient></defs><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" /></svg>`;
    const steakKey20 = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="url(#steakKeyGrad20)" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="steakKeyGrad20" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7a2034"/><stop offset="50%" stopColor="#fb7185"/><stop offset="100%" stopColor="#9f1239"/></linearGradient></defs><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" /></svg>`;

    const safeReplace = (target, replacement) => {
        let regexEscaped = target.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
        code = code.replace(new RegExp(regexEscaped, 'g'), replacement);
    };

    safeReplace(lambKeySvgTarget1, lambKey18);
    safeReplace(lambKeySvgTarget2, lambKey20);
    safeReplace(steakKeySvgTarget1, steakKey18);
    safeReplace(steakKeySvgTarget2, steakKey20);

    fs.writeFileSync(file, code);
}
