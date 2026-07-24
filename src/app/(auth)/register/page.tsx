import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/shared/register-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register as a worker</CardTitle>
        <CardDescription>Create an account to claim tasks and track your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense><RegisterForm /></Suspense>
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
