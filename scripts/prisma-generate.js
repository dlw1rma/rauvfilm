const fs = require("fs");
const { execSync } = require("child_process");

const schemaPath = "prisma/schema.prisma";

if (fs.existsSync(schemaPath)) {
  console.log(`[prisma] schema found -> generating client (${schemaPath})`);
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: "inherit" });
} else {
  // Cloud/Docker build에서 prisma 폴더가 복사되지 않는 경우에도 빌드가 깨지지 않도록 스킵
  console.log(`[prisma] schema not found (${schemaPath}) -> skipping generate`);
}

