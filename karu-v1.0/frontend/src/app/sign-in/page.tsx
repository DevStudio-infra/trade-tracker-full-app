import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md rounded-lg border border-border bg-background",
          },
        }}
      />
    </div>
  );
}
