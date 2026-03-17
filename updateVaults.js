const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

const newVaultTextHu = "Ghanai bányából kitermelt";
const newVaultTextEn = "Mined from Ghanaian mines";

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.TrustSignals) {
      data.TrustSignals.vaults = file === 'hu.json' ? newVaultTextHu : newVaultTextEn;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  }
});
console.log('Translations updated for vaults text!');
