import { LoginForm } from '@/components/2_molecules/forms/login-form';

export default function OperationLoginPage() {
  return <LoginForm roleName="運営者" redirectPath="/operation" />;
}
