import Link from "next/link";
import { RegisterForm } from "@/components/shared/register-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register as a worker</CardTitle>
        <CardDescription>Create an account to start claiming writing tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
