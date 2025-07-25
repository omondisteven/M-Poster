// /src/components/ui/header.tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Header = () => {
  const isOnline = useNetworkStatus();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 px-4 sm:px-6 lg:px-8 bg-gray-600 border-b border-gray-300 shadow-sm md:hidden w-full">
      <div className="max-w-7xl mx-auto flex-col justify-center flex items-center w-full px-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-green-600">M-Poster</h1>
            <h3 className="text-sm sm:text-md font-display text-white mt-1 sm:mt-2 max-w-full px-2 text-center">
              Your M-Pesa Payment Poster
            </h3>
          </div>
          <div className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Status: Online' : 'Status: Offline'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;