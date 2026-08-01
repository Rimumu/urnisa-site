const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf8');

const wipeCode = `
// ONE-TIME WIPE INJECTED BY AI
setTimeout(async () => {
    try {
        console.log("Running one-time tournament wipe for clean start...");
        const activeSeasons = await TournamentSeason.find({ isArchived: { $ne: true } });
        const activeSeasonIds = activeSeasons.map(s => s.seasonId);

        await TournamentEntry.deleteMany({ seasonId: { $in: activeSeasonIds } });
        await TournamentBracket.deleteMany({ seasonId: { $in: activeSeasonIds } });
        
        const activeDuos = await TournamentDuo.find({ seasonId: { $in: activeSeasonIds } });
        const activeDuoIds = activeDuos.map(d => d.duoId);
        
        await DuoPartyData.deleteMany({ duoId: { $in: activeDuoIds } });
        await TournamentDuo.deleteMany({ seasonId: { $in: activeSeasonIds } });
        await TournamentSeason.deleteMany({ isArchived: { $ne: true } });
        
        console.log("Tournament data successfully wiped for clean start.");
    } catch (e) {
        console.error("Failed to wipe tournament data", e);
    }
}, 5000);
`;

if (!code.includes("ONE-TIME WIPE INJECTED BY AI")) {
    code = code.replace("if (MONGO_URI) setTimeout(initDefaultSeason, 3000);", "if (MONGO_URI) setTimeout(initDefaultSeason, 3000);\n" + wipeCode);
    fs.writeFileSync('backend-references/urnisa-backend/server.js', code);
    console.log("Patched server.js with wipe code.");
} else {
    console.log("Already patched.");
}
