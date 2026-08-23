const fs = require('fs');
const html = fs.readFileSync('src/index.html', 'utf8');

// Find inline <script>...</script> blocks (NOT the ones with src=)
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m;
let blockIdx = 0;
while ((m = re.exec(html)) !== null) {
  blockIdx++;
  const code = m[1];
  try {
    new Function(code);
    console.log('SYNTAX OK: block', blockIdx, 'size', code.length, 'chars');
  } catch (e) {
    console.error('SYNTAX FAIL: block', blockIdx, '-', e.message);
    // Try to find approximate line number
    const before = html.substring(0, m.index);
    const lineNum = (before.match(/\n/g) || []).length + 1;
    console.error('  approximate line:', lineNum);
    process.exit(1);
  }
}
console.log('Total inline <script> blocks checked:', blockIdx);
