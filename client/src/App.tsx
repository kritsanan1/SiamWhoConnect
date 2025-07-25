import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ProfileSetup from "@/pages/profile-setup";
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Chats from "@/pages/chats";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={user?.isProfileComplete ? Home : ProfileSetup} />
          <Route path="/profile-setup" component={ProfileSetup} />
          <Route path="/discover" component={Discover} />
          <Route path="/matches" component={Matches} />
          <Route path="/chats" component={Chats} />
          <Route path="/chat/:matchId" component={Chat} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
