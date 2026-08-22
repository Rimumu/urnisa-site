const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

// 1. Add adminDummyId extraction at the start of TournamentBACK
const stateTarget = `const [dbCategoryFilter, setDbCategoryFilter] = useState<'ALL' | 'STANDARD' | 'LIMIT_TOKEN' | 'LEGENDARY' | 'MYTHICAL' | 'PARADOX' | 'ULTRA_BEAST'>('ALL');`;
const stateReplace = `const [dbCategoryFilter, setDbCategoryFilter] = useState<'ALL' | 'STANDARD' | 'LIMIT_TOKEN' | 'LEGENDARY' | 'MYTHICAL' | 'PARADOX' | 'ULTRA_BEAST'>('ALL');
    const queryParams = new URLSearchParams(window.location.search);
    const adminDummyId = queryParams.get('adminDummyId');`;
if(file.includes(stateTarget)) file = file.replace(stateTarget, stateReplace);

// 2. Modify fetchMyTeam
const fetchMyTeamTarget = `const res = await fetch(\`\${API_BASE_URL}/api/tournament/my-team?discordId=\${user.id}&seasonId=\${activeSeason.seasonId}\`);`;
const fetchMyTeamReplace = `const targetId = (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user.id;
            const res = await fetch(\`\${API_BASE_URL}/api/tournament/my-team?discordId=\${targetId}&seasonId=\${activeSeason.seasonId}\`);`;
if(file.includes(fetchMyTeamTarget)) file = file.replace(fetchMyTeamTarget, fetchMyTeamReplace);

// 3. Modify saveDraft
const saveDraftTarget = `body: JSON.stringify({
                    discordId: user.id,
                    minecraftUsername: user.minecraftUsername,
                    team: teamToSave,
                    seasonId: activeSeason.seasonId,
                    gimmickType: selectedGimmick,
                    gimmickPokemonId: gimmickPokemonId
                })`;
const saveDraftReplace = `headers: { 
                    'Content-Type': 'application/json',
                    ...(user?.minecraftUsername === 'GreatRimu' && adminDummyId ? { 'x-admin-override': 'GreatRimu_Override_True' } : {})
                },
                body: JSON.stringify({
                    discordId: (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user.id,
                    minecraftUsername: (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? "DummyUser" : user.minecraftUsername,
                    team: teamToSave,
                    seasonId: activeSeason.seasonId,
                    gimmickType: selectedGimmick,
                    gimmickPokemonId: gimmickPokemonId
                })`;
if(file.includes(saveDraftTarget)) file = file.replace(`headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    minecraftUsername: user.minecraftUsername,
                    team: teamToSave,
                    seasonId: activeSeason.seasonId,
                    gimmickType: selectedGimmick,
                    gimmickPokemonId: gimmickPokemonId
                })`, saveDraftReplace);

// 4. Modify fetchMyDuo
const fetchMyDuoTarget = `const res = await fetch(\`\${API_BASE_URL}/api/tournament/my-duo?discordId=\${user.id}&seasonId=\${activeSeason.seasonId}\`);`;
const fetchMyDuoReplace = `const targetId = (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user.id;
            const res = await fetch(\`\${API_BASE_URL}/api/tournament/my-duo?discordId=\${targetId}&seasonId=\${activeSeason.seasonId}\`);`;
if(file.includes(fetchMyDuoTarget)) file = file.replace(fetchMyDuoTarget, fetchMyDuoReplace);

// 5. Modify saveDuoDraft
const saveDuoDraftTarget = `headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    duoId: myDuo.duoId,
                    team: teamToSave,
                    teamName: nameToSave !== undefined ? nameToSave : teamName
                })`;
const saveDuoDraftReplace = `headers: { 
                    'Content-Type': 'application/json',
                    ...(user?.minecraftUsername === 'GreatRimu' && adminDummyId ? { 'x-admin-override': 'GreatRimu_Override_True' } : {})
                },
                body: JSON.stringify({
                    discordId: (user?.minecraftUsername === 'GreatRimu' && adminDummyId) ? adminDummyId : user.id,
                    duoId: myDuo.duoId,
                    team: teamToSave,
                    teamName: nameToSave !== undefined ? nameToSave : teamName
                })`;
if(file.includes(saveDuoDraftTarget)) file = file.replace(saveDuoDraftTarget, saveDuoDraftReplace);

fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
console.log("Patched override IDs.");
