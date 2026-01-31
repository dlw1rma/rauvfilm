import { SolapiMessageService } from 'solapi';
import { prisma } from '@/lib/prisma';

const apiKey = (process.env.SOLAPI_API_KEY || '').replace(/^["']|["']$/g, '');
const apiSecret = (process.env.SOLAPI_API_SECRET || '').replace(/^["']|["']$/g, '');
const senderNumber = (process.env.SOLAPI_SENDER_NUMBER || '').replace(/^["']|["']$/g, '').replace(/-/g, '');

let messageService: SolapiMessageService | null = null;

function getMessageService(): SolapiMessageService {
  if (!messageService) {
    if (!apiKey || !apiSecret) {
      throw new Error('SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 설정되지 않았습니다.');
    }
    messageService = new SolapiMessageService(apiKey, apiSecret);
  }
  return messageService;
}

export type SmsTemplateType = 'contract' | 'video';

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

  const result = await service.sendOne({
    to: cleanTo,
    from: senderNumber,
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
