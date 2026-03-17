const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

const tooltipEn = "The highest standard of quality, purity, and reliability set by the London Bullion Market Association, guaranteeing global acceptance.";
const tooltipHu = "A London Bullion Market Association által támasztott legszigorúbb minőségi, tisztasági és megbízhatósági szabvány, amely garantálja az aranytömbök globális elfogadottságát.";

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.TrustSignals) {
      data.TrustSignals.goodDeliveryTooltip = file === 'hu.json' ? tooltipHu : tooltipEn;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  }
});
console.log('Translations updated!');
