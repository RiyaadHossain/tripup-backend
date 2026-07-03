const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'modules');

const services = [
  'testimonials/services/testimonials.service.ts',
  'travel-insight/services/travel-insight.service.ts',
  'travel-insight/services/travel-insight-categories.service.ts',
  'case-studies/services/case-study-categories.service.ts',
  'guides-playbooks/services/playbooks.service.ts',
  'guides-playbooks/services/playbook-types.service.ts',
  'guides-playbooks/services/playbook-categories.service.ts',
  'travel-service/services/service-categories.service.ts',
  'travel-service/services/travel-services.service.ts',
  'team-members/services/team-members.service.ts'
];

for (const file of services) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Find this.repository.create(dto) and replace with this.repository.create({ ...dto, addedById: userId })
  content = content.replace(/this\.repository\.create\(\s*dto\s*\)/g, `this.repository.create({ ...dto, addedById: userId })`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
