import { adminService } from '@/services/admin-service';
import type { Admin, AdminRegistrationResponse, CreateAdmin, UpdateAdmin } from '@/types/admin';
import { useCallback, useEffect, useState } from 'react';

export const useAdmins = () => {
  const [data, setData] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const admins = await adminService.getAll();
      setData(admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAdmin = useCallback(
    async (newAdmin: CreateAdmin): Promise<AdminRegistrationResponse> => {
      try {
        const registrationResponse = await adminService.create(newAdmin);
        setData((prev) => [...prev, registrationResponse.admin]);
        return registrationResponse;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '作成に失敗しました');
      }
    },
    []
  );

  const updateAdmin = useCallback(async (id: string, updates: UpdateAdmin) => {
    try {
      const updated = await adminService.update(id, updates);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
    }
  }, []);

  const deleteAdmin = useCallback(async (id: string) => {
    try {
      await adminService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Admin['status']) => {
    try {
      const updated = await adminService.updateStatus(id, status);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    updateStatus,
  };
};

export const useAdmin = (id: string) => {
  const [data, setData] = useState<Admin | null>(null);
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
        const admin = await adminService.getById(id);
        setData(admin);
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
      const admin = await adminService.getById(id);
      setData(admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
