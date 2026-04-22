import sys
import re

file_path = '/home/lzambrano/Desarrollo/nomina/backend/src/payroll-engine/payroll-engine.service.ts'

with open(file_path, 'r') as f:
    orig = f.read()

# Match the loop:
pattern = r"(    for \(const record of \(activeRecords as any\[\]\)\) \{\n)([\s\S]*?)(      // 9\. Persist the Result for this Worker)"
match = re.search(pattern, orig)

if not match:
    print("FAILED TO MATCH")
    sys.exit(1)

loop_body = match.group(2)

new_function = """
  public async buildWorkerReceiptMetrics(
    tenantId: string,
    periodId: string,
    period: any,
    record: any,
    contextDict: Record<string, any>,
    bonifiableConceptIds: string[],
    executionList: any[]
  ) {
""" + loop_body + """
    return {
      netPay, totalIncome, totalDeductions, employerContributions,
      receiptDetails, memorySnapshot
    };
  }
"""

replacement = """    for (const record of (activeRecords as any[])) {
      if (!record.salaryHistories || record.salaryHistories.length === 0) {
        this.logger.warn(`Worker has no active salary history. Skipping.`);
        continue;
      }

      const { netPay, totalIncome, totalDeductions, receiptDetails } = await this.buildWorkerReceiptMetrics(
        tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList
      );

      // 9. Persist the Result for this Worker"""

new_content = orig.replace(match.group(0), replacement) + new_function

with open(file_path, 'w') as f:
    f.write(new_content)

print("REFACTORED SUCCESSFULLY")
