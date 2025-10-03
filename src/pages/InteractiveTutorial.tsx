import { InteractiveTutorial } from "@/components/InteractiveTutorial";

const InteractiveTutorialPage = () => {
  return (
    <div 
      className="h-dvh w-full bg-background"
      style={{
        paddingTop: `max(1rem, env(safe-area-inset-top))`,
        paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <InteractiveTutorial />
    </div>
  );
};

export default InteractiveTutorialPage;
