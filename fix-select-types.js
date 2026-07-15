const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/components/admin/settings';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace onValueChange={setSomething} with onValueChange={(v) => setSomething(v || "")}
  const regex = /onValueChange=\{set([A-Za-z0-9_]+)\}/g;
  let modified = false;
  
  content = content.replace(regex, (match, p1) => {
    modified = true;
    return `onValueChange={(v) => set${p1}(v || "")}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${file}`);
  }
}
