file_path = '/home/lzambrano/Desarrollo/nomina/backend/src/payroll-engine/payroll-engine.service.ts'

with open(file_path, 'r') as f:
    orig = f.read()

# Fix the continue
orig = orig.replace("this.logger.warn(`Worker has no active salary history. Skipping.`);\n        continue;", "this.logger.warn(`Worker has no active salary history. Skipping.`);\n        return null;")

with open(file_path, 'w') as f:
    f.write(orig)

print("FIXED CONTINUE")
