import fs from 'fs';
const src = "D:\\Projects\\Grainzz\\client\\.next\\cache\\images\\8T-+x1I2Yg8z-vT0XsDgEDC-XarjoJOKqduj0cx62sQ=\\60.1778274710834.8oGco4ltJewhcv8bsffYuC6oHx28Qdl68tvw3YKSTvQ=.webp";
const dest = "d:\\Projects\\Grainzz\\client\\public\\founders_2.webp";
fs.copyFileSync(src, dest);
console.log('Copied successfully');
