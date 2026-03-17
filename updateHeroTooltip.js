const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

const tooltipHu = "100%-ban fizikai formában, megfogható és biztonságos aranyban tartott érték, amely mentes a papírarany (pl. ETF-ek) kockázataitól.";
const tooltipEn = "100% physically backed, tangible and secure gold, free from the counterparty risks of paper gold (e.g. ETFs).";

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.Hero) {
      data.Hero.badgeTooltip = file === 'hu.json' ? tooltipHu : tooltipEn;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  }
});
console.log('Translations updated for Hero badge tooltip!');
