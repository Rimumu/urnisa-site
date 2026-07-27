const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

// 1. Change the grid condition so it stays mounted
content = content.replace("{stage === 'selection' && (", "{(stage === 'selection' || stage === 'focus_crate' || stage === 'pre_opening') && (");

// 2. Remove the lamb crate "Click to unlock" section
const lambKeySection = `<div className={\`mt-4 font-bold tracking-widest uppercase flex items-center gap-2 \${keys.lambKeys > 0 ? 'text-amber-500' : 'text-gray-500'}\`}>
                                        {keys.lambKeys > 0 ? (
                                            <>Click to Unlock <span className="text-xs">({keys.lambKeys} Keys)</span></>
                                        ) : (
                                            'Requires Lamb Key'
                                        )}
                                    </div>`;
content = content.replace(lambKeySection, '');

// 3. Remove the steak crate "Click to unlock" section
const steakKeySection = `<div className={\`mt-4 font-bold tracking-widest uppercase flex items-center gap-2 \${keys.steakKeys > 0 ? 'text-[#fbbf24]' : 'text-gray-500'}\`}>
                                        {keys.steakKeys > 0 ? (
                                            <>Click to Unlock <span className="text-xs">({keys.steakKeys} Keys)</span></>
                                        ) : (
                                            'Requires Steak Key'
                                        )}
                                    </div>`;
content = content.replace(steakKeySection, '');

fs.writeFileSync('pages/GachaDev.tsx', content);
