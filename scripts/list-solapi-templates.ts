/**
 * 솔라피에 저장된 카카오 알림톡 템플릿 목록 조회 스크립트
 * 실행: npx tsx scripts/list-solapi-templates.ts
 */
import { SolapiMessageService } from 'solapi';

const apiKey = process.env.SOLAPI_API_KEY || '';
const apiSecret = process.env.SOLAPI_API_SECRET || '';

if (!apiKey || !apiSecret) {
  console.error('SOLAPI_API_KEY, SOLAPI_API_SECRET 환경변수를 설정해주세요.');
  process.exit(1);
}

const messageService = new SolapiMessageService(apiKey, apiSecret);

async function main() {
  try {
    console.log('=== 솔라피 카카오 알림톡 템플릿 목록 ===\n');

    const result = await messageService.getKakaoAlimtalkTemplates();
    const templates = result.templateList ?? [];

    if (templates.length === 0) {
      console.log('저장된 템플릿이 없습니다.');
      return;
    }

    for (const tpl of templates) {
      console.log(`ID: ${tpl.templateId}`);
      console.log(`이름: ${tpl.name}`);
      console.log(`상태: ${tpl.status}`);
      console.log(`내용: ${tpl.content ?? '(없음)'}`);
      console.log('---');
    }

    console.log(`\n총 ${templates.length}개의 템플릿`);
  } catch (error) {
    console.error('템플릿 조회 오류:', error);
  }
}

main();
