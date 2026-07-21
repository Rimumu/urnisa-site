const fs = require('fs');

const disabledKeyTarget = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`;
const disabledKeyReplacement = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#374151" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#4b5563" stroke="none" /></svg>`;

for (const file of ['pages/Gacha.tsx', 'pages/GachaDev.tsx']) {
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(new RegExp(disabledKeyTarget.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'g'), disabledKeyReplacement);

    fs.writeFileSync(file, code);
}
