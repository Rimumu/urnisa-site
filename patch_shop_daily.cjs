const fs = require('fs');
let code = fs.readFileSync('pages/Shop.tsx', 'utf-8');

const oldDailyHats = `  // Select 4 daily rotating hats deterministically based on today's date
  const [dailyHats] = useState<any[]>(() => {
    if (!availableHats || availableHats.length === 0) return [];
    
    // Seed using today's date (YYYY-MM-DD)
    const today = new Date();
    const dateStr = \`\${today.getFullYear()}-\${today.getMonth() + 1}-\${today.getDate()}\`;
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const selected = [];
    const totalHats = availableHats.length;
    const seenIndices = new Set<number>();
    
    for (let i = 0; i < 4; i++) {
      let idx = Math.abs((hash + i * 1493) % totalHats);
      // Ensure we don't have duplicates
      while (seenIndices.has(idx)) {
        idx = (idx + 1) % totalHats;
      }
      seenIndices.add(idx);
      
      const hat = availableHats[idx];
      const meta = getHatMetadata(hat.id);
      selected.push({
        ...hat,
        name: meta?.name || hat.name,
        modelId: hat.id,
        price: 1
      });
    }
    return selected;
  });`;

const newDailyHats = `  const [dailyHats, setDailyHats] = useState<any[]>([]);
  const [shopOffset, setShopOffset] = useState<number>(0);

  useEffect(() => {
    fetch(\`\${DISCORD_API_URL}/api/shop/daily-offset\`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.offset === 'number') {
           setShopOffset(data.offset);
        }
      })
      .catch(err => console.error("Failed to fetch shop offset:", err));
  }, []);

  useEffect(() => {
    if (!availableHats || availableHats.length === 0) return;
    
    // Seed using today's date (YYYY-MM-DD) + offset
    const today = new Date();
    const dateStr = \`\${today.getFullYear()}-\${today.getMonth() + 1}-\${today.getDate()}-\${shopOffset}\`;
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const selected = [];
    const totalHats = availableHats.length;
    const seenIndices = new Set<number>();
    
    for (let i = 0; i < 4; i++) {
      let idx = Math.abs((hash + i * 1493) % totalHats);
      // Ensure we don't have duplicates
      while (seenIndices.has(idx)) {
        idx = (idx + 1) % totalHats;
      }
      seenIndices.add(idx);
      
      const hat = availableHats[idx];
      const meta = getHatMetadata(hat.id);
      selected.push({
        ...hat,
        name: meta?.name || hat.name,
        modelId: hat.id,
        price: 1
      });
    }
    setDailyHats(selected);
  }, [shopOffset]);`;

code = code.replace(oldDailyHats, newDailyHats);
fs.writeFileSync('pages/Shop.tsx', code);
