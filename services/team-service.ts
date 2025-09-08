import { teams } from '@/mocks/teams';
import type { CreateTeam, Team, TeamWithDetails, UpdateTeam } from '@/types/team';
import type { TeamSearchParams } from '@/validations/team-validation';

class TeamService {
  private teams: Team[] = teams;

  async getAll(params?: Partial<TeamSearchParams>): Promise<TeamWithDetails[]> {
    // シミュレートされた遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredTeams = [...this.teams];

    if (params) {
      // 検索クエリフィルター
      if (params.query) {
        const queryLower = params.query.toLowerCase();
        filteredTeams = filteredTeams.filter(
          (team) =>
            team.name.toLowerCase().includes(queryLower) ||
            (team.description && team.description.toLowerCase().includes(queryLower))
        );
      }

      // ステータスフィルター
      if (params.status && params.status !== 'all') {
        filteredTeams = filteredTeams.filter((team) => team.status === params.status);
      }

      // グループIDフィルター
      if (params.groupId) {
        filteredTeams = filteredTeams.filter((team) => team.groupId === params.groupId);
      }

      // 事業所IDフィルター
      if (params.facilityId) {
        filteredTeams = filteredTeams.filter((team) => team.facilityId === params.facilityId);
      }

      // ソート
      if (params.sortBy) {
        filteredTeams.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          if (params.sortBy === 'groupName') {
            aValue = this.getGroupName(a.groupId) || '';
            bValue = this.getGroupName(b.groupId) || '';
          } else {
            aValue = a[params.sortBy!];
            bValue = b[params.sortBy!];
          }

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

    // グループ情報を含む詳細データに変換
    return filteredTeams.map((team) => ({
      ...team,
      groupName: this.getGroupName(team.groupId),
      members: this.getMembersForTeam(team.id),
      recentActivity: {
        lastUpdated: team.updatedAt,
        updatedBy: team.createdBy,
      },
    }));
  }

  async getById(id: string): Promise<TeamWithDetails | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const team = this.teams.find((team) => team.id === id);
    if (!team) return null;

    return {
      ...team,
      groupName: this.getGroupName(team.groupId),
      members: this.getMembersForTeam(id),
      recentActivity: {
        lastUpdated: team.updatedAt,
        updatedBy: team.createdBy,
      },
    };
  }

  async getByGroupId(groupId: string): Promise<TeamWithDetails[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const groupTeams = this.teams.filter((team) => team.groupId === groupId);

    return groupTeams.map((team) => ({
      ...team,
      groupName: this.getGroupName(team.groupId),
      members: this.getMembersForTeam(team.id),
      recentActivity: {
        lastUpdated: team.updatedAt,
        updatedBy: team.createdBy,
      },
    }));
  }

  async create(data: CreateTeam): Promise<Team> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTeam: Team = {
      ...data,
      id: `team_${Date.now()}`,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.teams.push(newTeam);

    // グループのチーム数を更新
    this.updateGroupTeamCount(data.groupId);

    return newTeam;
  }

  async update(id: string, data: UpdateTeam): Promise<Team> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = this.teams.findIndex((team) => team.id === id);
    if (index === -1) {
      throw new Error('チームが見つかりません');
    }

    const updatedTeam: Team = {
      ...this.teams[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.teams[index] = updatedTeam;
    return updatedTeam;
  }

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.teams.findIndex((team) => team.id === id);
    if (index === -1) {
      throw new Error('チームが見つかりません');
    }

    const team = this.teams[index];

    // 削除前の制限チェック
    const deleteCheck = await this.canDeleteTeam(id);
    if (!deleteCheck.canDelete) {
      throw new Error(deleteCheck.reason || 'チームを削除できません');
    }

    this.teams.splice(index, 1);

    // グループのチーム数を更新
    this.updateGroupTeamCount(team.groupId);
  }

  async canDeleteTeam(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const team = this.teams.find((t) => t.id === id);
    if (!team) {
      return { canDelete: false, reason: 'チームが見つかりません' };
    }

    // 非アクティブでない場合は削除不可
    if (team.status !== 'inactive') {
      return {
        canDelete: false,
        reason: 'チームを削除するには、まず非アクティブにしてください',
      };
    }

    // メンバーがいる場合は削除不可
    if (team.memberCount > 0) {
      return {
        canDelete: false,
        reason: '紐付くメンバーがいるため削除できません',
      };
    }

    return { canDelete: true };
  }

  async getStats() {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalTeams = this.teams.length;
    const activeTeams = this.teams.filter((t) => t.status === 'active').length;
    const totalMembers = this.teams.reduce((sum, t) => sum + t.memberCount, 0);

    const now = new Date();
    const newThisMonth = this.teams.filter((t) => {
      const created = new Date(t.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalTeams,
      activeTeams,
      totalMembers,
      newThisMonth,
      averageMembersPerTeam: totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0,
    };
  }

  private getGroupName(groupId: string): string | undefined {
    // グループサービスから取得する代わりに、ここではモックデータを使用
    const { groups } = require('@/mocks/groups');
    const group = groups.find((g: any) => g.id === groupId);
    return group?.name;
  }

  private getMembersForTeam(teamId: string) {
    // 実際の実装では、ユーザーサービスから取得
    // ここではモックデータを返す
    return [
      { id: 'member_1', name: 'メンバー1', role: '看護師' },
      { id: 'member_2', name: 'メンバー2', role: '介護士' },
    ];
  }

  private updateGroupTeamCount(groupId: string) {
    // グループサービスのチーム数を更新
    // 実際の実装では、グループサービスのメソッドを呼び出す
    const { groups } = require('@/mocks/groups');
    const group = groups.find((g: any) => g.id === groupId);
    if (group) {
      group.teamCount = this.teams.filter((t) => t.groupId === groupId).length;
    }
  }
}

export const teamService = new TeamService();
