import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OtpForm({
  email,
  onVerify,
  error,
}: {
  email: string;
  onVerify: (otp: string) => void;
  error: string;
}) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
    <form className="p-6 md:p-8 bg-white" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Verify OTP</h1>
        <p className="text-muted-foreground text-balance">
          Enter the OTP sent to <span className="font-semibold">{email}</span>
        </p>
        <div className="grid gap-3">
          <Label htmlFor="otp">OTP</Label>
          <Input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Verify OTP</Button>
      </div>
    </form>
  );
}