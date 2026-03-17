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
      /"Nézd, ahogy gyarapszik a vagyonod az 5-8% éves értéknövekedéssel és a 10% hűségbónusszal\."/g,
      '"Nézd, ahogy gyarapszik a vagyonod az 3-6 éves visszatérítéssel és értéknövekedéssel."'
    );

    // Write back
    fs.writeFileSync(filePath, data, 'utf8');
  }
});
console.log('Text updated again 3!');
