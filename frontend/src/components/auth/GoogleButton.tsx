import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white"
    >
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  );
}