const fs = require('fs');
const filename = process.argv[2] || 'out3.html';
const html = fs.readFileSync('d:/Projects/Grainzz/client/' + filename, 'utf8');
const regex = /src=["'](.*?)["']/g;
let match;
while ((match = regex.exec(html)) !== null) {
  if (match[1].includes('amazonaws.com') || match[1].includes('ik.imagekit.io') || match[1].includes('_next/image')) {
    console.log(match[1]);
  }
}
