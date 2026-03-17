const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

const vaultsTooltipHu = "Közvetlenül és etikusan kitermelt arany Ghána legmegbízhatóbb bányáiból, biztosítva a származás teljes nyomon követhetőségét.";
const vaultsTooltipEn = "Directly and ethically sourced gold from Ghana's most reliable mines, ensuring complete traceability of origin.";

const auditTooltipHu = "Minden tranzakciót és készletet rendszeresen, független nemzetközi könyvvizsgáló cégek ellenőriznek a 100%-os átláthatóság érdekében.";
const auditTooltipEn = "All transactions and inventory are regularly verified by independent international auditing firms to ensure 100% transparency.";

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.TrustSignals) {
      data.TrustSignals.vaultsTooltip = file === 'hu.json' ? vaultsTooltipHu : vaultsTooltipEn;
      data.TrustSignals.auditTooltip = file === 'hu.json' ? auditTooltipHu : auditTooltipEn;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  }
});
console.log('Translations updated for new tooltips!');
