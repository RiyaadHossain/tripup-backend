const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'modules');

const services = [
  'testimonials/services/testimonials.service.ts',
  'travel-insight/services/travel-insight.service.ts',
  'travel-insight/services/travel-insight-categories.service.ts',
  'case-studies/services/case-study.service.ts',
  'case-studies/services/case-study-categories.service.ts',
  'guides-playbooks/services/playbooks.service.ts',
  'guides-playbooks/services/playbook-types.service.ts',
  'guides-playbooks/services/playbook-categories.service.ts',
  'travel-service/services/service-categories.service.ts',
  'travel-service/services/travel-services.service.ts',
  'team-members/services/team-members.service.ts',
  'roles/roles.service.ts'
];

for (const file of services) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace addedById: userId with addedBy: userId ? { connect: { id: userId } } : undefined
  content = content.replace(/addedById:\s*userId,?/g, `addedBy: userId ? { connect: { id: userId } } : undefined,`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
