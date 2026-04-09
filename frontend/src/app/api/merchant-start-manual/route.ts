import { getMerchantStartManualResponse } from '@/lib/merchant-start-manual-response';

export const runtime = 'nodejs';

/**
 * 掲載店スタートマニュアル（PPTX）。メールの URL は adminDomain 上の本パス。
 * 初回パスワード設定前でも取得できるよう認証は要求しない。
 */
export async function GET() {
  return getMerchantStartManualResponse();
}
