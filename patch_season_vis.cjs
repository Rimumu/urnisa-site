const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

const targetUseEffect = `    useEffect(() => {
        // Fetch all seasons
        fetch(\`\${API_BASE_URL}/api/tournament/seasons\`)
            .then(res => res.json())
            .then(seasons => {
                if (Array.isArray(seasons) && seasons.length > 0) {
                    setAllSeasons(seasons);
                    // Find active (unarchived) season, or fallback to the latest season (e.g. if ended/archived)
                    // (Note: we don't strictly filter activeSeason by isHidden here because user might be null initially. We rely on the selector to hide it)
                    const active = seasons.find((s: any) => !s.isArchived && !s.isHidden) || seasons.find((s: any) => !s.isArchived) || seasons[0];
                    setActiveSeason(active);
                    setTournamentStatus(active.status || 'DRAFTING');
                } else {
                    const fallbackSeason = { seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING', isArchived: false, challongeUrl: '' };
                    setAllSeasons([fallbackSeason]);
                    setActiveSeason(fallbackSeason);
                    setTournamentStatus('DRAFTING');
                }
            })
            .catch(e => console.error("Failed to fetch seasons", e));
    }, []);`;

const replaceUseEffect = `    useEffect(() => {
        // Fetch all seasons
        fetch(\`\${API_BASE_URL}/api/tournament/seasons\`)
            .then(res => res.json())
            .then(seasons => {
                if (Array.isArray(seasons) && seasons.length > 0) {
                    setAllSeasons(seasons);
                    // We'll just set it to the first non-archived non-hidden by default
                    // But if they are admin, they can see hidden ones. Let's do a basic initial find:
                    const active = seasons.find((s: any) => !s.isArchived && !s.isHidden) || seasons.find((s: any) => !s.isHidden) || seasons[0];
                    setActiveSeason(active);
                    setTournamentStatus(active.status || 'DRAFTING');
                } else {
                    const fallbackSeason = { seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING', isArchived: false, challongeUrl: '' };
                    setAllSeasons([fallbackSeason]);
                    setActiveSeason(fallbackSeason);
                    setTournamentStatus('DRAFTING');
                }
            })
            .catch(e => console.error("Failed to fetch seasons", e));
    }, []);

    // Effect to enforce season visibility when user state changes
    useEffect(() => {
        if (allSeasons.length > 0 && activeSeason) {
            const isAdmin = user?.minecraftUsername === 'GreatRimu' || adminDummyId !== null;
            if (activeSeason.isHidden && !isAdmin) {
                // Find a fallback season that they CAN see
                const visibleSeasons = allSeasons.filter((s: any) => !s.isHidden);
                if (visibleSeasons.length > 0) {
                    const active = visibleSeasons.find((s: any) => !s.isArchived) || visibleSeasons[0];
                    setActiveSeason(active);
                    setTournamentStatus(active.status || 'DRAFTING');
                }
            }
        }
    }, [user, activeSeason, allSeasons, adminDummyId]);`;

file = file.replace(targetUseEffect, replaceUseEffect);
fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
console.log("Patched season visibility logic");
