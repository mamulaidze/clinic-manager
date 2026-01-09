import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import logoUrl from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AppLayout({
  children,
  sidebarContent,
}: {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}) {
  const { signOut, user } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarOpen = true;
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:gap-4">
          <div className="flex flex-row items-start justify-between gap-2 sm:items-end">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="sm:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <img src={logoUrl} alt="Clinic Manager" className="h-10 w-10" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {t("appTitle")}
                </p>
                <h1 className="text-2xl font-semibold font-display">{t("dashboard")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div
        className={cn(
          "mx-auto flex max-w-7xl gap-4 px-4 py-8",
          sidebarOpen ? "sm:pl-[240px]" : "sm:pl-[92px]"
        )}
      >
        <aside
          className={cn(
            "hidden shrink-0 flex-col gap-4 border bg-card/90 p-3 shadow-sm sm:flex",
            "fixed left-3 top-[96px] bottom-6 rounded-2xl",
            "z-30",
            "w-56"
          )}
        >
          <nav className="space-y-2 text-sm">
            <a
              href="#top"
              className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 font-semibold text-primary"
            >
              <LayoutDashboard className="h-4 w-4" />
              {sidebarOpen && <span>{t("dashboard")}</span>}
            </a>
          </nav>
          <div className="text-[11px] text-muted-foreground">
            {sidebarOpen && (
              <>
                <div>{t("signedInAs")}</div>
                <div className="font-semibold text-foreground truncate">{user?.email}</div>
              </>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          <div className="mt-auto space-y-2 border-t pt-3">
            {sidebarOpen && (
              <div className="flex rounded-full border bg-card/80 p-1 text-[11px]">
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
            )}
            <Button variant="outline" onClick={signOut} className="h-8 w-full gap-2 text-xs">
              <LogOut className="h-4 w-4" />
              {sidebarOpen && t("signOut")}
            </Button>
            <div className="text-xs text-muted-foreground">
              {sidebarOpen && <span>Clinic Manager v1</span>}
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="left-0 top-0 h-full max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r bg-background p-4 sm:hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Sidebar menu</DialogTitle>
            <DialogDescription className="sr-only">
              Navigation and account controls
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Clinic Manager" className="h-10 w-10" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {t("appTitle")}
              </p>
              <h2 className="text-lg font-semibold">{t("dashboard")}</h2>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground">
            <div>{t("signedInAs")}</div>
            <div className="font-semibold text-foreground truncate">{user?.email}</div>
          </div>
          <div className="mt-4 space-y-2">
            {sidebarContent}
          </div>
          <div className="mt-auto space-y-3 border-t pt-3">
            <div className="flex rounded-full border bg-card/80 p-1 text-[11px]">
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
            <Button variant="outline" onClick={signOut} className="h-8 w-full gap-2 text-xs">
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </Button>
            <div className="text-xs text-muted-foreground">Clinic Manager v1</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
