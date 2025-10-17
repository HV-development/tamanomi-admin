// 会社ステータスの日本語マッピング
export const statusLabels: Record<string, string> = {
  registering: '登録中',
  collection_requested: '資料回収依頼中',
  approval_pending: '承認待ち',
  approval_expired: '承認期限切れ',
  promotional_materials_preparing: '販促物準備中',
  promotional_materials_shipping: '販促物発送中',
  operating: '稼働中',
  active: '契約中', // 旧ステータス（後方互換性のため）
  suspended: '一時停止',
  terminated: '解約',
};

// ステータスオプション（ドロップダウン用）
export const statusOptions = [
  { value: 'registering', label: '登録中' },
  { value: 'collection_requested', label: '資料回収依頼中' },
  { value: 'approval_pending', label: '承認待ち' },
  { value: 'approval_expired', label: '承認期限切れ' },
  { value: 'promotional_materials_preparing', label: '販促物準備中' },
  { value: 'promotional_materials_shipping', label: '販促物発送中' },
  { value: 'operating', label: '稼働中' },
  { value: 'suspended', label: '一時停止' },
  { value: 'terminated', label: '解約' },
];

// 都道府県一覧
export const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];
