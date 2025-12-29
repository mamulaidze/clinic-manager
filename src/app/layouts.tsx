import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import logoUrl from "@/assets/logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const { lang, setLang, t } = useI18n();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:gap-4">
          <div className="flex flex-row items-start justify-between gap-2 sm:items-end">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Clinic Manager" className="h-10 w-10" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {t("appTitle")}
                </p>
                <h1 className="text-2xl font-semibold font-display">{t("dashboard")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex rounded-full border bg-white/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLang("ka")}
                  className={`px-3 py-1 font-semibold transition ${
                    lang === "ka"
                      ? "rounded-full bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  KA
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 font-semibold transition ${
                    lang === "en"
                      ? "rounded-full bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  EN
                </button>
              </div>
              <Button
                variant="outline"
                onClick={signOut}
                className="hidden gap-2 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="sm:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLang("ka")}>KA</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("en")}>EN</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="shrink-0">{t("signedInAs")}</span>
            <span className="font-semibold text-foreground truncate">{user?.email}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
