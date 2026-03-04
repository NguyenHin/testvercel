const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const exts = ['.js', '.ejs', '.html', '.css'];

const win1252ToChar = new Map([
    [0x80, 0x20AC], [0x82, 0x201A], [0x83, 0x0192], [0x84, 0x201E],
    [0x85, 0x2026], [0x86, 0x2020], [0x87, 0x2021], [0x88, 0x02C6],
    [0x89, 0x2030], [0x8A, 0x0160], [0x8B, 0x2039], [0x8C, 0x0152],
    [0x8E, 0x017D], [0x91, 0x2018], [0x92, 0x2019], [0x93, 0x201C],
    [0x94, 0x201D], [0x95, 0x2022], [0x96, 0x2013], [0x97, 0x2014],
    [0x98, 0x02DC], [0x99, 0x2122], [0x9A, 0x0161], [0x9B, 0x203A],
    [0x9C, 0x0153], [0x9E, 0x017E], [0x9F, 0x0178]
]);
const charToByte = new Map();
win1252ToChar.forEach((char, byte) => charToByte.set(char, byte));

function isMangled(str) {
    // Check for typical Windows-1252 misinterpreted UTF-8 Vietnamese strings
    return str.includes('Ã') ||
        str.includes('Ä') ||
        str.includes('áº') ||
        str.includes('á»') ||
        str.includes('Æ') ||
        str.includes('“'); // "“" is sometimes present from 'tồn'
}

function reverseWin1252(str) {
    const buf = Buffer.alloc(str.length);
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (charToByte.has(code)) {
            buf[i] = charToByte.get(code);
        } else if (code <= 0xFF) {
            buf[i] = code;
        } else {
            // If we encounter a character > 0xFF that wasn't created by win1252 mapping,
            // then this is either a valid Unicode string or a mixed encoding string.
            // E.g. a valid Vietnamese character like 'Đ'.
            return null;
        }
    }
    return buf.toString('utf8');
}

function fixEncoding(filePath) {
    let txt = fs.readFileSync(filePath, 'utf8');

    if (!isMangled(txt)) return;

    let hasBom = false;
    if (txt.charCodeAt(0) === 0xFEFF) {
        txt = txt.slice(1);
        hasBom = true;
    }

    const fixedContent = reverseWin1252(txt);

    if (fixedContent === null) {
        console.log(`Skipped ${filePath} - File contains valid UTF-8 characters that cannot be safely mapped back.`);
        return;
    }

    // Basic sanity check: did the reverse mapping produce replacement characters?
    if (fixedContent.includes('\uFFFD')) {
        console.log(`Skipped ${filePath} - fixing produced replacement characters (\uFFFD).`);
        return;
    }

    if (fixedContent !== txt) {
        // We write the BOM back out if it was originally there
        const outTxt = hasBom ? '\uFEFF' + fixedContent : fixedContent;
        fs.writeFileSync(filePath, outTxt, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (stat.isFile() && exts.includes(path.extname(fullPath))) {
            fixEncoding(fullPath);
        }
    }
}

console.log('Starting scan...');
scanDir(projectDir);
console.log('Finished.');
