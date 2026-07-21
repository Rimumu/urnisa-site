const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');

code = code.replace(/lambPacks/g, 'lambKeys');
code = code.replace(/wagyuPacks/g, 'steakKeys');
code = code.replace(/UserPack/g, 'UserKey');
code = code.replace(/packAmount/g, 'keyAmount');
code = code.replace(/'wagyu'/g, "'steak'");
code = code.replace(/wagyu/gi, "steak");
code = code.replace(/'lamb'/g, "'lamb'");

// Replace DISCORD LOGGING
const discordLogRegex = /\/\/ --- DISCORD LOGGING ---[\s\S]*?\}\s*catch \([a-zA-Z0-9_]+\) \{[\s\S]*?\}\s*\}/m;
code = code.replace(discordLogRegex, '// Discord logging removed');

fs.writeFileSync('backend-references/urnisa-dbot/server.js', code);
