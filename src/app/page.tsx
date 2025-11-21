import { SignInForm } from './auth/components/sign-in-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-violet-50 -z-10"></div>
      <div className="mx-auto w-full max-w-md space-y-4 text-center">
        <h1 className="text-6xl font-bold tracking-tighter text-primary sm:text-7xl md:text-8xl">
          Convico
        </h1>
        <p className="text-lg text-muted-foreground">
          AI conversations that connect.
        </p>
      </div>
      <div className="mt-8 w-full max-w-sm">
        <SignInForm />
      </div>
    </main>
  );
}
