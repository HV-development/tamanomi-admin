import { companyService } from '@/services/company-service';
import type { Company, CompanyFilters, CreateCompany, UpdateCompany } from '@/types/company';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCompanies = (filters?: Partial<CompanyFilters>) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtersオブジェクトをメモ化して安定性を確保
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompanies(stableFilters);
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = useCallback(async (data: CreateCompany): Promise<Company | null> => {
    try {
      const newCompany = await companyService.createCompany(data);
      setCompanies((prev) => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '会社の作成に失敗しました');
    }
  }, []);

  const updateCompany = useCallback(
    async (id: string, data: UpdateCompany): Promise<Company | null> => {
      try {
        const updatedCompany = await companyService.updateCompany(id, data);
        if (updatedCompany) {
          setCompanies((prev) =>
            prev.map((company) => (company.id === id ? updatedCompany : company))
          );
        }
        return updatedCompany;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '会社の更新に失敗しました');
      }
    },
    []
  );

  const deleteCompany = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await companyService.deleteCompany(id);
      if (success) {
        setCompanies((prev) => prev.filter((company) => company.id !== id));
      }
      return success;
    } catch (err) {
      // サービス層からの具体的なエラーメッセージをそのまま使用
      throw err;
    }
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};

export const useCompany = (id: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCompany(null);
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companyService.getCompanyById(id);
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const refetch = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompanyById(id);
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch };
};

export const useCompanyStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompanyStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
