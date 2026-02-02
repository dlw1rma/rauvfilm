/**
 * 관리자 비밀번호 해시 생성 스크립트
 * 
 * 사용법:
 *   node scripts/generate-admin-password-hash.js <비밀번호>
 * 
 * 예시:
 *   node scripts/generate-admin-password-hash.js mySecurePassword123
 * 
 * 출력된 해시를 Cloudtype 환경변수 ADMIN_PASSWORD_HASH에 설정하세요.
 */

const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("❌ 사용법: node scripts/generate-admin-password-hash.js <비밀번호>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("❌ 비밀번호는 최소 8자 이상이어야 합니다.");
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("❌ 해시 생성 실패:", err);
    process.exit(1);
  }

  console.log("\n✅ 비밀번호 해시가 생성되었습니다:\n");
  console.log(hash);
  console.log("\n📋 다음 환경변수를 Cloudtype에 설정하세요:");
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  console.log("⚠️  이 해시를 안전하게 보관하세요. 원본 비밀번호는 복구할 수 없습니다.\n");
});
