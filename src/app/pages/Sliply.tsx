import { BottomNavigation } from '../components/BottomNavigation';
import { UserCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProfileModal } from '../components/ProfileModal';
import { useState } from 'react';

const properties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGJlZHJvb218ZW58MXx8fHwxNzc1NDg0MDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Depa Colibri Tec',
    location: 'Monterrey, Monterrey',
    roomies: ['Ana G.', 'Abril S.', 'Luis M.', 'Teresa H.']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1713359003488-53609bbd95c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwYmx1ZXxlbnwxfHx8fDE3NzU0ODQwODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Depa Colibri Tec',
    location: 'Monterrey, Monterrey',
    roomies: ['Ana G.', 'Abril S.', 'Luis M.', 'Teresa H.']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1706808849803-f61304e024ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZSUyMGV4dGVyaW9yJTIwbW9kZXJufGVufDF8fHx8MTc3NTQ4NDA4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Depa Colibri Tec',
    location: 'Monterrey, Monterrey',
    roomies: ['Ana G.', 'Abril S.', 'Luis M.', 'Teresa H.']
  }
];

export function Sliply() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="h-screen w-[390px] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-[#8B1538]">Sliply</h1>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-12 h-12 rounded-full bg-[#8B1538] flex items-center justify-center hover:bg-[#6b0f2a] transition-colors"
          >
            <UserCircle className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-auto px-6 space-y-4 pb-4 custom-scrollbar">
        {properties.map((property) => (
          <div 
            key={property.id}
            onClick={() => navigate(`/sliply/property/${property.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Property Image */}
            <img 
              src={property.image}
              alt={property.name}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />

            {/* Property Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-600">{property.location}</p>
              
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Roomies:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {property.roomies.map((roomie, index) => (
                    <p key={index} className="text-xs text-gray-700">{roomie}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}