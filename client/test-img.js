const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const imgRegex = /<img[^>]+>/g;
    const matches = data.match(imgRegex);
    if (matches) {
      matches.forEach(m => console.log(m));
    } else {
      console.log('No images found');
    }
  });
}).on('error', err => console.log(err.message));
