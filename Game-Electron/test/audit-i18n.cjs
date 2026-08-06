// audit-i18n.js - Quick i18n audit
const fs = require('fs');
const path = require('path');

const ZH = JSON.parse(fs.readFileSync('G:/Hermes项目/card-game-design/Game-Electron/src/i18n/zh-CN.json', 'utf8'));
const EN = JSON.parse(fs.readFileSync('G:/Hermes项目/card-game-design/Game-Electron/src/i18n/en-US.json', 'utf8'));

function flatten(obj, prefix = '') {
  const result = {};
  for (const k in obj) {
    const path = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(result, flatten(obj[k], path));
    } else {
      result[path] = obj[k];
    }
  }
  return result;
}

const zhFlat = flatten(ZH);
const enFlat = flatten(EN);

const zhKeys = Object.keys(zhFlat);
const enKeys = Object.keys(enFlat);

console.log('=== i18n Audit ===');
console.log('zh-CN keys:', zhKeys.length);
console.log('en-US keys:', enKeys.length);

// Missing in en-US
const missingInEn = zhKeys.filter(k => !enFlat[k]);
console.log('\nMissing in en-US:', missingInEn.length);
if (missingInEn.length) {
  missingInEn.forEach(k => console.log('  ' + k + ' = ' + JSON.stringify(zhFlat[k]).slice(0, 50)));
}

// Extra in en-US (not in zh-CN)
const extraInEn = enKeys.filter(k => !zhFlat[k]);
console.log('\nExtra in en-US:', extraInEn.length);
if (extraInEn.length) {
  extraInEn.forEach(k => console.log('  ' + k + ' = ' + JSON.stringify(enFlat[k]).slice(0, 50)));
}

// en-US values containing Chinese
const CJK = /[\u4e00-\u9fff]/;
const enWithChinese = enKeys.filter(k => CJK.test(String(enFlat[k])));
console.log('\nen-US values with CJK chars:', enWithChinese.length);
if (enWithChinese.length) {
  enWithChinese.forEach(k => console.log('  ' + k + ' = ' + JSON.stringify(enFlat[k])));
}

// en-US values that look like raw keys (contain "ui." or "log.")
const rawKeyPattern = /(\bui\.[a-z_]+\b|\blog\.[a-z_]+\b)/;
const enRawKeys = enKeys.filter(k => rawKeyPattern.test(String(enFlat[k])));
console.log('\nen-US values with raw i18n key patterns:', enRawKeys.length);
if (enRawKeys.length) {
  enRawKeys.forEach(k => console.log('  ' + k + ' = ' + JSON.stringify(enFlat[k])));
}

// Placeholder mismatch check
const placeholderPattern = /\{(\w+)\}/g;
const placeholders = (s) => {
  const m = {};
  let match;
  while ((match = placeholderPattern.exec(s)) !== null) {
    m[match[1]] = (m[match[1]] || 0) + 1;
  }
  return m;
};
const placeholderMismatch = [];
for (const k of zhKeys) {
  if (!enFlat[k]) continue;
  const zhPlaceholders = placeholders(String(zhFlat[k]));
  const enPlaceholders = placeholders(String(enFlat[k]));
  const allKeys = new Set([...Object.keys(zhPlaceholders), ...Object.keys(enPlaceholders)]);
  for (const p of allKeys) {
    if (zhPlaceholders[p] !== enPlaceholders[p]) {
      placeholderMismatch.push({ key: k, placeholder: p, zh: zhPlaceholders[p] || 0, en: enPlaceholders[p] || 0 });
    }
  }
}
console.log('\nPlaceholder mismatches:', placeholderMismatch.length);
if (placeholderMismatch.length) {
  placeholderMismatch.slice(0, 20).forEach(m => {
    console.log('  ' + m.key + ' { ' + m.placeholder + ' } zh=' + m.zh + ' en=' + m.en);
  });
}

// en-US values that contain 'undefined' or 'null' or 'NaN'
const suspicious = enKeys.filter(k => /\b(undefined|null|NaN)\b/.test(String(enFlat[k])));
console.log('\nen-US values with suspicious tokens:', suspicious.length);
if (suspicious.length) {
  suspicious.forEach(k => console.log('  ' + k + ' = ' + JSON.stringify(enFlat[k])));
}

// Summary
console.log('\n=== Summary ===');
console.log('zh-CN total keys:', zhKeys.length);
console.log('en-US total keys:', enKeys.length);
console.log('Missing in en-US:', missingInEn.length);
console.log('Extra in en-US:', extraInEn.length);
console.log('en-US with CJK chars:', enWithChinese.length);
console.log('en-US with raw key patterns:', enRawKeys.length);
console.log('Placeholder mismatches:', placeholderMismatch.length);
console.log('en-US with suspicious tokens:', suspicious.length);