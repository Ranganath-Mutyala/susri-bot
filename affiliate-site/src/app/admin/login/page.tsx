import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-serif text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-mute">Credentials are configured in your .env file.</p>
        <LoginForm next={safeNext} />
      </div>
    </div>
  );
}
