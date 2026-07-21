const fs = require('fs');

const lambChopHole = `    {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#0f172a" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Lamb Chop Impression */}
    <g transform="translate(62, 48) scale(1.1)" strokeLinecap="round" strokeLinejoin="round">
        {/* Bone */}
        <path d="M14 14 l 6 6 a 2 2 0 0 1 -2.8 2.8 l -0.4 -0.4 a 2 2 0 0 1 -2.8 -2.8 l 6 -6" stroke="#fef3c7" strokeWidth="1.5" fill="#fde68a" />
        {/* Meat */}
        <path d="M15 15 C 10 20 2 18 2 12 C 2 7 6 2 12 4 C 16 6 18 10 15 15 Z" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
        <path d="M6 10 Q 8 8 10 11" stroke="#d97706" strokeWidth="1.5" fill="none"/>
    </g>`;

const steakMeatHole = `    {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#1c1917" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Steak Impression */}
    <g transform="translate(63, 51)" strokeLinecap="round" strokeLinejoin="round">
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

    // Split at STEAK CRATE
    const parts = code.split('{/* STEAK CRATE */}');
    
    // Lamb part
    parts[0] = parts[0].replace(/{\/\* Lock \/ Keyhole Area \*\/}[\s\S]*?<\/g>/, lambChopHole);
    
    // Steak part
    parts[1] = parts[1].replace(/{\/\* Lock \/ Keyhole Area \*\/}[\s\S]*?<\/g>/, steakMeatHole);

    fs.writeFileSync(file, parts.join('{/* STEAK CRATE */}'));
}
