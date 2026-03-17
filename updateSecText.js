const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');

const newDescriptions = {
  'hu.json': "100%-ban fizikai formában, értékbiztosított trezorokban tárolva.",
  'en.json': "Stored 100% in physical form in fully insured vaults.",
  'de.json': "Zu 100 % in physischer Form in voll versicherten Tresoren gelagert.",
  'es.json': "Almacenado 100% en forma física en bóvedas totalmente aseguradas.",
  'fr.json': "Stocké à 100 % sous forme physique dans des coffres-forts entièrement assurés.",
  'it.json': "Conservato al 100% in forma fisica in caveau completamente assicurati.",
  'pl.json': "Przechowywane w 100% w formie fizycznej we w pełni ubezpieczonych skarbcach.",
  'ro.json': "Stocat 100% în formă fizică în seifuri complet asigurate.",
  'sk.json': "Skladované 100 % vo fyzickej forme v plne poistených trezoroch."
};

Object.keys(newDescriptions).forEach(file => {
  const filePath = path.join(messagesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data && data.Benefits && data.Benefits.items && data.Benefits.items.security) {
        data.Benefits.items.security.description = newDescriptions[file];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
    } catch (err) {
      console.error(`Error updating ${file}:`, err);
    }
  }
});

console.log('Descriptions updated!');
