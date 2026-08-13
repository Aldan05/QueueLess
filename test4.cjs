const fs = require('fs');
const content = fs.readFileSync('./backend/routes/auth.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('module.exports')) {
    console.log(`Line ${i + 1}: ${line}`);
  }
});
