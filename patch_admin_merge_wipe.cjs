const fs = require('fs');
let code = fs.readFileSync('pages/Admin.tsx', 'utf-8');

// 1. Update handleMergeUsers
code = code.replace(
    /const response = await fetch\(`\$\{API_BASE_URL\}\/api\/nisathon\/merge-users`, \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json', Authorization: password \},\s*body: JSON.stringify\(\{ sourceUser: mergeSource, targetUser: mergeTarget \}\)\s*\}\);/,
    `const response = await fetch(\`\${API_BASE_URL}/api/nisathon/merge-users\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ sourceUser: mergeSource, targetUser: mergeTarget })
            });
            // Also call DBOT to merge MinecraftLinks
            await fetch(\`\${DISCORD_API_URL}/api/admin/users/merge\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ sourceUser: mergeSource, targetUser: mergeTarget })
            }).catch(e => console.error("Dbot merge failed", e));`
);

// 2. Add nisaballs to wipe scope
code = code.replace(
    /const handleWipeMinecraftData = async \(scope: 'all' \| 'inventory' \| 'currency' \| 'approved_users' \| 'bingo' \| 'tournament'\) => \{/,
    `const handleWipeMinecraftData = async (scope: 'all' | 'inventory' | 'currency' | 'approved_users' | 'bingo' | 'tournament' | 'nisaballs') => {`
);

// 3. Add nisaball wipe button
const currencySection = `
                                    {/* Clear Currencies */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Key Wallets (Currency)</h4>
                                            <p className="text-xs text-gray-500 mt-1">Resets lamb and wagyu key balances for all users to 0, resetting currency state completely.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('currency')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE CURRENCY
                                        </button>
                                    </div>`;

const nisaballSection = currencySection + `

                                    {/* Clear Nisaballs */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Nisaball Balance</h4>
                                            <p className="text-xs text-gray-500 mt-1">Resets the Nisaball balance for all users to 0 (does not erase bits/subs history).</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('nisaballs')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE NISABALLS
                                        </button>
                                    </div>`;

code = code.replace(currencySection, nisaballSection);

// 4. Update the all-wipe for nisaballs
code = code.replace(
    /if \(scope === 'all' \|\| scope === 'inventory' \|\| scope === 'currency' \|\| scope === 'approved_users'\) \{/g,
    `if (scope === 'all' || scope === 'inventory' || scope === 'currency' || scope === 'approved_users' || scope === 'nisaballs') {`
);

fs.writeFileSync('pages/Admin.tsx', code);
