const fs = require('fs');

const lambCrateSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
    <defs>
        <linearGradient id="lambCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="lambLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1e3a8a"/>
        </linearGradient>
    </defs>
    
    <!-- Main Box -->
    <rect x="10" y="25" width="80" height="65" rx="4" fill="url(#lambCrateGrad)" stroke="#020617" strokeWidth="2"/>
    <!-- Top Lid Angle -->
    <path d="M10 25 L20 10 L80 10 L90 25 Z" fill="url(#lambLidGrad)" stroke="#020617" strokeWidth="2"/>
    
    <!-- Case Details / Texture -->
    <path d="M15 35 L85 35 M15 50 L85 50 M15 65 L85 65 M15 80 L85 80" stroke="#000" strokeWidth="1" opacity="0.3"/>
    
    <!-- Vertical Straps -->
    <rect x="25" y="10" width="12" height="80" fill="#1e293b" stroke="#020617" strokeWidth="1.5"/>
    <rect x="63" y="10" width="12" height="80" fill="#1e293b" stroke="#020617" strokeWidth="1.5"/>
    
    <!-- Horizontal Strap -->
    <rect x="10" y="55" width="80" height="12" fill="#1e293b" stroke="#020617" strokeWidth="1.5"/>
    
    <!-- Rivets -->
    <circle cx="31" cy="16" r="1.5" fill="#94a3b8"/>
    <circle cx="31" cy="35" r="1.5" fill="#94a3b8"/>
    <circle cx="31" cy="61" r="1.5" fill="#94a3b8"/>
    <circle cx="31" cy="84" r="1.5" fill="#94a3b8"/>
    
    <circle cx="69" cy="16" r="1.5" fill="#94a3b8"/>
    <circle cx="69" cy="35" r="1.5" fill="#94a3b8"/>
    <circle cx="69" cy="61" r="1.5" fill="#94a3b8"/>
    <circle cx="69" cy="84" r="1.5" fill="#94a3b8"/>

    <!-- Lock / Keyhole Area -->
    <rect x="38" y="46" width="24" height="30" rx="4" fill="#0f172a" stroke="#020617" strokeWidth="2"/>
    <rect x="40" y="48" width="20" height="26" rx="2" fill="#020617"/>
    
    <!-- Glowing Keyhole Impression -->
    <g transform="translate(42, 51) scale(0.66)" stroke="#3b82f6" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        <path d="M15 6c0-2-1.5-3.5-3.5-3.5S8 4 8 6c0 1.5.8 2.8 2 3.5V16l2 2 2-2V9.5c1.2-.7 2-2 2-3.5z"/>
        <path d="M12 18h3"/>
        <path d="M12 15h4"/>
        <circle cx="11.5" cy="6" r="1" fill="#3b82f6"/>
    </g>
</svg>`;

const steakCrateSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]">
    <defs>
        <linearGradient id="steakCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7c2d12"/>
            <stop offset="100%" stop-color="#431407"/>
        </linearGradient>
        <linearGradient id="steakLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
    </defs>
    
    <!-- Main Box -->
    <rect x="10" y="25" width="80" height="65" rx="4" fill="url(#steakCrateGrad)" stroke="#020617" strokeWidth="2"/>
    <!-- Top Lid Angle -->
    <path d="M10 25 L20 10 L80 10 L90 25 Z" fill="url(#steakLidGrad)" stroke="#020617" strokeWidth="2"/>
    
    <!-- Case Details / Texture -->
    <path d="M15 35 L85 35 M15 50 L85 50 M15 65 L85 65 M15 80 L85 80" stroke="#000" strokeWidth="1" opacity="0.3"/>
    
    <!-- Vertical Straps -->
    <rect x="25" y="10" width="12" height="80" fill="#292524" stroke="#020617" strokeWidth="1.5"/>
    <rect x="63" y="10" width="12" height="80" fill="#292524" stroke="#020617" strokeWidth="1.5"/>
    
    <!-- Horizontal Strap -->
    <rect x="10" y="55" width="80" height="12" fill="#292524" stroke="#020617" strokeWidth="1.5"/>
    
    <!-- Rivets -->
    <circle cx="31" cy="16" r="1.5" fill="#a8a29e"/>
    <circle cx="31" cy="35" r="1.5" fill="#a8a29e"/>
    <circle cx="31" cy="61" r="1.5" fill="#a8a29e"/>
    <circle cx="31" cy="84" r="1.5" fill="#a8a29e"/>
    
    <circle cx="69" cy="16" r="1.5" fill="#a8a29e"/>
    <circle cx="69" cy="35" r="1.5" fill="#a8a29e"/>
    <circle cx="69" cy="61" r="1.5" fill="#a8a29e"/>
    <circle cx="69" cy="84" r="1.5" fill="#a8a29e"/>

    <!-- Lock / Keyhole Area -->
    <rect x="38" y="46" width="24" height="30" rx="4" fill="#1c1917" stroke="#020617" strokeWidth="2"/>
    <rect x="40" y="48" width="20" height="26" rx="2" fill="#020617"/>
    
    <!-- Glowing Keyhole Impression -->
    <g transform="translate(42, 51) scale(0.66)" stroke="#f97316" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        <path d="M16 8c1-2-1-4-3.5-4S9 5.5 9 8c0 1.5 1 3 2.5 3.5V17l1.5 1.5L14.5 17v-5.5C16 11 16 9.5 16 8z"/>
        <path d="M13 17h3"/>
        <path d="M13 14h4"/>
        <circle cx="12" cy="7" r="1" fill="#f97316"/>
    </g>
</svg>`;

for (const file of ['pages/Gacha.tsx', 'pages/GachaDev.tsx']) {
    let code = fs.readFileSync(file, 'utf8');

    // Lamb Crate Regex
    const lambRegex = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1\.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-2xl">\s*<path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"\/>\s*<path d="M2 8h20l-3-5H5L2 8z" fill="currentColor" fillOpacity="0\.1"\/>\s*<path d="M2 8h20"\/>\s*<path d="M7 3v18M17 3v18" strokeDasharray="2 2"\/>\s*<rect x="8" y="11" width="8" height="8" rx="1\.5" fill="currentColor" fillOpacity="0\.2"\/>\s*<path d="M14 14c0-1\.5-1-2\.5-2-2\.5s-2 1-2 2\.5c0 1 \.5 1\.8 1\.2 2\.2V17\.5h1\.6v-1\.3c\.7-\.4 1\.2-1\.2 1\.2-2\.2z" fill="#000" stroke="none"\/>\s*<\/svg>/;
    
    // Steak Crate Regex
    const steakRegex = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1\.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-2xl">\s*<path d="M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9"\/>\s*<path d="M2 9h20l-4-6H6L2 9z" fill="currentColor" fillOpacity="0\.1"\/>\s*<path d="M2 9h20"\/>\s*<path d="M8 3v18M16 3v18" strokeWidth="2"\/>\s*<rect x="8" y="11" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0\.2"\/>\s*<path d="M15 14c\.5-1-\.5-2\.5-2\.5-2\.5S10 13 10 14c0 1 \.8 2 1\.8 2\.2V17\.5h1\.4v-1\.3c1-\.2 1\.8-1\.2 1\.8-2\.2z" fill="#000" stroke="none"\/>\s*<\/svg>/;

    code = code.replace(lambRegex, lambCrateSvg);
    code = code.replace(steakRegex, steakCrateSvg);

    fs.writeFileSync(file, code);
}
