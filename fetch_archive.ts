import fs from "fs";

async function run() {
    try {
        const statsRes = await fetch("https://urnisa-backend-21ls.onrender.com/api/nisathon/stats");
        const stats = await statsRes.json();

        const leaderboardRes = await fetch("https://urnisa-backend-21ls.onrender.com/api/nisathon/leaderboard");
        const leaderboard = await leaderboardRes.json();

        const eventsRes = await fetch("https://urnisa-backend-21ls.onrender.com/api/nisathon/recent?limit=500");
        const events = await eventsRes.json();
        
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        
        fs.writeFileSync('data/nisathon-archive.json', JSON.stringify({ stats, leaderboard, events }, null, 2));
        console.log('Successfully saved to data/nisathon-archive.json');
    } catch (e) {
        console.error(e);
    }
}

run();
