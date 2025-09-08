import { LoginForm } from '@/components/2_molecules/forms/login-form';

export default function FacilityLoginPage() {
  return <LoginForm roleName="施設管理者" redirectPath="/facility" />;
}
