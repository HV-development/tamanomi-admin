import { LoginForm } from '@/components/2_molecules/forms/login-form';

export default function CareManagerLoginPage() {
  return <LoginForm roleName="ケアマネージャー" redirectPath="/care-manager" />;
}
