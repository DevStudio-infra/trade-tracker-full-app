import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp
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
