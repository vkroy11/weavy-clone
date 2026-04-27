import Sidebar from '@/components/layout/Sidebar';
import WorkflowCanvas from '@/components/layout/WorkflowCanvas';
import { FirstRunGate } from '@/components/onboarding/FirstRunGate';
import { SessionPicker } from '@/components/sessions/SessionPicker';

export default function AppHome() {
  return (
    <FirstRunGate>
      <SessionPicker>
        <main className="flex h-screen w-screen overflow-hidden bg-canvas">
          <Sidebar />
          <WorkflowCanvas />
        </main>
      </SessionPicker>
    </FirstRunGate>
  );
}
