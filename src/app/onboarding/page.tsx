import { OnboardingForm } from "./components/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-violet-50 -z-10"></div>
      <div className="mx-auto w-full max-w-md space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Tell us about yourself
        </h1>
        <p className="text-lg text-muted-foreground">
          This will help us personalize your experience.
        </p>
      </div>
      <div className="mt-8 w-full max-w-sm">
        <OnboardingForm />
      </div>
    </main>
  );
}
