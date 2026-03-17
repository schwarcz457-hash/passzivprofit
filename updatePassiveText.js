const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');

const newDescriptions = {
  'hu.json': "Szerezz akár havi 4% visszatérítést a megvásárolt aranyfelhalmozásod után.",
  'en.json': "Earn up to 4% monthly cashback on your purchased gold accumulation.",
  'de.json': "Sichern Sie sich bis zu 4 % monatliches Cashback auf Ihre erworbene Goldansammlung.",
  'es.json': "Obtén hasta un 4 % de reembolso mensual en tu acumulación de oro comprada.",
  'fr.json': "Gagnez jusqu'à 4 % de cashback mensuel sur votre accumulation d'or achetée.",
  'it.json': "Ottieni fino al 4% di cashback mensile sull'accumulo d'oro acquistato.",
  'pl.json': "Zdobądź do 4% miesięcznego zwrotu cashback na zgromadzonym zakupionym złocie.",
  'ro.json': "Câștigă până la 4% cashback lunar pe acumularea de aur achiziționat.",
  'sk.json': "Získajte až 4 % mesačný cashback na vašom nakúpenom nahromadenom zlate."
};

Object.keys(newDescriptions).forEach(file => {
  const filePath = path.join(messagesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data && data.Benefits && data.Benefits.items && data.Benefits.items.passive) {
        data.Benefits.items.passive.description = newDescriptions[file];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
    } catch (err) {
      console.error(`Error updating ${file}:`, err);
    }
  }
});

console.log('Passive descriptions updated!');
