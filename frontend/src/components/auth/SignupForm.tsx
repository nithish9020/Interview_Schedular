import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupForm({
  onSignup,
  error,
  switchToLogin,
}: {
  onSignup: (name: string, email: string, password: string) => void;
  error: string;
  switchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(name, email, password);
  };

  return (
    <form className="p-6 md:p-8 bg-white" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold text-blue-600">Create Account</h1>
          <p className="text-muted-foreground text-balance">
            Sign up for your <span className="font-semibold">Interview Scheduler</span>
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <button type="button" onClick={switchToLogin} className="underline underline-offset-4 text-blue-600">
            Login
          </button>
        </div>
      </div>
    </form>
  );
}