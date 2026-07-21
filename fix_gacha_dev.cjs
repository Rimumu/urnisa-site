const fs = require('fs');

let code = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

// Change initial state
code = code.replace(/const \[keys, setKeys\] = useState\(\{ lambKeys: 0, steakKeys: 0 \}\);/, 'const [keys, setKeys] = useState({ lambKeys: 999, steakKeys: 999 });');

// Remove the useEffect fetch
code = code.replace(/useEffect\(\(\) => \{\s*if \(user\?.id\) \{\s*fetch[^{]*\{[\s\S]*?catch\(console\.error\);\s*\}\s*\}, \[user\]\);/, '');

// Replace saveToInventory
code = code.replace(/const saveToInventory = async \(card: CardData, crateType: CrateType\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\("Auto-save failed", e\);\s*\}\s*\};/, 'const saveToInventory = async (card: CardData, crateType: CrateType) => {};');

// Replace handleOpenCrate
const newHandleOpen = `const handleOpenCrate = async (type: CrateType) => {
        if (!type) return;
        setProcessing(true);
        setTimeout(() => {
            if (type === 'lamb') setKeys(k => ({ ...k, lambKeys: k.lambKeys - 1 }));
            else setKeys(k => ({ ...k, steakKeys: k.steakKeys - 1 }));

            setSelectedCrate(type);
            const pool = type === 'lamb' ? LAMB_POOL : WAGYU_POOL;
            setCurrentPool(pool);
            
            const winner = getRandomCard(pool);
            setWinningCard(winner);
            setSpinnerItems(generateSpinnerItems(pool, winner));
            
            setStage('opening');
            setProcessing(false);
        }, 100);
    };`;
code = code.replace(/const handleOpenCrate = async \(type: CrateType\) => \{[\s\S]*?finally \{\s*setProcessing\(false\);\s*\}\s*\};/, newHandleOpen);

// Replace resetGame
const newResetGame = `const resetGame = () => {
        setStage('selection');
        setSelectedCrate(null);
        setCurrentPool([]);
        setSpinnerItems([]);
        setWinningCard(null);
    };`;
code = code.replace(/const resetGame = \(\) => \{[\s\S]*?\}\s*\};/, newResetGame);

fs.writeFileSync('pages/GachaDev.tsx', code);
