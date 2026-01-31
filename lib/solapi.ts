import { SolapiMessageService } from 'solapi';
import { prisma } from '@/lib/prisma';

const apiKey = process.env.SOLAPI_API_KEY || '';
const apiSecret = process.env.SOLAPI_API_SECRET || '';
const senderNumber = (process.env.SOLAPI_SENDER_NUMBER || '').replace(/-/g, '');

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

// SMS 메시지 템플릿 (알림톡 미설정 시 fallback)
const SMS_TEMPLATES = {
  contract: (customerName: string, link: string) =>
    `[라우브필름] ${customerName}님, 계약서가 준비되었습니다.\n\n아래 링크에서 확인해 주세요.\n${link}\n\n감사합니다.`,
  video: (customerName: string, link: string) =>
    `[라우브필름] ${customerName}님, 영상이 준비되었습니다.\n\n아래 링크에서 확인해 주세요.\n${link}\n\n감사합니다.`,
};

export type SmsTemplateType = keyof typeof SMS_TEMPLATES;

/**
 * SMS 발송
 */
export async function sendSms(to: string, text: string) {
  const service = getMessageService();
  const cleanTo = to.replace(/-/g, '');

  const result = await service.sendOne({
    to: cleanTo,
    from: senderNumber,
    text,
  });

  return result;
}

/**
 * 카카오 알림톡 발송
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
 * 템플릿 기반 발송 (알림톡 설정 시 알림톡, 미설정 시 SMS)
 */
export async function sendTemplateSms(
  to: string,
  templateType: SmsTemplateType,
  customerName: string,
  link: string,
) {
  // DB에서 알림톡 템플릿 설정 확인
  try {
    const templateConfig = await prisma.smsTemplateConfig.findUnique({
      where: { type: templateType },
    });

    if (templateConfig) {
      // 알림톡으로 발송
      const result = await sendKakaoAlimtalk(to, templateConfig.templateId, templateConfig.channelId, {
        '#{고객명}': customerName,
        '#{링크}': link,
      });
      return result;
    }
  } catch (error) {
    console.error(`[알림톡] ${templateType} 발송 실패, SMS로 대체:`, error);
  }

  // fallback: SMS 발송
  const text = SMS_TEMPLATES[templateType](customerName, link);
  return sendSms(to, text);
}
