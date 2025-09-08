import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleButton from "./GoogleButton";
import OutlookButton from "./OutlookButton";

export default function LoginForm({
  onLogin,
  error,
  switchToSignup,
}: {
  onLogin: (email: string, password: string) => void;
  error: string;
  switchToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form className="p-6 md:p-8 bg-white" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold text-blue-600">Welcome back</h1>
          <p className="text-muted-foreground text-balance">
            Login to your <span className="font-semibold">Interview Scheduler</span>
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="login-password">Password</Label>
            <a href="#" className="ml-auto text-sm text-blue-600 hover:underline">Forgot your password?</a>
          </div>
          <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="grid gap-3">
          <GoogleButton />
          <OutlookButton />
        </div>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={switchToSignup} className="underline underline-offset-4 text-blue-600">
            Sign up
          </button>
        </div>
      </div>
    </form>
  );
}