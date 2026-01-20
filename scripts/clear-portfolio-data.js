/**
 * 포트폴리오 데이터 삭제 스크립트
 * 
 * 사용법:
 * node scripts/clear-portfolio-data.js
 * 
 * 주의: 이 스크립트는 모든 포트폴리오 데이터를 삭제합니다.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearPortfolioData() {
  try {
    console.log('포트폴리오 데이터 삭제를 시작합니다...');
    
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
