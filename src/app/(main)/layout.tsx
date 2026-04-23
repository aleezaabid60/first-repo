import Sidebar from "../components/Sidebar";
import AIChatbot from "../components/AIChatbot";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full flex bg-background h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <AIChatbot />
    </div>
  );
}
