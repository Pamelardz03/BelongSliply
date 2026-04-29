import { X, Bell, CreditCard, Plus, AlertTriangle } from 'lucide-react';

interface Notification {
  id: number;
  type: 'payment_created' | 'payment_done' | 'payment_due';
  title: string;
  property: string;
  paymentName: string;
  amount?: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'payment_created',
    title: 'Nuevo pago creado',
    property: 'Colibri Tec',
    paymentName: 'Servicio de Luz',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: 2,
    type: 'payment_done',
    title: 'Luis M. realizó pago',
    property: 'Colibri Tec',
    paymentName: 'Renta Marzo',
    amount: '+$800',
    time: 'Hace 1 hora',
    read: false,
  },
  {
    id: 3,
    type: 'payment_due',
    title: 'Pago vence mañana',
    property: 'Colibri Tec',
    paymentName: 'Internet Feb',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: 4,
    type: 'payment_done',
    title: 'Abril S. realizó pago',
    property: 'Colibri Tec',
    paymentName: 'Gas Febrero',
    amount: '+$800',
    time: 'Ayer',
    read: true,
  },
  {
    id: 5,
    type: 'payment_created',
    title: 'Nuevo pago creado',
    property: 'Colibri Tec',
    paymentName: 'Gas Febrero',
    time: 'Hace 2 días',
    read: true,
  },
  {
    id: 6,
    type: 'payment_due',
    title: 'Pago vence mañana',
    property: 'Colibri Tec',
    paymentName: 'Renta Marzo',
    time: 'Hace 3 días',
    read: true,
  },
];

const iconMap = {
  payment_created: <Plus className="w-4 h-4 text-white" />,
  payment_done: <CreditCard className="w-4 h-4 text-white" />,
  payment_due: <AlertTriangle className="w-4 h-4 text-white" />,
};

const colorMap = {
  payment_created: 'bg-[#8B1538]',
  payment_done: 'bg-green-500',
  payment_due: 'bg-amber-500',
};

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[340px] max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#8B1538]" />
            <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="bg-[#8B1538] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {DEMO_NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-6 py-4 transition-colors ${
                !notif.read ? 'bg-rose-50' : 'bg-white'
              }`}
            >
              {/* Ícono */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorMap[notif.type]}`}>
                {iconMap[notif.type]}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#8B1538] shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{notif.paymentName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{notif.property}</span>
                  {notif.amount && (
                    <span className="text-xs font-semibold text-green-600">{notif.amount}</span>
                  )}
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}