const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    let data = fs.readFileSync(filePath, 'utf8');
    
    // Replace the exact hungarian string
    data = data.replace(
      /"Kezdj el rendszeres euró\/forint megtakarítással törtaranyat vásárolni havi szinten\."/g,
      '"Kezdj el rendszeres euró/forint megtakarítással törtaranyat vásárolni havi szinten, vagy alkalmanként."'
    );

    // Write back
    fs.writeFileSync(filePath, data, 'utf8');
  }
});
console.log('Text updated again!');
