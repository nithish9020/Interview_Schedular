import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { UserRole } from "@/lib/types";
import GoogleButton from "./GoogleButton";
import OutlookButton from "./OutlookButton";

export default function SignupForm({
  onSignup,
  error,
  switchToLogin,
}: {
  onSignup: (name: string, email: string, password: string, role: UserRole) => void;
  error: string;
  switchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.APPLICANT); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(name, email, password, role);
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
          <RadioGroup defaultValue="comfortable" onValueChange={(value) => setRole(value as UserRole)}>
              <div className="flex items-center gap-3" >
                <RadioGroupItem value="default" id="r1"/>
                <Label htmlFor="r1">Interviewer</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="comfortable" id="r2" defaultChecked />
                <Label htmlFor="r2">Applicant</Label>
              </div>
          </RadioGroup>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
        
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
          Already have an account?{" "}
          <button type="button" onClick={switchToLogin} className="underline underline-offset-4 text-blue-600">
            Login
          </button>
        </div>
      </div>
    </form>
  );
}