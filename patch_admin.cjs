const fs = require('fs');
let code = fs.readFileSync('pages/Admin.tsx', 'utf8');

// Insert the state variables
const stateCode = `
    const [currencySettings, setCurrencySettings] = useState({
        subsRate: 2,
        bitsRate: 500,
        donationRate: 5,
        timePerNb: 10
    });

    useEffect(() => {
        if (stats) {
            setCurrencySettings({
                subsRate: stats.subsRate || 2,
                bitsRate: stats.bitsRate || 500,
                donationRate: stats.donationRate || 5,
                timePerNb: stats.timePerNb || 10
            });
        }
    }, [stats.subsRate, stats.bitsRate, stats.donationRate, stats.timePerNb]);

    const handleSaveCurrencySettings = async () => {
        const adminPass = localStorage.getItem('urnisa_admin_pass');
        try {
            await fetch(\`\${API_BASE_URL}/api/nisathon/settings\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': adminPass || ''
                },
                body: JSON.stringify(currencySettings)
            });
            alert('Settings saved!');
            refetchStats();
        } catch (e) {
            alert('Failed to save settings.');
        }
    };
`;

code = code.replace(/const \[snakesQueueFilter, setSnakesQueueFilter\] = useState\(''\);/, "const [snakesQueueFilter, setSnakesQueueFilter] = useState('');\n" + stateCode);

// Insert the UI
const uiCode = `
                            {/* Nisaball Currency Settings */}
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl mb-8 flex flex-col">
                                <h3 className="font-black text-white text-2xl tracking-tight mb-6">Currency Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-400 text-sm font-bold">Subs per NB</label>
                                        <input type="number" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none" value={currencySettings.subsRate} onChange={(e) => setCurrencySettings({...currencySettings, subsRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-400 text-sm font-bold">Bits per NB</label>
                                        <input type="number" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none" value={currencySettings.bitsRate} onChange={(e) => setCurrencySettings({...currencySettings, bitsRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-400 text-sm font-bold">Donation ($) per NB</label>
                                        <input type="number" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none" value={currencySettings.donationRate} onChange={(e) => setCurrencySettings({...currencySettings, donationRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-400 text-sm font-bold">Minutes per NB</label>
                                        <input type="number" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none" value={currencySettings.timePerNb} onChange={(e) => setCurrencySettings({...currencySettings, timePerNb: Number(e.target.value)})} />
                                    </div>
                                </div>
                                <button onClick={handleSaveCurrencySettings} className="mt-6 bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-6 rounded-xl transition-all self-start shadow-lg">Save Settings</button>
                            </div>

                            {/* Revamped Event Log */}`;

code = code.replace(/\{\/\* Revamped Event Log \*\/\}/, uiCode);

fs.writeFileSync('pages/Admin.tsx', code);
