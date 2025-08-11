import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Dashboard from "@/pages/dashboard";
import LogAttendance from "@/pages/log-attendance";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import TabBar from "@/components/tab-bar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-ios-bg-light dark:bg-ios-bg-dark pb-20">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/log" component={LogAttendance} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      <TabBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
