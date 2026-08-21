const fs = require('fs');
const html = fs.readFileSync('d:/Projects/Grainzz/client/out.html', 'utf8');
const regex = /src=["'](.*?)["']/g;
let match;
while ((match = regex.exec(html)) !== null) {
  if (match[1].includes('_next/image')) {
    console.log(match[1]);
  }
}
