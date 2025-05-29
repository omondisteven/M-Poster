const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 px-4 sm:px-6 lg:px-8 bg-white shadow-sm md:hidden">
      <div className="max-w-7xl mx-auto flex-col justify-center flex items-center">
        <h1 className="text-2xl font-display sm:text-3xl font-bold text-green-600">M-Poster</h1>
        <h3 className="text-md font-display text-gray-800 mt-2 max-w-md">Your M-Pesa Payment Poster</h3>
      </div>
    </header>
  );
};

export default Header;
