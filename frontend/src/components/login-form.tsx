import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FcGoogle } from "react-icons/fc"
import { motion, AnimatePresence } from "framer-motion"

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-lg border border-blue-200">
        <CardContent className="grid p-0 md:grid-cols-2 relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              // ================== LOGIN ==================
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 md:col-span-1 order-1"
              >
                <form className="p-6 md:p-8 bg-white">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold text-blue-600">
                        Welcome back
                      </h1>
                      <p className="text-muted-foreground text-balance">
                        Login to your <span className="font-semibold">Interview Scheduler</span>
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm text-blue-600 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input id="password" type="password" required />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Login
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gray-300" />
                      <span className="text-xs text-gray-400">OR</span>
                      <div className="h-px flex-1 bg-gray-300" />
                    </div>

                    {/* Continue with Google */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-gray-300"
                    >
                      <FcGoogle className="h-5 w-5" />
                      Continue with Google
                    </Button>

                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="underline underline-offset-4 text-blue-600"
                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              // ================== SIGN UP ==================
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 md:col-span-1 order-2"
              >
                <form className="p-6 md:p-8 bg-white">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold text-blue-600">
                        Create Account
                      </h1>
                      <p className="text-muted-foreground text-balance">
                        Sign up for your <span className="font-semibold">Interview Scheduler</span>
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" type="text" placeholder="yourname" required />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Sign Up
                    </Button>

                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="underline underline-offset-4 text-blue-600"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared SVG + Google side */}
          <div className="bg-blue-50 relative hidden md:flex items-center justify-center p-6 order-1 md:order-none">
            <div className="flex flex-col items-center gap-6">
              {/* SVG illustration */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3/4 h-3/4 text-blue-500"
                viewBox="0 0 200 200"
                fill="none"
              >
                {/* Calendar */}
                <rect x="30" y="40" width="140" height="120" rx="12" fill="currentColor" opacity="0.1"/>
                <line x1="30" y1="70" x2="170" y2="70" stroke="currentColor" strokeWidth="4"/>
                <circle cx="60" cy="100" r="6" fill="currentColor"/>
                <circle cx="100" cy="100" r="6" fill="currentColor"/>
                <circle cx="140" cy="100" r="6" fill="currentColor"/>
                <circle cx="60" cy="130" r="6" fill="currentColor"/>
                <circle cx="100" cy="130" r="6" fill="currentColor"/>
                <circle cx="140" cy="130" r="6" fill="currentColor"/>

                {/* Clock */}
                <circle cx="100" cy="170" r="20" stroke="currentColor" strokeWidth="3"/>
                <line x1="100" y1="170" x2="100" y2="158" stroke="currentColor" strokeWidth="3"/>
                <line x1="100" y1="170" x2="110" y2="170" stroke="currentColor" strokeWidth="3"/>
              </svg>

              {/* Continue with Google (shown on left in signup mode too) */}
              {!isLogin && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white"
                >
                  <FcGoogle className="h-5 w-5" />
                  Continue with Google
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
