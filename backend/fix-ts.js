const fs = require('fs');
const path = require('path');

const fixReq = (filePath) => {
  const absolutePath = path.join(__dirname, 'src', filePath);
  let content = fs.readFileSync(absolutePath, 'utf8');
  content = content.replace(/@Request\(\) req([,)])/g, '@Request() req: any$1');
  fs.writeFileSync(absolutePath, content);
};

// Controllers to fix req
['bank-file-templates/bank-file-templates.controller.ts',
 'banks/banks.controller.ts',
 'company-bank-accounts/company-bank-accounts.controller.ts',
 'exam-templates/exam-templates.controller.ts',
 'job-applications/job-applications.controller.ts',
 'recruitment-processes/recruitment-processes.controller.ts'].forEach(fixReq);

// Fix payroll-periods
const ppPath = path.join(__dirname, 'src/payroll-periods/payroll-periods.controller.ts');
let ppContent = fs.readFileSync(ppPath, 'utf8');
ppContent = ppContent.replace(/user\.roles\?\.some\(r =>/g, 'user.roles?.some((r: any) =>');
fs.writeFileSync(ppPath, ppContent);

// Fix ExamTemplatesModule import
const modulePath = path.join(__dirname, 'src/exam-templates/exam-templates.module.ts');
let moduleContent = fs.readFileSync(modulePath, 'utf8');
if (!moduleContent.includes('ExamTemplatesController')) {
    moduleContent = "import { ExamTemplatesController } from './exam-templates.controller';\n" + moduleContent;
} else if (!moduleContent.includes('import { ExamTemplatesController')) {
    moduleContent = "import { ExamTemplatesController } from './exam-templates.controller';\n" + moduleContent;
}
fs.writeFileSync(modulePath, moduleContent);

// Fix evaluation-instances.service.ts
const evPath = path.join(__dirname, 'src/evaluation-instances/evaluation-instances.service.ts');
let evContent = fs.readFileSync(evPath, 'utf8');
evContent = evContent.replace(/campaign\.templateId/g, 'campaign!.templateId');
fs.writeFileSync(evPath, evContent);

console.log("TS fixes applied.");
