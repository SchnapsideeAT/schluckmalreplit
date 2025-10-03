// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div 
      className="flex min-h-dvh items-center justify-center bg-background"
      style={{
        paddingTop: `max(1rem, env(safe-area-inset-top))`,
        paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
