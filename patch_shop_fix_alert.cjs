const fs = require('fs');
let content = fs.readFileSync('pages/Shop.tsx', 'utf8');

// There's one more alert I might have missed if there are 2 places for TCG Packs.
// Let's make sure.
content = content.replace(
    /onClick=\{\(\) => alert\(`Purchasing \$\{getHatMetadata\(item\.modelId\)\?\.name \|\| item\.name\} coming soon! Daily rotation refreshes in 18 hours\.`\)\}/g,
    `onClick={() => {
                      const meta = getHatMetadata(item.modelId);
                      if (meta) {
                        handleBuyItem({ id: meta.id, name: meta.name, price: meta.price, type: 'Item', rarity: meta.rarity });
                      }
                    }}`
);
fs.writeFileSync('pages/Shop.tsx', content);
