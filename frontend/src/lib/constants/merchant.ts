// 事業者ステータスの日本語マッピング
export const statusLabels: Record<string, string> = {
  registering: '登録中',
  collection_requested: '回収依頼中',
  approval_pending: '承認待ち',
  promotional_materials_preparing: '販促物準備中',
  promotional_materials_shipping: '販促物発送中',
  operating: '運用中',
  suspended: '停止中',
  terminated: '解約済み',
};

// ステータスオプション（ドロップダウン用）
export const statusOptions = [
  { value: 'registering', label: '登録中' },
  { value: 'collection_requested', label: '回収依頼中' },
  { value: 'approval_pending', label: '承認待ち' },
  { value: 'promotional_materials_preparing', label: '販促物準備中' },
  { value: 'promotional_materials_shipping', label: '販促物発送中' },
  { value: 'operating', label: '運用中' },
  { value: 'suspended', label: '停止中' },
  { value: 'terminated', label: '解約済み' },
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
