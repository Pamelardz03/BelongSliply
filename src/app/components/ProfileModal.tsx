import { X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userType, setUserType, userName, setUserName } = useUser();

  if (!isOpen) return null;

  const toggleUserType = () => {
    setUserType(userType === 'propietario' ? 'roomie' : 'propietario');
  };

  const availableUsers = [
    { name: 'Propietario', type: 'propietario' as const },
    { name: 'Ana G.', type: 'roomie' as const },
    { name: 'Abril S.', type: 'roomie' as const },
    { name: 'Luis M.', type: 'roomie' as const },
    { name: 'Teresa H.', type: 'roomie' as const },
  ];

  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[340px] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900">Perfil</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usuario actual</p>
              <p className="text-lg font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">
                {userType === 'propietario' ? 'Propietario' : 'Roomie'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#8B1538] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {userName.charAt(0)}
              </span>
            </div>
          </div>

          {/* User Selector */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Cambiar usuario (Demostración)</p>
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <button
                  key={user.name}
                  onClick={() => {
                    setUserName(user.name);
                    setUserType(user.type);
                  }}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                    userName === user.name
                      ? 'bg-[#8B1538] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userName === user.name ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      <span className={`text-sm font-semibold ${
                        userName === user.name ? 'text-white' : 'text-gray-600'
                      }`}>
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className={`text-xs ${userName === user.name ? 'text-white/70' : 'text-gray-500'}`}>
                        {user.type === 'propietario' ? 'Propietario' : 'Roomie'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            Cambia de usuario para probar diferentes permisos
          </div>
        </div>
      </div>
    </div>
  );
}