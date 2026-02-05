import { SolapiMessageService } from 'solapi';
import { prisma } from '@/lib/prisma';

// 환경변수에서 따옴표 제거 (일부 .env 파서 호환)
function cleanEnvValue(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/^["']|["']$/g, '');
}

function getSolapiConfig() {
  const apiKey = cleanEnvValue(process.env.SOLAPI_API_KEY);
  const apiSecret = cleanEnvValue(process.env.SOLAPI_API_SECRET);
  const senderNumber = cleanEnvValue(process.env.SOLAPI_SENDER_NUMBER).replace(/-/g, '');

  if (!apiKey || !apiSecret || !senderNumber) {
    return null;
  }

  return { apiKey, apiSecret, senderNumber };
}

let messageService: SolapiMessageService | null = null;
let cachedSenderNumber: string | null = null;

function getMessageService(): SolapiMessageService {
  if (!messageService) {
    const config = getSolapiConfig();
    if (!config) {
      throw new Error('SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER 환경변수가 설정되지 않았습니다.');
    }
    messageService = new SolapiMessageService(config.apiKey, config.apiSecret);
    cachedSenderNumber = config.senderNumber;
  }
  return messageService;
}

export type SmsTemplateType = 'contract' | 'video' | 'post_wedding';

/**
 * 카카오 알림톡 발송 (솔라피 경유)
 */
export async function sendKakaoAlimtalk(
  to: string,
  templateId: string,
  channelId: string,
  variables: Record<string, string>,
) {
  const service = getMessageService();
  const cleanTo = to.replace(/-/g, '');

  if (!cachedSenderNumber) {
    throw new Error('발신 번호가 설정되지 않았습니다.');
  }

  const result = await service.sendOne({
    to: cleanTo,
    from: cachedSenderNumber,
    kakaoOptions: {
      pfId: channelId,
      templateId,
      variables,
    },
  });

  return result;
}

/**
 * DB에 설정된 카카오 알림톡 템플릿으로 발송
 * - DB에 templateId/channelId가 설정되어 있어야 발송 가능
 * - 미설정 시 에러 throw
 */
export async function sendTemplateSms(
  to: string,
  templateType: SmsTemplateType,
  customerName: string,
  link: string,
) {
  const templateConfig = await prisma.smsTemplateConfig.findUnique({
    where: { type: templateType },
  });

  if (!templateConfig) {
    throw new Error(`[알림톡] ${templateType} 템플릿이 지정되지 않았습니다. 관리자 페이지에서 템플릿을 지정해주세요.`);
  }

  const result = await sendKakaoAlimtalk(to, templateConfig.templateId, templateConfig.channelId, {
    '#{고객명}': customerName,
    '#{링크}': link,
  });

  return result;
}
