import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/shared/login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register as a worker
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
