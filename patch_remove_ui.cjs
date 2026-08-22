const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

// For Captain's Roster (Slots 1-3) which uses idx (0, 1, 2)
const capTarget = `{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                                                            <button onClick={() => handleRemovePokemon(idx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={\`Remove \${p.name}\`}>`;

const capReplace = `{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (user?.minecraftUsername === 'GreatRimu' || myDuo.player1DiscordId === user?.id) && (
                                                                                            <button onClick={() => handleRemovePokemon(idx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={\`Remove \${p.name}\`}>`;


// For Partner's Roster (Slots 4-6) which uses actualIdx (3, 4, 5)
const partTarget = `{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                                                            <button onClick={() => handleRemovePokemon(actualIdx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={\`Remove \${p.name}\`}>`;

const partReplace = `{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (user?.minecraftUsername === 'GreatRimu' || myDuo.player2DiscordId === user?.id) && (
                                                                                            <button onClick={() => handleRemovePokemon(actualIdx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={\`Remove \${p.name}\`}>`;


if (file.includes(capTarget)) file = file.replace(capTarget, capReplace);
if (file.includes(partTarget)) file = file.replace(partTarget, partReplace);

fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
console.log("Patched remove UI");
