import { AgentOrchestrator } from "@/components/AgentOrchestrator";
import { ElevenLabsGenerator } from "@/components/ElevenLabsGenerator";
import { ElevenLabsTest } from "@/components/ElevenLabsTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* ElevenLabs API Test */}
      <ElevenLabsTest />
      
      <div className="mt-8">
        {/* Switch between components - for now showing ElevenLabs only */}
        <ElevenLabsGenerator />
      </div>
      
      {/* Original AgentOrchestrator with all providers - uncomment to use */}
      {/* <AgentOrchestrator /> */}
    </div>
  );
};

export default Index;
