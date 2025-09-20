import { AgentOrchestrator } from "@/components/AgentOrchestrator";
import { ElevenLabsGenerator } from "@/components/ElevenLabsGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Switch between components - for now showing ElevenLabs only */}
      <ElevenLabsGenerator />
      
      {/* Original AgentOrchestrator with all providers - uncomment to use */}
      {/* <AgentOrchestrator /> */}
    </div>
  );
};

export default Index;
