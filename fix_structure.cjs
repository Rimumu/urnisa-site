const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

const overlayMatch = content.match(/(\{\(stage === 'focus_crate' \|\| stage === 'pre_opening'\) && \([\s\S]*?<\/div>\s*\)\})/);

if (overlayMatch) {
    const overlayStr = overlayMatch[1];
    // Remove it from its current position
    content = content.replace(overlayStr, '');
    
    // Find the end of the selection view
    // The selection view ends with </div></div>}
    const selectionEndMatch = content.match(/(\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\})/);
    if (selectionEndMatch) {
        const insertIndex = selectionEndMatch.index + selectionEndMatch[1].length;
        content = content.substring(0, insertIndex) + '\n' + overlayStr + '\n' + content.substring(insertIndex);
    }
}

fs.writeFileSync('pages/GachaDev.tsx', content);
