const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');

code = code.replace(/lambPacks/g, 'lambKeys');
code = code.replace(/wagyuPacks/g, 'steakKeys');
code = code.replace(/lamb_pack/g, 'lamb_key');
code = code.replace(/wagyu_pack/g, 'steak_key');
code = code.replace(/packAmount/g, 'keyAmount');
code = code.replace(/'wagyu'/g, "'steak'");
code = code.replace(/wagyu/g, "steak");

// Also remove discord logging for gacha
code = code.replace(/\/\/ --- DISCORD LOGGING ---[\s\S]*?res\.json\(\{ success: true \}\);/m, 'res.json({ success: true });');

// Actually wait, let's just make the replacement for DISCORD LOGGING specifically.
