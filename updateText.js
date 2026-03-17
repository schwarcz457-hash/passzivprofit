const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    let data = fs.readFileSync(filePath, 'utf8');
    
    // Replace the exact hungarian string in case someone translated it directly
    data = data.replace(
      /"Regisztrálj díjmentesen, és férj hozzá a prémium vásárlási felülethez."/g,
      '"Regisztrálj, és férj hozzá a prémium vásárlási felülethez."'
    );

    // Write back
    fs.writeFileSync(filePath, data, 'utf8');
  }
});
console.log('Text updated!');
