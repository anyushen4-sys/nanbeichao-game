// Brace checker for index.html
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || 'src/index.html', 'utf-8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const lines = code.split('\n');

// 简单方法: 只看每行的花括号数
let depth = 0, minDepth = 0;
let minLine = 0;
for (let i = 0; i < lines.length; i++) {
  const opens = (lines[i].match(/{/g) || []).length;
  const closes = (lines[i].match(/}/g) || []).length;
  depth += opens - closes;
  if (depth < minDepth) { minDepth = depth; minLine = i + 1; }
}
console.log('Final depth:', depth, 'Min depth:', minDepth, '@line', minLine);

// If positive: one extra {
if (depth > 0) {
  // Find lines where open > close
  console.log('Looking for extra {');
  // Walk backwards to find deepest unmatched
  let d2 = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const opens = (lines[i].match(/{/g) || []).length;
    const closes = (lines[i].match(/}/g) || []).length;
    d2 += closes - opens;
    if (d2 > 0) {
      console.log('Extra open at line', i+1, ':', lines[i].trim().substring(0, 80));
      break;
    }
  }
}

if (depth < 0) {
  // Find where the extra close is
  console.log('Finding extra close...');
  let d3 = 0;
  for (let i = 0; i < lines.length; i++) {
    const opens = (lines[i].match(/{/g) || []).length;
    const closes = (lines[i].match(/}/g) || []).length;
    d3 += opens - closes;
    if (d3 < 0) {
      console.log('Extra close at line', i+1, ':', lines[i].trim().substring(0, 80));
      break;
    }
  }
}