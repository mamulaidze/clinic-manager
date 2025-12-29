import { useState } from "react";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import logoUrl from "@/assets/logo.svg";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, isLoading } = useAuth();
  const { lang, setLang, t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) throw error;
        toast.success(t("welcomeBack"));
      } else {
        const { error } = await supabase.auth.signUp(values);
        if (error) throw error;
        toast.success(t("accountCreated"));
        setMode("login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authFailed");
      toast.error(message);
    }
  };

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Clinic Manager" className="h-10 w-10" />
            <CardTitle className="text-2xl font-display">{t("appTitle")}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? t("signInHint") : t("createAccountHint")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {mode === "login" ? t("signIn") : t("createAccount")}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="text-muted-foreground">{t("language")}</span>
            <div className="flex rounded-full border bg-white/80 p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setLang("ka")}
                className={`px-2 py-1 font-semibold transition ${
                  lang === "ka" ? "rounded-full bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                KA
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 font-semibold transition ${
                  lang === "en" ? "rounded-full bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "login" ? t("noAccount") : t("alreadyHaveAccount")}{" "}
            <button
              type="button"
              className="font-semibold text-primary"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? t("register") : t("signIn")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
