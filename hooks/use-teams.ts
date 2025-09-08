import { teamService } from '@/services/team-service';
import type { CreateTeam, TeamWithDetails, UpdateTeam } from '@/types/team';
import type { TeamSearchParams } from '@/validations/team-validation';
import { useCallback, useEffect, useState } from 'react';

export const useTeams = (initialParams?: Partial<TeamSearchParams>) => {
  const [data, setData] = useState<TeamWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<Partial<TeamSearchParams>>(initialParams || {});

  const fetchData = useCallback(
    async (searchParams?: Partial<TeamSearchParams>) => {
      try {
        setLoading(true);
        setError(null);
        const teams = await teamService.getAll(searchParams || params);
        setData(teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams: Partial<TeamSearchParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const search = useCallback(
    (query: string) => {
      const searchParams = { ...params, query };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const filterByStatus = useCallback(
    (status: 'all' | 'active' | 'inactive') => {
      const searchParams = { ...params, status };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const filterByGroup = useCallback(
    (groupId: string | undefined) => {
      const searchParams = { ...params, groupId };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const sort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
      const searchParams = { ...params, sortBy, sortOrder };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const addTeam = useCallback(
    async (newTeam: CreateTeam): Promise<TeamWithDetails> => {
      try {
        const created = await teamService.create(newTeam);
        // データを再取得して最新状態を反映
        await fetchData();
        return {
          ...created,
          groupName: '',
          leaderName: '',
          members: [],
          recentActivity: {
            lastUpdated: created.updatedAt,
            updatedBy: created.createdBy,
          },
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '作成に失敗しました');
      }
    },
    [fetchData]
  );

  const updateTeam = useCallback(
    async (id: string, updates: UpdateTeam): Promise<TeamWithDetails> => {
      try {
        const updated = await teamService.update(id, updates);
        // データを再取得して最新状態を反映
        await fetchData();
        return {
          ...updated,
          groupName: '',
          leaderName: '',
          members: [],
          recentActivity: {
            lastUpdated: updated.updatedAt,
            updatedBy: updated.createdBy,
          },
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
      }
    },
    [fetchData]
  );

  const deleteTeam = useCallback(
    async (id: string) => {
      try {
        await teamService.delete(id);
        // データを再取得して最新状態を反映
        await fetchData();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
      }
    },
    [fetchData]
  );

  const canDeleteTeam = useCallback(async (id: string) => {
    try {
      return await teamService.canDeleteTeam(id);
    } catch (err) {
      return { canDelete: false, reason: '削除可能性の確認に失敗しました' };
    }
  }, []);

  return {
    data,
    loading,
    error,
    params,
    updateParams,
    search,
    filterByStatus,
    filterByGroup,
    sort,
    refetch: fetchData,
    addTeam,
    updateTeam,
    deleteTeam,
    canDeleteTeam,
  };
};

export const useTeam = (id: string) => {
  const [data, setData] = useState<TeamWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const team = await teamService.getById(id);
        setData(team);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refetch = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const team = await teamService.getById(id);
      setData(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useTeamsByGroup = (groupId: string) => {
  const [data, setData] = useState<TeamWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const teams = await teamService.getByGroupId(groupId);
        setData(teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const refetch = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const teams = await teamService.getByGroupId(groupId);
      setData(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useTeamStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await teamService.getStats();
        setData(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : '統計データの取得に失敗しました');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await teamService.getStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
