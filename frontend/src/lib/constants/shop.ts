// 店舗ステータスの日本語マッピング
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

