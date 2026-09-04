import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem("userEmail", email);
    }
    setLocation("/calculator");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F2" }}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Welcome Section - Left Side */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 lg:py-0">
          <div className="max-w-2xl">
            {/* Logo */}
            <div className="mb-16 lg:mb-24">
              <img 
                src="/xtorra-logo.png" 
                alt="Xtorra Logo" 
                className="h-150 md:h-70 object-contain"
              />
            </div>

            {/* Main Headline */}
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4"
              style={{
                color: "#063477",
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "-0.02em"
              }}
            >
              Welcome Back
            </h1>

            {/* User Name Accent */}
            <p 
              className="text-4xl md:text-5xl lg:text-6xl font-bold italic mb-8 md:mb-12"
              style={{
                color: "#4CAF16",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              Abiola Franklin Ode.
            </p>
            

            {/* Supporting Text */}
            <p 
              className="text-lg md:text-xl leading-relaxed mb-12 md:mb-16"
              style={{
                color: "#52708D",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              Continue with your solar design work
            </p>

            {/* Subtle Accent Line */}
            <div 
              className="w-16 h-1 mb-12 md:mb-16"
              style={{ backgroundColor: "#4CAF16" }}
            />
          </div>
        </div>

        {/* Login Form Section - Right Side */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12 lg:py-0 bg-white lg:bg-gray-50">
          <div className="w-full max-w-md">
            <div className="space-y-6">
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ color: "#063477" }}
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E0E0E0" }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ color: "#063477" }}
                >
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E0E0E0" }}
                />
              </div>

              <Button
                type="submit"
                onClick={handleLogin}
                className="w-full py-3 rounded-lg font-bold text-lg transition-all"
                style={{ 
                  backgroundColor: "#063477",
                  color: "white"
                }}
              >
                Login
              </Button>
            </div>

            <div className="mt-8 text-center text-sm" style={{ color: "#52708D" }}>
              <p>© 2026 Xtorra Renewables Limited</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}