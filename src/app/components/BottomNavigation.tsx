import { Home, User, Zap, MessageCircle, Settings, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16 px-4">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center"
        >
          <Home 
            className={`w-6 h-6 ${isActive('/') ? 'text-[#8B1538]' : 'text-gray-500'}`}
            fill={isActive('/') ? '#8B1538' : 'none'}
          />
        </button>
        
        <button className="flex flex-col items-center justify-center">
          <User className="w-6 h-6 text-gray-500" />
        </button>
        
        <button className="flex flex-col items-center justify-center">
          <Zap className="w-6 h-6 text-gray-500" />
        </button>
        
        <button className="flex flex-col items-center justify-center">
          <MessageCircle className="w-6 h-6 text-gray-500" />
        </button>
        
        <button className="flex flex-col items-center justify-center">
          <Settings className="w-6 h-6 text-gray-500" />
        </button>
        
        <button
          onClick={() => navigate('/sliply')}
          className="flex flex-col items-center justify-center"
        >
          <DollarSign 
            className={`w-6 h-6 ${isActive('/sliply') || location.pathname.includes('/sliply') ? 'text-[#8B1538]' : 'text-gray-500'}`}
            fill={isActive('/sliply') || location.pathname.includes('/sliply') ? '#8B1538' : 'none'}
          />
        </button>
      </div>
    </div>
  );
}