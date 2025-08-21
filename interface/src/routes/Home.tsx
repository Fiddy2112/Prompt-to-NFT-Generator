const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white">
      {/* Header */}
      <header className="p-6 text-center shadow-md bg-black bg-opacity-30">
        <h1 className="text-3xl font-extrabold tracking-wide">
          AI NFT Marketplace
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to the Future of NFTs
          </h2>
          <p className="text-lg md:text-xl opacity-90">
            Create, mint, and collect unique AI-generated NFTs seamlessly on our
            platform.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm opacity-70 bg-black bg-opacity-20">
        &copy; {new Date().getFullYear()} AI NFT Marketplace. All rights
        reserved.
      </footer>
    </div>
  );
};

export default Home;
