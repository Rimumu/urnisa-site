const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

// duo/lock
const lockDuoTarget = `body: JSON.stringify({ discordId: user?.id, duoId: myDuo.duoId })`;
const lockDuoReplace = `body: JSON.stringify({ discordId: (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user?.id, duoId: myDuo.duoId })`;
if(file.includes(lockDuoTarget)) file = file.replace(lockDuoTarget, lockDuoReplace);

// lock (singles)
const lockTarget = `body: JSON.stringify({ discordId: user?.id, seasonId: activeSeason.seasonId })`;
const lockReplace = `body: JSON.stringify({ discordId: (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user?.id, seasonId: activeSeason.seasonId })`;
if(file.includes(lockTarget)) file = file.replace(lockTarget, lockReplace);

fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
console.log("Patched lock logic.");
