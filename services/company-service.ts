import { mockCompanies } from '@/mocks/companies';
import type { Company, CompanyFilters, CreateCompany, UpdateCompany } from '@/types/company';

class CompanyService {
  private companies: Company[] = mockCompanies;

  async getCompanies(filters?: Partial<CompanyFilters>): Promise<Company[]> {
    // シミュレートされた遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredCompanies = [...this.companies];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCompanies = filteredCompanies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchLower) ||
            company.nameKana.toLowerCase().includes(searchLower) ||
            company.address.toLowerCase().includes(searchLower) ||
            company.representativeName.toLowerCase().includes(searchLower)
        );
      }

      if (filters.businessType) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.businessType === filters.businessType
        );
      }

      if (filters.city) {
        filteredCompanies = filteredCompanies.filter((company) =>
          company.address.includes(filters.city!)
        );
      }
    }

    return filteredCompanies;
  }

  async getCompanyById(id: string): Promise<Company | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.companies.find((company) => company.id === id) || null;
  }

  async createCompany(data: CreateCompany): Promise<Company> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCompany: Company = {
      ...data,
      id: (this.companies.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.companies.push(newCompany);
    return newCompany;
  }

  async updateCompany(id: string, data: UpdateCompany): Promise<Company | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = this.companies.findIndex((company) => company.id === id);
    if (index === -1) return null;

    const updatedCompany: Company = {
      ...this.companies[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.companies[index] = updatedCompany;
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.companies.findIndex((company) => company.id === id);
    if (index === -1) return false;

    // 紐付く事業所があるかチェック
    const hasOffices = await this.hasOffices(id);
    if (hasOffices) {
      throw new Error(
        '紐付く事業所があるため、会社を削除できません。先に事業所を削除してください。'
      );
    }

    this.companies.splice(index, 1);
    return true;
  }

  async hasOffices(companyId: string): Promise<boolean> {
    // officeServiceをインポートして事業所をチェック
    const { officeService } = await import('./office-service');
    const offices = await officeService.getOffices({ companyId });
    return offices.length > 0;
  }

  async canDeleteCompany(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const hasOffices = await this.hasOffices(id);
    if (hasOffices) {
      return {
        canDelete: false,
        reason: '紐付く事業所があるため削除できません',
      };
    }
    return { canDelete: true };
  }

  async getCompanyStats() {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      total: this.companies.length,
    };
  }
}

export const companyService = new CompanyService();
