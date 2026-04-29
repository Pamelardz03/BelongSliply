import { UserCircle } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProfileModal } from '../components/ProfileModal';
import { useState } from 'react';

export function Home() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="h-screen w-[390px] flex flex-col bg-white mx-auto border-x shadow-lg">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#8B1538]">Home</h1>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-[#8B1538] flex items-center justify-center hover:bg-[#6b0f2a] transition-colors"
          >
            <UserCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Map Screenshot */}
      <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15099.999!2d-100.3161126!3d25.6866142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2smx!4v1700000000000!5m2!1ses!2smx"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}