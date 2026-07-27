const fs = require('fs');
let code = fs.readFileSync('pages/Admin.tsx', 'utf-8');
code = code.replace(
    /if \(scope === 'all' \|\| scope === 'bingo' \|\| scope === 'tournament'\) \{/,
    `if (scope === 'all' || scope === 'bingo' || scope === 'tournament' || scope === 'nisaballs') {`
);
fs.writeFileSync('pages/Admin.tsx', code);
