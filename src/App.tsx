import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import ProjectsPage from "@/pages/Projects";
import ProjectDetailPage from "@/pages/ProjectDetail";
import ActivityPage from "@/pages/Activity";
import BlogListPage from "@/pages/BlogList";
import PostDetailPage from "@/pages/PostDetail";
import PlaygroundPage from "@/pages/Playground";

const StudioApp = lazy(() => import("@/pages/admin/StudioApp"));

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/studio/*"
        element={
          <Suspense fallback={<div className="p-10 text-sm text-ink/40">Loading studio…</div>}>
            <StudioApp />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen">
            <Header />
            <main className="mx-auto max-w-content px-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<PostDetailPage />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
