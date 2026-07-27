const fs = require('fs');
let content = fs.readFileSync('pages/Shop.tsx', 'utf8');

const buyFunction = `
  const handleBuyItem = async (itemDef) => {
    if (!user) return;
    if (nisaballBalance < itemDef.price) {
      alert("Insufficient Nisaballs!");
      return;
    }
    
    try {
      const response = await fetch(\`\${DISCORD_API_URL}/api/shop/buy-item\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: user.id,
          item: {
            id: itemDef.id,
            name: itemDef.name,
            price: itemDef.price,
            type: itemDef.type, // 'hat' or 'tcg'
            rarity: itemDef.rarity || 'COMMON',
            image: itemDef.image || ''
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert(\`Successfully purchased \${itemDef.name}!\`);
        await refetch(); // refresh nisaball balance
      } else {
        alert(data.error || "Failed to purchase item.");
      }
    } catch (e) {
      alert("Error purchasing item.");
    }
  };
`;

content = content.replace("const handleSpinWheel = async () => {", buyFunction + "\n  const handleSpinWheel = async () => {");

// Replace hat buy alert 1
content = content.replace(
    /onClick=\{\(\) => alert\(`Purchasing \$\{getHatMetadata\(item\.modelId\)\?\.name \|\| item\.name\} coming soon! Daily rotation refreshes in 18 hours\.`\)\}/g,
    `onClick={() => {
                      const meta = getHatMetadata(item.modelId);
                      if (meta) {
                        handleBuyItem({ id: meta.id, name: meta.name, price: meta.price, type: 'Item', rarity: meta.rarity });
                      }
                    }}`
);

// Replace tcg buy alert
content = content.replace(
    /onClick=\{\(\) => alert\(`Purchasing \$\{pack\.year\} \$\{pack\.name\} \(\$\{pack\.cardCount\} cards\) coming soon!`\)\}/g,
    `onClick={() => handleBuyItem({ id: pack.id, name: pack.name, price: pack.price, type: 'Item', rarity: 'COMMON', image: pack.coverImage })}`
);

// Replace selected hat modal buy alert
content = content.replace(
    /onClick=\{\(\) => \{\s*const hat = getHatMetadata\(selectedHatId\);\s*alert\(`Purchasing \$\{hat\?\.name\} coming soon! Daily rotation refreshes in 18 hours\.`\);\s*\}\}/g,
    `onClick={() => {
                  const hat = getHatMetadata(selectedHatId);
                  if (hat) {
                    handleBuyItem({ id: hat.id, name: hat.name, price: hat.price, type: 'Item', rarity: hat.rarity });
                  }
                }}`
);

fs.writeFileSync('pages/Shop.tsx', content);
console.log("Patched Shop.tsx");
