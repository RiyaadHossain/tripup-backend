const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'modules');

const controllers = [
  'travel-service/controllers/admin-travel-services.controller.ts',
  'travel-service/controllers/admin-service-categories.controller.ts',
  'testimonials/controllers/admin-testimonials.controller.ts',
  'travel-insight/controllers/admin-travel-insight.controller.ts',
  'travel-insight/controllers/admin-travel-insight-categories.controller.ts',
  'team-members/controllers/admin-team-members.controller.ts',
  'case-studies/controllers/admin-case-studies.controller.ts',
  'case-studies/controllers/admin-case-study-categories.controller.ts',
  'guides-playbooks/controllers/admin-playbooks.controller.ts',
  'guides-playbooks/controllers/admin-playbook-types.controller.ts',
  'guides-playbooks/controllers/admin-playbook-categories.controller.ts'
];

const services = [
  'travel-service/services/travel-services.service.ts',
  'travel-service/services/service-categories.service.ts',
  'testimonials/services/testimonials.service.ts',
  'travel-insight/services/travel-insight.service.ts',
  'travel-insight/services/travel-insight-categories.service.ts',
  'team-members/services/team-members.service.ts',
  'case-studies/services/case-studies.service.ts',
  'case-studies/services/case-study-categories.service.ts',
  'guides-playbooks/services/playbooks.service.ts',
  'guides-playbooks/services/playbook-types.service.ts',
  'guides-playbooks/services/playbook-categories.service.ts'
];

// Update controllers
for (const file of controllers) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('CurrentUser')) {
    content = content.replace(/(import {.*} from '@nestjs\/common';)/s, `$1\nimport { CurrentUser } from 'src/common/decorators/current-user.decorator';`);
  }
  
  // Replace create(@Body() dto: CreateXYZDto) with create(@Body() dto: CreateXYZDto, @CurrentUser('sub') userId: string)
  content = content.replace(/create\s*\(\s*@Body\(\)\s*dto:\s*([A-Za-z]+Dto)\s*\)\s*\{/g, `create(@Body() dto: $1, @CurrentUser('sub') userId: string) {`);
  // Update the service call inside create method
  content = content.replace(/this\.(.*?)\.create\(\s*dto\s*\)/g, `this.$1.create(dto, userId)`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}

// Update services
for (const file of services) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace async create(dto: CreateXYZDto) { with async create(dto: CreateXYZDto, userId: string) {
  content = content.replace(/async\s+create\s*\(\s*dto:\s*([A-Za-z]+Dto)\s*\)\s*\{/g, `async create(dto: $1, userId: string) {`);
  
  // Now add addedById: userId inside the data block of this.prisma.model.create({ data: { ... } })
  // We look for Prisma model create calls that are likely in the create method.
  // E.g. data: {\n ...
  // We can do it by finding data: { and adding addedById: userId, just after it, BUT ONLY inside the create method.
  // Better approach: regex to replace data: { with data: { \n addedById: userId, 
  // ONLY for the first occurrence which is usually in the create method, or we do a global replace for the first one.
  // A simple hack for our specific codebase is: 
  const regex = /create\s*\(\s*\{\s*data\s*:\s*\{/g;
  content = content.replace(regex, `create({ data: { addedById: userId,`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
