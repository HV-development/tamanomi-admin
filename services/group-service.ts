import { groups } from '@/mocks/groups';
import type { CreateGroup, Group, GroupWithDetails, UpdateGroup } from '@/types/group';
import type { GroupSearchParams } from '@/validations/group-validation';

class GroupService {
  private groups: Group[] = groups;

  async getAll(params?: Partial<GroupSearchParams>): Promise<GroupWithDetails[]> {
    // シミュレートされた遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredGroups = [...this.groups];

    if (params) {
      // 検索クエリフィルター
      if (params.query) {
        const queryLower = params.query.toLowerCase();
        filteredGroups = filteredGroups.filter(
          (group) =>
            group.name.toLowerCase().includes(queryLower) ||
            (group.description && group.description.toLowerCase().includes(queryLower))
        );
      }

      // ステータスフィルター
      if (params.status && params.status !== 'all') {
        filteredGroups = filteredGroups.filter((group) => group.status === params.status);
      }

      // 事業所IDフィルター
      if (params.facilityId) {
        filteredGroups = filteredGroups.filter((group) => group.facilityId === params.facilityId);
      }

      // ソート
      if (params.sortBy) {
        filteredGroups.sort((a, b) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return params.sortOrder === 'desc' ? -comparison : comparison;
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            const comparison = aValue - bValue;
            return params.sortOrder === 'desc' ? -comparison : comparison;
          }

          return 0;
        });
      }
    }

    // チーム情報を含む詳細データに変換
    return filteredGroups.map((group) => ({
      ...group,
      teams: this.getTeamsForGroup(group.id),
      recentActivity: {
        lastUpdated: group.updatedAt,
        updatedBy: group.createdBy,
      },
    }));
  }

  async getById(id: string): Promise<GroupWithDetails | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const group = this.groups.find((group) => group.id === id);
    if (!group) return null;

    return {
      ...group,
      teams: this.getTeamsForGroup(id),
      recentActivity: {
        lastUpdated: group.updatedAt,
        updatedBy: group.createdBy,
      },
    };
  }

  async create(data: CreateGroup): Promise<Group> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newGroup: Group = {
      ...data,
      id: `group_${Date.now()}`,
      memberCount: 0,
      teamCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.groups.push(newGroup);
    return newGroup;
  }

  async update(id: string, data: UpdateGroup): Promise<Group> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = this.groups.findIndex((group) => group.id === id);
    if (index === -1) {
      throw new Error('グループが見つかりません');
    }

    const updatedGroup: Group = {
      ...this.groups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.groups[index] = updatedGroup;
    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.groups.findIndex((group) => group.id === id);
    if (index === -1) {
      throw new Error('グループが見つかりません');
    }

    // 削除前の制限チェック
    const deleteCheck = await this.canDeleteGroup(id);
    if (!deleteCheck.canDelete) {
      throw new Error(deleteCheck.reason || 'グループを削除できません');
    }

    this.groups.splice(index, 1);
  }

  async canDeleteGroup(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const group = this.groups.find((g) => g.id === id);
    if (!group) {
      return { canDelete: false, reason: 'グループが見つかりません' };
    }

    // 非アクティブでない場合は削除不可
    if (group.status !== 'inactive') {
      return {
        canDelete: false,
        reason: 'グループを削除するには、まず非アクティブにしてください',
      };
    }

    // チームがある場合は削除不可
    if (group.teamCount > 0) {
      return {
        canDelete: false,
        reason: '紐付くチームがあるため削除できません',
      };
    }

    // メンバーがいる場合は削除不可
    if (group.memberCount > 0) {
      return {
        canDelete: false,
        reason: '紐付くメンバーがいるため削除できません',
      };
    }

    return { canDelete: true };
  }

  async getStats() {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalGroups = this.groups.length;
    const activeGroups = this.groups.filter((g) => g.status === 'active').length;
    const totalMembers = this.groups.reduce((sum, g) => sum + g.memberCount, 0);
    const totalTeams = this.groups.reduce((sum, g) => sum + g.teamCount, 0);

    const now = new Date();
    const newThisMonth = this.groups.filter((g) => {
      const created = new Date(g.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalGroups,
      activeGroups,
      totalMembers,
      totalTeams,
      newThisMonth,
      averageMembersPerGroup: totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0,
    };
  }

  private getTeamsForGroup(groupId: string) {
    // チームサービスから取得する代わりに、ここではモックデータを使用
    const { teams } = require('@/mocks/teams');
    return teams
      .filter((team: any) => team.groupId === groupId)
      .map((team: any) => ({
        id: team.id,
        name: team.name,
        memberCount: team.memberCount,
      }));
  }
}

export const groupService = new GroupService();
