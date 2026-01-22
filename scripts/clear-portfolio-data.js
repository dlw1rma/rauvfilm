/**
 * 포트폴리오 데이터 삭제 스크립트
 * 
 * ⚠️ 경고: 이 스크립트는 모든 포트폴리오 데이터를 삭제합니다.
 * 
 * 사용법:
 * CONFIRM_DELETE=true node scripts/clear-portfolio-data.js
 * 
 * 보안: 환경변수 CONFIRM_DELETE=true를 명시적으로 설정해야만 실행됩니다.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearPortfolioData() {
  // 보안: 명시적 확인 필요
  if (process.env.CONFIRM_DELETE !== 'true') {
    console.error('❌ 보안상의 이유로 이 스크립트는 CONFIRM_DELETE=true 환경변수 없이는 실행할 수 없습니다.');
    console.error('   실행하려면: CONFIRM_DELETE=true node scripts/clear-portfolio-data.js');
    process.exit(1);
  }

  try {
    console.log('⚠️  경고: 포트폴리오 데이터 삭제를 시작합니다...');
    console.log('⚠️  이 작업은 되돌릴 수 없습니다!');
    
    // 추가 확인 (5초 대기)
    console.log('⚠️  5초 후 삭제가 시작됩니다. Ctrl+C로 취소할 수 있습니다...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 모든 포트폴리오 삭제
    const deleted = await prisma.portfolio.deleteMany({});
    
    console.log(`✅ ${deleted.count}개의 포트폴리오가 삭제되었습니다.`);
    console.log('포트폴리오 데이터 삭제가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearPortfolioData();
