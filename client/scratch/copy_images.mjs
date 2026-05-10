import fs from 'fs';
import path from 'path';

const src1 = "D:\\Download DATA\\Gemini_Generated_Image_s919mls919mls919 1.png";
const src2 = "D:\\Download DATA\\Gemini_Generated_Image_s919mls919mls919 2.png";
const src3 = "D:\\Download DATA\\Gemini_Generated_Image_s919mls919mls919 1 (1).png";

const destDir = "d:\\Projects\\Grainzz\\client\\public";

try {
  fs.copyFileSync(src1, path.join(destDir, "story-1.png"));
  console.log("Copied 1");
  fs.copyFileSync(src2, path.join(destDir, "story-2.png"));
  console.log("Copied 2");
  fs.copyFileSync(src3, path.join(destDir, "story-3.png"));
  console.log("Copied 3");
} catch (err) {
  console.error(err);
}
