const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm h-16 md:hidden">
      <div className="flex flex-col justify-center items-center h-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-display sm:text-3xl font-bold text-green-600">M-Poster</h1>
        <h3 className="text-md font-display text-gray-800 mt-1 max-w-md text-center">Your M-Pesa Payment Poster</h3>
      </div>
    </header>
  );
};

export default Header;
