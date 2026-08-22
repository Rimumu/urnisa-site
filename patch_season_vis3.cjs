const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

const oldLine1 = `// (Note: we don't strictly filter activeSeason by isHidden here because user might be null initially. We rely on the selector to hide it)
                    const active = seasons.find((s: any) => !s.isArchived && !s.isHidden) || seasons.find((s: any) => !s.isArchived) || seasons[0];`;

const newLine1 = `// We do strictly filter by isHidden here so it defaults safely for non-admins
                    const active = seasons.find((s: any) => !s.isArchived && !s.isHidden) || seasons.find((s: any) => !s.isHidden) || seasons[0];`;

const oldLine2 = `    // Refetch data when season changes
    useEffect(() => {
        if (activeSeason.seasonId) {`;

const newLine2 = `    // Effect to enforce season visibility when user state changes
    useEffect(() => {
        if (allSeasons.length > 0 && activeSeason) {
            const isAdmin = user?.minecraftUsername === 'GreatRimu' || adminDummyId !== null;
            if (activeSeason.isHidden && !isAdmin) {
                // Find a fallback season that they CAN see
                const visibleSeasons = allSeasons.filter(s => !s.isHidden);
                if (visibleSeasons.length > 0) {
                    const active = visibleSeasons.find(s => !s.isArchived) || visibleSeasons[0];
                    setActiveSeason(active);
                    setTournamentStatus(active.status || 'DRAFTING');
                }
            }
        }
    }, [user, activeSeason, allSeasons, adminDummyId]);

    // Refetch data when season changes
    useEffect(() => {
        if (activeSeason.seasonId) {`;

if (file.includes(oldLine1) && file.includes(oldLine2)) {
    file = file.replace(oldLine1, newLine1);
    file = file.replace(oldLine2, newLine2);
    fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
    console.log("Patched season visibility logic successfully.");
} else {
    console.log("Could not find the target strings!");
    console.log("oldLine1 found?", file.includes(oldLine1));
    console.log("oldLine2 found?", file.includes(oldLine2));
}
