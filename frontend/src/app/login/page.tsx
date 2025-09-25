"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  FileText,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import AuthBackground from "@/components/auth/AuthBackground";

interface FormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  bio: string;
  gender: "Male" | "Female" | "Other" | "";
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export default function AuthPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, register, error: authError, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormError(null); // Clear errors on input change

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as "Male" | "Female" | "Other",
    }));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (activeTab === "login") {
      if (!formData.email || !formData.password) {
        setFormError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      if (!validateEmail(formData.email)) {
        setFormError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      try {
        await login(formData.email, formData.password);
      } catch (err) {
        console.error("Login error:", err);
        setFormError(
          authError || "Invalid email or password. Please try again."
        );
      }
    } else {
      // Registration validation
      const requiredFields = ["username", "email", "password", "fullName"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );

      if (missingFields.length > 0) {
        setFormError(`Please fill in: ${missingFields.join(", ")}`);
        setIsLoading(false);
        return;
      }

      if (!validateEmail(formData.email)) {
        setFormError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (!validatePassword(formData.password)) {
        setFormError("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      try {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          bio: formData.bio || undefined,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          address: Object.values(formData.address).some(Boolean)
            ? formData.address
            : undefined,
        });
      } catch (err) {
        console.error("Registration error:", err);
        setFormError(authError || "Registration failed. Please try again.");
      }
    }

    setIsLoading(false);
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <AuthBackground />

      {/* Main Content */}
      <motion.div
        className="max-w-md w-full z-10 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Floating Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="mx-auto w-16 h-16 bg-gradient-to-br from-[#1e6f5c] to-[#4cb8a9] rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            whileHover={{
              scale: 1.05,
              rotate: [0, -2, 2, 0],
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#1a1f2b] font-serif mb-2">
            Welcome to <span className="text-[#1e6f5c]">TaskFlow</span>
          </h1>
          <p className="text-[#556070] text-sm">
            Organize your work, amplify your productivity
          </p>
        </motion.div>

        {/* Main Auth Card */}
        <motion.div
          variants={cardVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl ring-1 ring-[#e3e7e5]/50">
            <CardHeader className="text-center space-y-4 pb-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-[#f0f4f2] p-1">
                  <TabsTrigger
                    value="login"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              {/* Error Display with Animation */}
              <AnimatePresence mode="wait">
                {(formError || authError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {formError || authError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* Login Form */}
                {activeTab === "login" && (
                  <motion.div
                    key="login"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="login-email"
                          className="text-sm font-medium text-[#1a1f2b]"
                        >
                          Email Address
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                          <Input
                            id="login-email"
                            name="email"
                            type="email"
                            required
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20 transition-all duration-200"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="login-password"
                          className="text-sm font-medium text-[#1a1f2b]"
                        >
                          Password
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                          <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter your password"
                            className="pl-10 pr-12 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20 transition-all duration-200"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#556070] hover:text-[#1e6f5c] transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-[#1e6f5c] to-[#4cb8a9] hover:from-[#175a4a] hover:to-[#2e9b87] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isLoading || loading}
                      >
                        {isLoading || loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-sm text-[#1e6f5c] hover:text-[#175a4a] font-medium transition-colors"
                        >
                          Don't have an account?{" "}
                          <span className="underline">Sign up</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Registration Form */}
                {activeTab === "register" && (
                  <motion.div
                    key="register"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <form onSubmit={handleSubmit}>
                      {step === 1 && (
                        <div className="space-y-6">
                          {/* Progress Indicator */}
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center space-x-2 mb-3">
                              <div className="w-8 h-2 rounded-full bg-gradient-to-r from-[#1e6f5c] to-[#4cb8a9]"></div>
                              <div className="w-8 h-2 rounded-full bg-[#e3e7e5]"></div>
                            </div>
                            <p className="text-sm text-[#556070] font-medium">
                              Step 1 of 2: Basic Information
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="username"
                                className="text-sm font-medium text-[#1a1f2b]"
                              >
                                Username *
                              </Label>
                              <div className="relative group">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                                <Input
                                  id="username"
                                  name="username"
                                  required
                                  placeholder="Username"
                                  className="pl-10 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="fullName"
                                className="text-sm font-medium text-[#1a1f2b]"
                              >
                                Full Name *
                              </Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                required
                                placeholder="Full Name"
                                className="h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                value={formData.fullName}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="reg-email"
                              className="text-sm font-medium text-[#1a1f2b]"
                            >
                              Email Address *
                            </Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                              <Input
                                id="reg-email"
                                name="email"
                                type="email"
                                required
                                placeholder="Enter your email"
                                className="pl-10 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                value={formData.email}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="reg-password"
                              className="text-sm font-medium text-[#1a1f2b]"
                            >
                              Password *
                            </Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                              <Input
                                id="reg-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Create a password (min 8 characters)"
                                className="pl-10 pr-12 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                value={formData.password}
                                onChange={handleInputChange}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#556070] hover:text-[#1e6f5c] transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-[#8b95a1]">
                              Password must be at least 8 characters long
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              onClick={nextStep}
                              className="flex-1 h-12 bg-gradient-to-r from-[#1e6f5c] to-[#4cb8a9] hover:from-[#175a4a] hover:to-[#2e9b87] text-white font-medium shadow-lg"
                            >
                              Continue
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              type="submit"
                              variant="outline"
                              className="h-12 border-[#1e6f5c] text-[#1e6f5c] hover:bg-[#1e6f5c] hover:text-white"
                              disabled={isLoading || loading}
                            >
                              {isLoading || loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Skip"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-6">
                          {/* Progress Indicator */}
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center space-x-2 mb-3">
                              <div className="w-8 h-2 rounded-full bg-[#e3e7e5]"></div>
                              <div className="w-8 h-2 rounded-full bg-gradient-to-r from-[#1e6f5c] to-[#4cb8a9]"></div>
                            </div>
                            <p className="text-sm text-[#556070] font-medium">
                              Step 2 of 2: Additional Details (Optional)
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="phoneNumber"
                                className="text-sm font-medium text-[#1a1f2b]"
                              >
                                Phone
                              </Label>
                              <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                                <Input
                                  id="phoneNumber"
                                  name="phoneNumber"
                                  type="tel"
                                  placeholder="Phone number"
                                  className="pl-10 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                  value={formData.phoneNumber}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="dateOfBirth"
                                className="text-sm font-medium text-[#1a1f2b]"
                              >
                                Birth Date
                              </Label>
                              <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                                <Input
                                  id="dateOfBirth"
                                  name="dateOfBirth"
                                  type="date"
                                  className="pl-10 h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                  value={formData.dateOfBirth}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="gender"
                              className="text-sm font-medium text-[#1a1f2b]"
                            >
                              Gender
                            </Label>
                            <Select
                              value={formData.gender}
                              onValueChange={handleSelectChange}
                            >
                              <SelectTrigger className="h-12 border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="bio"
                              className="text-sm font-medium text-[#1a1f2b]"
                            >
                              Bio
                            </Label>
                            <div className="relative group">
                              <FileText className="absolute left-3 top-3 h-4 w-4 text-[#556070] group-focus-within:text-[#1e6f5c] transition-colors" />
                              <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell us about yourself..."
                                className="pl-10 min-h-[100px] resize-none border-[#e3e7e5] focus:border-[#1e6f5c] focus:ring-2 focus:ring-[#1e6f5c]/20"
                                value={formData.bio}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={prevStep}
                              className="h-12 border-[#e3e7e5] text-[#556070] hover:bg-[#f0f4f2]"
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 h-12 bg-gradient-to-r from-[#1e6f5c] to-[#4cb8a9] hover:from-[#175a4a] hover:to-[#2e9b87] text-white font-medium shadow-lg hover:shadow-xl"
                              disabled={isLoading || loading}
                            >
                              {isLoading || loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Create Account
                                  <CheckCircle2 className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>

                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-sm text-[#1e6f5c] hover:text-[#175a4a] font-medium transition-colors"
                      >
                        Already have an account?{" "}
                        <span className="underline">Sign in</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm text-[#8b95a1] leading-relaxed">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-[#1e6f5c] hover:text-[#175a4a] font-medium transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#1e6f5c] hover:text-[#175a4a] font-medium transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
