import AuthIllustration from "@/assets/AuthIllustration";

export default function AuthSidePanel() {
  return (
    <div className="bg-blue-50 relative hidden md:flex items-center justify-center p-6 order-1 md:order-none">
      <div className="flex flex-col items-center gap-6">
        <AuthIllustration />
      </div>
    </div>
  );
}