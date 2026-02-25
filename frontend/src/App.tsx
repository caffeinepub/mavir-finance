import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import LandingPage from './pages/LandingPage';
import CalculatorsPage from './pages/CalculatorsPage';
import ApplyPage from './pages/ApplyPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import Footer from './components/Footer';

// ─── Layout ───────────────────────────────────────────────────────────────────

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const calculatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculators',
  component: CalculatorsPage,
});

const applyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apply',
  component: ApplyPage,
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: CustomerPortalPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  calculatorsRoute,
  applyRoute,
  portalRoute,
  adminRoute,
  loginRoute,
  registerRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
