import Sidebar from '@/components/layout/Sidebar';
import WorkflowCanvas from '@/components/layout/WorkflowCanvas';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar />
      <WorkflowCanvas />
    </main>
  );
}
