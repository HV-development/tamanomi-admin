import { UserRole } from '@/types/auth';

/**
 * ユーザーの権限に基づいてナビゲーションリンクを取得する
 */
export const getNavigationLinks = (role: UserRole) => {
  const baseLinks = {
    operation: {
      dashboard: '/operation',
      profile: '/operation/profile',
      login: '/operation/login',
    },
    facility: {
      dashboard: '/facility',
      profile: '/facility/profile',
      login: '/facility/login',
    },
    care_manager: {
      dashboard: '/care-manager',
      profile: '/care-manager/profile',
      login: '/care-manager/login',
    },
  };

  return baseLinks[role];
};

/**
 * 権限に基づいてユーザー情報の表示名を取得する
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    operation: '運営者',
    facility: '事業所管理者',
    care_manager: 'ケアマネージャー',
  };

  return roleNames[role];
};

/**
 * 権限に基づいてアバターの初期文字を取得する
 */
export const getRoleAvatarInitial = (role: UserRole): string => {
  const initials = {
    operation: '運',
    facility: '事',
    care_manager: 'ケ',
  };

  return initials[role];
};

/**
 * 権限に基づいて利用可能な機能を取得する
 */
export const getAvailableFeatures = (role: UserRole) => {
  const features = {
    operation: {
      quickRegister: true,
      systemSettings: true,
      companyManagement: true,
      officeManagement: true,
    },
    facility: {
      quickRegister: true,
      systemSettings: false,
      companyManagement: false,
      officeManagement: false,
    },
    care_manager: {
      quickRegister: false,
      systemSettings: false,
      companyManagement: false,
      officeManagement: false,
    },
  };

  return features[role];
};
