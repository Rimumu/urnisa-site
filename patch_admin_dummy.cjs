const fs = require('fs');
let file = fs.readFileSync('pages/Tournament.tsx', 'utf8');

const targetSelect = `        let validIndices = [0, 1, 2, 3, 4, 5];
        if (activeSeason.format.includes('Doubles Duos') && myDuo) {
            if (myDuo.player1DiscordId === user?.id) {
                validIndices = [0, 1, 2];
            } else if (myDuo.player2DiscordId === user?.id) {
                validIndices = [3, 4, 5];
            }
        }`;

const replaceSelect = `        let validIndices = [0, 1, 2, 3, 4, 5];
        if (activeSeason.format.includes('Doubles Duos') && myDuo) {
            if (user?.minecraftUsername === 'GreatRimu') {
                validIndices = [0, 1, 2, 3, 4, 5];
            } else if (myDuo.player1DiscordId === user?.id) {
                validIndices = [0, 1, 2];
            } else if (myDuo.player2DiscordId === user?.id) {
                validIndices = [3, 4, 5];
            }
        }`;

file = file.replace(targetSelect, replaceSelect);

const targetRemove = `        if (activeSeason.format.includes('Doubles Duos') && myDuo) {
            if (myDuo.player1DiscordId === user?.id && index >= 3) return;
            if (myDuo.player2DiscordId === user?.id && index < 3) return;
        }`;

const replaceRemove = `        if (activeSeason.format.includes('Doubles Duos') && myDuo) {
            if (user?.minecraftUsername !== 'GreatRimu') {
                if (myDuo.player1DiscordId === user?.id && index >= 3) return;
                if (myDuo.player2DiscordId === user?.id && index < 3) return;
            }
        }`;

file = file.replace(targetRemove, replaceRemove);

fs.writeFileSync('pages/Tournament.tsx', file, 'utf8');
console.log("Patched admin logic!");
