const fs = require('fs');

let content = fs.readFileSync('pages/Shop.tsx', 'utf8');

// 1. Add state for purchaseConfirmationItem
if (!content.includes('purchaseConfirmationItem')) {
    content = content.replace(
        "const [purchaseResult, setPurchaseResult] = useState<{ status: 'success' | 'error', message: string, itemName?: string } | null>(null);",
        "const [purchaseResult, setPurchaseResult] = useState<{ status: 'success' | 'error', message: string, itemName?: string } | null>(null);\n  const [purchaseConfirmationItem, setPurchaseConfirmationItem] = useState<any>(null);"
    );
}

// 2. Replace handleBuyItem with the new logic
const oldHandleBuyItem = `  const handleBuyItem = async (itemDef) => {
    if (!user) return;
    if (nisaballBalance < itemDef.price) {
      setPurchaseResult({ status: 'error', message: "Insufficient Nisaballs! You don't have enough to buy this item." });
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
        setPurchaseResult({ status: 'success', message: \`Successfully purchased \${itemDef.name}!\`, itemName: itemDef.name });
        await refetch(); // refresh nisaball balance
      } else {
        setPurchaseResult({ status: 'error', message: data.error || "Failed to purchase item." });
      }
    } catch (e) {
      setPurchaseResult({ status: 'error', message: "Error purchasing item. Please try again later." });
    }
  };`;

const newHandleBuyItem = `  const handleBuyItem = (itemDef) => {
    if (!user) return;
    if (nisaballBalance < itemDef.price) {
      setPurchaseResult({ status: 'error', message: "Insufficient Nisaballs! You don't have enough to buy this item." });
      return;
    }
    setPurchaseConfirmationItem(itemDef);
  };

  const confirmPurchase = async () => {
    if (!user || !purchaseConfirmationItem) return;
    const itemDef = purchaseConfirmationItem;
    
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
            type: itemDef.type,
            rarity: itemDef.rarity || 'COMMON',
            image: itemDef.image || ''
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (selectedHatId) setSelectedHatId(null);
        setPurchaseResult({ status: 'success', message: \`Successfully purchased \${itemDef.name}!\`, itemName: itemDef.name });
        await refetch();
      } else {
        setPurchaseResult({ status: 'error', message: data.error || "Failed to purchase item." });
      }
    } catch (e) {
      setPurchaseResult({ status: 'error', message: "Error purchasing item. Please try again later." });
    }
    setPurchaseConfirmationItem(null);
  };`;

content = content.replace(oldHandleBuyItem, newHandleBuyItem);

// 3. Add the modal rendering logic right before the closing </div> of the main return
const modalHtml = `
      {/* Purchase Confirmation Modal */}
      {purchaseConfirmationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[2.5rem] max-w-sm w-full p-6 relative shadow-2xl flex flex-col items-center text-center">
            
            <button
              onClick={() => setPurchaseConfirmationItem(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 z-50"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-white tracking-tight mt-2 mb-1">Confirm Purchase</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">Are you sure you want to buy this item?</p>

            {purchaseConfirmationItem.image ? (
              <img src={purchaseConfirmationItem.image} alt={purchaseConfirmationItem.name} className="w-32 h-32 object-contain mb-4 rounded-xl shadow-lg border border-white/10" />
            ) : (
              <div className="w-32 h-32 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center mb-4">
                <span className="text-5xl">🛒</span>
              </div>
            )}

            <h4 className="text-xl font-bold text-white mb-2">{purchaseConfirmationItem.name}</h4>
            
            <div className="flex items-center gap-2 mb-6 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Price:</span>
              <span className="font-black font-mono text-lg text-yellow-300">{purchaseConfirmationItem.price}</span>
              <img 
                src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                alt="NB" 
                className="w-5 h-5 object-contain" 
              />
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={() => setPurchaseConfirmationItem(null)}
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-900/20 border border-green-400 flex items-center justify-center gap-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

content = content.replace(/    <\/div>\s*  \);\s*};\s*export default Shop;/, modalHtml + "\n\nexport default Shop;");

fs.writeFileSync('pages/Shop.tsx', content);
console.log("Patched Shop.tsx with confirmation popup.");
