const fs = require('fs');
const path = require('path');

// 1 & 2. bank-txt-generator.service.ts
const txtPath = path.join(__dirname, 'src/bank-file-templates/bank-txt-generator.service.ts');
let txtContent = fs.readFileSync(txtPath, 'utf8');
txtContent = txtContent.replace(/worker\.identificationNumber/g, 'worker.primaryIdentityNumber');
txtContent = txtContent.replace(/receipt\.totalNetPay/g, 'receipt.netPay');
fs.writeFileSync(txtPath, txtContent);

// 3. candidate-exams.controller.ts
const candCtrlPath = path.join(__dirname, 'src/candidate-exams/candidate-exams.controller.ts');
let candCtrlContent = fs.readFileSync(candCtrlPath, 'utf8');
candCtrlContent = candCtrlContent.replace(/@Request\(\) req([,)])/g, '@Request() req: any$1');
fs.writeFileSync(candCtrlPath, candCtrlContent);

// 4. candidate-exams.module.ts
const candModPath = path.join(__dirname, 'src/candidate-exams/candidate-exams.module.ts');
let candModContent = fs.readFileSync(candModPath, 'utf8');
if (!candModContent.includes('CandidateExamsController')) {
    candModContent = "import { CandidateExamsController } from './candidate-exams.controller';\n" + candModContent;
} else if (!candModContent.includes("import { CandidateExamsController")) {
    candModContent = "import { CandidateExamsController } from './candidate-exams.controller';\n" + candModContent;
}
fs.writeFileSync(candModPath, candModContent);

// 5. candidate-exams.service.ts
const candSrvPath = path.join(__dirname, 'src/candidate-exams/candidate-exams.service.ts');
let candSrvContent = fs.readFileSync(candSrvPath, 'utf8');
candSrvContent = candSrvContent.replace(/const correctOpt = parsedOptions\.find\(\(opt: any\) => opt\.isCorrect\);/g, 'const correctOpt: any = parsedOptions.find((opt: any) => opt.isCorrect);');
fs.writeFileSync(candSrvPath, candSrvContent);

console.log("Fixes phase 2 applied");
