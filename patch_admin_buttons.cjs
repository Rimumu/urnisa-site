const fs = require('fs');
let file = fs.readFileSync('pages/AdminTournament.tsx', 'utf8');

// For Singles format players:
const singlesActionsTarget = `<button
                                                    onClick={() => setSelectedPlayer(player)}
                                                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    View
                                                </button>`;
const singlesActionsReplace = `<button
                                                    onClick={() => setSelectedPlayer(player)}
                                                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => window.open(\`/tournament?adminDummyId=\${player.discordId}\`, '_blank')}
                                                    className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    Edit Team
                                                </button>`;
if(file.includes(singlesActionsTarget)) file = file.replace(singlesActionsTarget, singlesActionsReplace);


// For Duos Teams:
const duosActionsTarget = `{duo.isLocked && (
                                            <button
                                                onClick={() => handleUnlockDuo(duo)}
                                                disabled={loading}
                                                className="flex-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-xs font-bold py-1.5 rounded transition-colors"
                                            >
                                                Unlock
                                            </button>
                                        )}`;
const duosActionsReplace = `{duo.isLocked && (
                                            <button
                                                onClick={() => handleUnlockDuo(duo)}
                                                disabled={loading}
                                                className="flex-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-xs font-bold py-1.5 rounded transition-colors"
                                            >
                                                Unlock
                                            </button>
                                        )}
                                        <button
                                            onClick={() => window.open(\`/tournament?adminDummyId=\${duo.player1DiscordId}\`, '_blank')}
                                            className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            Edit Team
                                        </button>`;
if(file.includes(duosActionsTarget)) file = file.replace(duosActionsTarget, duosActionsReplace);

fs.writeFileSync('pages/AdminTournament.tsx', file, 'utf8');
console.log("Patched AdminTournament buttons.");
