// 店舗ステータスの日本語マッピング
export const statusLabels: Record<string, string> = {
  registering: '登録中',
  collection_requested: '情報収集依頼済み',
  approval_pending: '承認待ち',
  promotional_materials_preparing: '宣材準備中',
  promotional_materials_shipping: '宣材発送中',
  operating: '営業中',
  suspended: '停止中',
  terminated: '終了',
};

// ステータスオプション（ドロップダウン用）
export const statusOptions = [
  { value: 'registering', label: '登録中' },
  { value: 'collection_requested', label: '情報収集依頼済み' },
  { value: 'approval_pending', label: '承認待ち' },
  { value: 'promotional_materials_preparing', label: '宣材準備中' },
  { value: 'promotional_materials_shipping', label: '宣材発送中' },
  { value: 'operating', label: '営業中' },
  { value: 'suspended', label: '停止中' },
  { value: 'terminated', label: '終了' },
];

