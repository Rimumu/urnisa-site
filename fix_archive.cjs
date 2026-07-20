const fs = require('fs');

const code = `
import React from 'react';
const ArchiveNisathon: React.FC = () => {
    return <div className="text-white p-10 text-center text-xl">Archive Dashboard (Under Construction)</div>;
};
export default ArchiveNisathon;
`;
fs.writeFileSync('pages/ArchiveNisathon.tsx', code);
