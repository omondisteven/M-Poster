import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Header = () => {
  const isOnline = useNetworkStatus();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);

  // Listen for install prompt availability
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Optional: detect if installed manually (some browsers won't trigger event)
    window.addEventListener('appinstalled', () => {
      setHasInstalled(true);
      toast.success('App installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setHasInstalled(true);
        setShowInstall(false);
        toast.success('App installed successfully!');
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 px-4 bg-gray-600 border-b border-gray-300 shadow-sm md:hidden w-full">
      <div className="relative flex items-center justify-between w-full max-w-7xl mx-auto px-2">

        {/* Install Button (Left) */}
        <div className="w-1/6 flex justify-start">
          {showInstall && !hasInstalled && (
            <button
              onClick={handleInstall}
              className="text-white hover:text-green-300 transition relative group"
              aria-label="Install App"
            >
              <DownloadIcon className="w-6 h-6" />
              {/* Tooltip */}
              <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Install App
              </span>
            </button>
          )}
        </div>

        {/* Centered Title & Subtitle */}
        <div className="w-4/6 flex flex-col items-center text-center">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-green-500">M-Poster</h1>
          <h3 className="text-sm font-display text-white mt-0.5">
            Your M-Pesa Payment Poster
          </h3>
        </div>

        {/* Online/Offline Indicator (Right) */}
        <div className="w-1/6 flex justify-end">
          <span
            className={`text-xs font-semibold ${
              isOnline ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
