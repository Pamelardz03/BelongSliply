import { UserCircle, ArrowLeft, X, Bell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProfileModal } from '../components/ProfileModal';
import { DatePicker } from '../components/DatePicker';
import { useState, useEffect, useRef } from 'react';
import { Pencil, Plus, CalendarIcon, Trash2 } from 'lucide-react';
import { useUser } from "../contexts/UserContext";
import { NotificationsPanel } from '../components/NotificationsPanel';

type PaymentStatus = 'paid' | 'unpaid';

interface Roomie {
  name: string;
  status: PaymentStatus;
  paidDate?: string;
  percentage?: number;  // % asignado a este roomie
}

interface Payment {
  id: number;
  name: string;
  category: string;
  dueDate: string;
  roomies: Roomie[];
  status: 'proximos' | 'completados' | 'atrasados';
  totalAmount?: number;
  frequency?: string;
}

const initialPaymentsData: Payment[] = [
  {
    id: 1,
    name: 'Nombre Pago',
    category: 'Servicios Luz',
    dueDate: '20 febrero 2026',
    roomies: [
      { name: 'Ana G.', status: 'paid', paidDate: '15 feb 2026' },
      { name: 'Abril S.', status: 'unpaid' },
      { name: 'Luis M.', status: 'paid', paidDate: '14 feb 2026' },
      { name: 'Teresa H.', status: 'unpaid' },
    ],
    status: 'proximos'
  },
  {
    id: 2,
    name: 'Renta Marzo',
    category: 'Renta',
    dueDate: '1 marzo 2026',
    roomies: [
      { name: 'Ana G.', status: 'paid', paidDate: '28 feb 2026' },
      { name: 'Abril S.', status: 'paid', paidDate: '27 feb 2026' },
      { name: 'Luis M.', status: 'paid', paidDate: '26 feb 2026' },
      { name: 'Teresa H.', status: 'paid', paidDate: '28 feb 2026' },
    ],
    status: 'completados'
  },
  {
    id: 3,
    name: 'Internet Feb',
    category: 'Servicios Internet',
    dueDate: '15 febrero 2026',
    roomies: [
      { name: 'Ana G.', status: 'unpaid' },
      { name: 'Abril S.', status: 'unpaid' },
      { name: 'Luis M.', status: 'unpaid' },
      { name: 'Teresa H.', status: 'unpaid' },
    ],
    status: 'atrasados'
  },
  {
    id: 4,
    name: 'Gas Febrero',
    category: 'Servicios Gas',
    dueDate: '25 febrero 2026',
    roomies: [
      { name: 'Ana G.', status: 'paid', paidDate: '20 feb 2026' },
      { name: 'Abril S.', status: 'paid', paidDate: '19 feb 2026' },
      { name: 'Luis M.', status: 'unpaid' },
      { name: 'Teresa H.', status: 'paid', paidDate: '21 feb 2026' },
    ],
    status: 'proximos'
  }
];

type FilterType = 'proximos' | 'completados' | 'atrasados' | 'todos';

export function PropertyPayments() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { userType, userName } = useUser();
  const [payments, setPayments] = useState<Payment[]>(initialPaymentsData);
  const [activeFilter, setActiveFilter] = useState<FilterType>('proximos');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [equalDistribution, setEqualDistribution] = useState(true);
  const [distributions, setDistributions] = useState<{ [key: string]: number }>({});
  const [paymentMethod, setPaymentMethod] = useState('**** 1234');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  // Swipe states
  const [swipedPaymentId, setSwipedPaymentId] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  // Delete from list states
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [showDeleteListConfirmation, setShowDeleteListConfirmation] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRoomie, setSelectedRoomie] = useState<Roomie | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'unico' | 'programado'>('unico');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [scheduledEndDate, setScheduledEndDate] = useState('');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Función para abrir modal de edición con datos pre-cargados
  const handleEditPayment = (payment: Payment) => {
    // Pre-cargar el nombre
    setFormName(payment.name);

    // Pre-cargar la categoría
    setFormCategory(payment.category);

    // Pre-cargar responsables basándose en los roomies del pago
    // Mapear nombres de roomies a IDs de personas registradas
    const responsibleIds = payment.roomies.map(roomie => {
      const person = registeredPeople.find(p => p.name === roomie.name);
      return person?.id;
    }).filter(id => id !== undefined) as string[];

    setSelectedResponsibles(responsibleIds);

    // Pre-cargar distribución de porcentajes desde los roomies guardados
    const initialDistributions: { [key: string]: number } = {};
    responsibleIds.forEach((id, index) => {
      const person = registeredPeople.find(p => p.id === id);
      const existingRoomie = payment.roomies.find(r => r.name === person?.name);
      if (existingRoomie?.percentage !== undefined) {
        initialDistributions[id] = existingRoomie.percentage;
      } else {
        const percentage = Math.floor(100 / responsibleIds.length);
        const remainder = 100 - (percentage * responsibleIds.length);
        initialDistributions[id] = index === 0 ? percentage + remainder : percentage;
      }
    });

    setDistributions(initialDistributions);
    setEqualDistribution(true);

    // Pre-cargar fechas (convertir de formato legible a formato de input date)
    // Por ahora dejamos vacías ya que necesitaríamos parsear "20 febrero 2026"
    setFormStartDate('');
    setFormEndDate('');

    // Pre-cargar frecuencia y monto guardados
    setFormFrequency(payment.frequency || 'Mensual');
    setPaymentAmount(payment.totalAmount ? String(payment.totalAmount) : '');

    // Pre-cargar método de pago
    setPaymentMethod('**** 1234');

    // Establecer modo edición
    setIsEditMode(true);
    setEditingPaymentId(payment.id);
    setIsCreatePaymentOpen(true);
  };

  const categories = [
    'Servicios Luz',
    'Servicios Gas',
    'Servicios Internet',
    'Servicios Agua',
    'Renta',
    'Mantenimiento',
    ...customCategories,
  ];

  const frequencies = ['Único', 'Semanal', 'Quincenal', 'Mensual', 'Bimestral', 'Trimestral', 'Anual'];

  const toggleResponsible = (personId: string) => {
    setSelectedResponsibles(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  // Recalcular distribución automáticamente cuando cambian los responsables y está activado "Todos por igual"
  useEffect(() => {
    if (equalDistribution && selectedResponsibles.length > 0) {
      const percentage = Math.floor(100 / selectedResponsibles.length);
      const remainder = 100 - (percentage * selectedResponsibles.length);
      const newDistributions: { [key: string]: number } = {};

      selectedResponsibles.forEach((id, index) => {
        newDistributions[id] = index === 0 ? percentage + remainder : percentage;
      });

      setDistributions(newDistributions);
    }
  }, [selectedResponsibles, equalDistribution]);

  const addCustomCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCustomCategories(prev => [...prev, newCategory.trim()]);
      setFormCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleDeletePayment = () => {
    // Si estamos en modo edición, verificar si es recurrente
    if (isEditMode && editingPaymentId !== null) {
      // Si el pago tiene frecuencia recurrente (no es "Único"), mostrar opciones
      if (formFrequency !== 'Único' && formFrequency !== '') {
        // Simplemente cerrar el modal de confirmación simple y dejar el showDeleteConfirmation como está
        // El modal ya mostrará las opciones correctas
        return;
      }

      // Si es un pago único o no tiene frecuencia, eliminar directamente
      setPayments(prevPayments =>
        prevPayments.filter(payment => payment.id !== editingPaymentId)
      );
    }

    // Limpiar todos los campos del formulario
    setFormName('');
    setSelectedResponsibles([]);
    setFormCategory('');
    setFormStartDate('');
    setFormEndDate('');
    setFormFrequency('');
    setEqualDistribution(true);
    setDistributions({});
    setPaymentMethod('**** 1234');
    setShowAddCategory(false);
    setNewCategory('');
    setShowDeleteConfirmation(false);
    setIsCreatePaymentOpen(false);
    setIsEditMode(false);
    setEditingPaymentId(null);
  };

  const confirmDeleteFromForm = (deleteType: 'once' | 'all') => {
    if (editingPaymentId !== null) {
      if (deleteType === 'once') {
        // Eliminar solo este pago
        setPayments(prevPayments =>
          prevPayments.filter(payment => payment.id !== editingPaymentId)
        );
      } else {
        // Eliminar todas las recurrencias
        setPayments(prevPayments =>
          prevPayments.filter(payment => payment.id !== editingPaymentId)
        );
      }
    }

    // Limpiar todos los campos del formulario
    setFormName('');
    setSelectedResponsibles([]);
    setFormCategory('');
    setFormStartDate('');
    setFormEndDate('');
    setFormFrequency('');
    setEqualDistribution(true);
    setDistributions({});
    setPaymentMethod('**** 1234');
    setShowAddCategory(false);
    setNewCategory('');
    setShowDeleteConfirmation(false);
    setIsCreatePaymentOpen(false);
    setIsEditMode(false);
    setEditingPaymentId(null);
  };

  const resetForm = () => {
    setFormName('');
    setSelectedResponsibles([]);
    setFormCategory('');
    setFormStartDate('');
    setFormEndDate('');
    setFormFrequency('');
    setEqualDistribution(true);
    setDistributions({});
    setPaymentMethod('**** 1234');
    setShowAddCategory(false);
    setNewCategory('');
    setIsEditMode(false);
    setEditingPaymentId(null);
  };

  const handleSavePayment = () => {
    if (isEditMode && editingPaymentId !== null) {
      // Si estamos editando, mostrar modal de confirmación
      setShowEditConfirmation(true);
    } else {
      // Modo creación: agregar nuevo pago directamente
      saveNewPayment();
    }
  };

  const saveNewPayment = () => {
    const totalAmount = parseFloat(paymentAmount) || 0;
    const newRoomies: Roomie[] = selectedResponsibles.map(responsibleId => {
      const person = registeredPeople.find(p => p.id === responsibleId);
      return {
        name: person?.name || '',
        status: 'unpaid' as PaymentStatus,
        percentage: distributions[responsibleId] || 0,
      };
    });

    const newPayment: Payment = {
      id: Math.max(...payments.map(p => p.id)) + 1,
      name: formName,
      category: formCategory,
      dueDate: formStartDate ? new Date(formStartDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
      roomies: newRoomies,
      status: 'proximos',
      totalAmount: parseFloat(paymentAmount) || undefined,
    };

    setPayments(prevPayments => [...prevPayments, newPayment]);

    // Cerrar modal y resetear formulario
    resetForm();
    setIsCreatePaymentOpen(false);
  };

  const confirmEditPayment = (editType: 'once' | 'all') => {
    if (editingPaymentId !== null) {
      const totalAmount = parseFloat(paymentAmount) || 0;
      setPayments(prevPayments =>
        prevPayments.map(payment => {
          if (payment.id === editingPaymentId) {
            // Crear nuevos roomies basados en los responsables seleccionados
            const updatedRoomies: Roomie[] = selectedResponsibles.map(responsibleId => {
              const person = registeredPeople.find(p => p.id === responsibleId);
              // Mantener el estado de pago original si existe
              const existingRoomie = payment.roomies.find(r => r.name === person?.name);
              return {
                name: person?.name || '',
                status: existingRoomie?.status || 'unpaid',
                paidDate: existingRoomie?.paidDate,
                percentage: distributions[responsibleId] || 0,
              };
            });

            return {
              ...payment,
              name: formName,
              category: formCategory,
              roomies: updatedRoomies,
              totalAmount: totalAmount,
              frequency: formFrequency,
            };
          }
          return payment;
        })
      );
    }

    // Cerrar modales y resetear formulario
    setShowEditConfirmation(false);
    resetForm();
    setIsCreatePaymentOpen(false);
  };

  const calculateTotalPercentage = () => {
    return Object.values(distributions).reduce((sum, val) => sum + (val || 0), 0);
  };

  const isPercentageValid = () => {
    const total = calculateTotalPercentage();
    return total === 100;
  };

  const handleEqualDistributionChange = (checked: boolean) => {
    setEqualDistribution(checked);
    if (checked && selectedResponsibles.length > 0) {
      // Distribuir equitativamente
      const percentage = Math.floor(100 / selectedResponsibles.length);
      const remainder = 100 - (percentage * selectedResponsibles.length);
      const newDistributions: { [key: string]: number } = {};

      selectedResponsibles.forEach((id, index) => {
        // Añadir el residuo al primer responsable
        newDistributions[id] = index === 0 ? percentage + remainder : percentage;
      });

      setDistributions(newDistributions);
    }
  };

  const getRoomieAmount = (payment: Payment, roomie: Roomie): string => {
    if (!payment.totalAmount) return '';
    const pct = roomie.percentage ?? (100 / (payment.roomies.length || 1));
    const amount = (payment.totalAmount * pct) / 100;
    return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredPayments = activeFilter === 'todos'
    ? payments
    : payments.filter(p => p.status === activeFilter);

  const getPaidCount = (roomies: Roomie[]) => {
    const paid = roomies.filter(r => r.status === 'paid').length;
    return { paid, total: roomies.length };
  };

  // Swipe handlers
  const handleTouchStart = (paymentId: number, e: React.TouchEvent) => {
    // Solo propietarios pueden hacer swipe
    if (userType !== 'propietario') return;

    setSwipedPaymentId(paymentId);
    // Si el pago ya está deslizado, ajustar el punto de inicio considerando el offset actual
    startX.current = e.touches[0].clientX - (swipedPaymentId === paymentId ? swipeOffset : 0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo propietarios pueden hacer swipe
    if (userType !== 'propietario') return;

    if (isDragging && swipedPaymentId !== null) {
      const currentX = e.touches[0].clientX;
      const offset = currentX - startX.current;
      // Permitir movimiento en ambas direcciones, pero no más allá de 0 hacia la derecha
      // y limitar a -100px hacia la izquierda
      const clampedOffset = Math.max(-100, Math.min(0, offset));
      setSwipeOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    // Solo propietarios pueden hacer swipe
    if (userType !== 'propietario') return;

    if (isDragging && swipedPaymentId !== null) {
      if (swipeOffset < -60) {
        // Si se desliza más de -60px, mostrar el modal de confirmación
        setSwipeOffset(-80);
        // Aquí se mostraría el modal cuando el usuario toque el ícono de eliminar
      } else {
        // Si no alcanzó el umbral, regresar a la posición original
        setSwipeOffset(0);
        setSwipedPaymentId(null);
      }
      setIsDragging(false);
    }
  };

  const handleDeleteClick = (paymentId: number) => {
    // Solo propietarios pueden eliminar
    if (userType !== 'propietario') return;

    setDeletingPaymentId(paymentId);
    const payment = payments.find(p => p.id === paymentId);

    // Si el pago tiene frecuencia recurrente (no es "Único"), mostrar opciones
    if (payment && formFrequency !== 'Único') {
      setShowDeleteListConfirmation(true);
    } else {
      // Si es un pago único, eliminar directamente
      setPayments(prevPayments =>
        prevPayments.filter(p => p.id !== paymentId)
      );
      setSwipeOffset(0);
      setSwipedPaymentId(null);
    }
  };

  const confirmDeletePayment = (deleteType: 'once' | 'all') => {
    if (deletingPaymentId !== null) {
      if (deleteType === 'once') {
        // Eliminar solo este pago
        setPayments(prevPayments =>
          prevPayments.filter(payment => payment.id !== deletingPaymentId)
        );
      } else {
        // Eliminar todas las recurrencias (en este caso, eliminar el pago)
        setPayments(prevPayments =>
          prevPayments.filter(payment => payment.id !== deletingPaymentId)
        );
      }
    }

    setShowDeleteListConfirmation(false);
    setDeletingPaymentId(null);
    setSwipeOffset(0);
    setSwipedPaymentId(null);
  };

  const handleRoomieClick = (roomie: Roomie, payment: Payment) => {
    // Solo abrir modal si el roomie no ha pagado Y es el usuario actual
    if (roomie.status === 'unpaid' && roomie.name === userName) {
      setSelectedPayment(payment);
      setSelectedRoomie(roomie);
      setShowPaymentModal(true);
    }
  };

  const confirmPayment = () => {
    if (selectedPayment && selectedRoomie) {
      // Actualizar el estado del pago del roomie
      setPayments(prevPayments =>
        prevPayments.map(payment => {
          if (payment.id === selectedPayment.id) {
            return {
              ...payment,
              roomies: payment.roomies.map(r =>
                r.name === selectedRoomie.name
                  ? {
                    ...r,
                    status: 'paid' as PaymentStatus,
                    paidDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  }
                  : r
              )
            };
          }
          return payment;
        })
      );

      // Actualizar el selectedPayment para reflejar el cambio en el modal de detalles si está abierto
      setSelectedPayment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          roomies: prev.roomies.map(r =>
            r.name === selectedRoomie.name
              ? {
                ...r,
                status: 'paid' as PaymentStatus,
                paidDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
              }
              : r
          )
        };
      });
    }

    // Cerrar modal de pago y limpiar selectedRoomie
    setShowPaymentModal(false);
    setSelectedRoomie(null);
  };

  const closeCheckout = () => {
    setShowCheckoutModal(false);
    setShowPaymentModal(false);
    setSelectedRoomie(null);
    setPaymentTab('unico');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCVV('');
    setScheduledEndDate('');
    setShowPaymentSuccess(false);
  };

  // Mock data de personas registradas en la propiedad
  const registeredPeople = [
    { id: '1', name: 'Propietario', type: 'owner', avatar: '' },
    { id: '2', name: 'Ana G.', type: 'roomie', avatar: '' },
    { id: '3', name: 'Abril S.', type: 'roomie', avatar: '' },
    { id: '4', name: 'Luis M.', type: 'roomie', avatar: '' },
    { id: '5', name: 'Teresa H.', type: 'roomie', avatar: '' },
  ];

  return (
    <div className="h-screen w-[390px] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/sliply')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-[#8B1538]">Colibri Tec</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B1538] rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-[#8B1538] flex items-center justify-center" onClick={() => setIsProfileModalOpen(true)}>
              <UserCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter('proximos')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeFilter === 'proximos'
              ? 'bg-[#8B1538] text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setActiveFilter('completados')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeFilter === 'completados'
              ? 'bg-[#8B1538] text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Completados
          </button>
          <button
            onClick={() => setActiveFilter('atrasados')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeFilter === 'atrasados'
              ? 'bg-[#8B1538] text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Atrasados
          </button>
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeFilter === 'todos'
              ? 'bg-[#8B1538] text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-3 custom-scrollbar">
        {filteredPayments.map((payment) => {
          const { paid, total } = getPaidCount(payment.roomies);
          const isSwipped = swipedPaymentId === payment.id;
          const offset = isSwipped ? swipeOffset : 0;

          return (
            <div key={payment.id} className="relative overflow-hidden rounded-xl">
              {/* Delete Background - Red with Trash Icon */}
              <div className="absolute inset-0 bg-red-600 flex items-center justify-end pr-6 rounded-xl">
                <button
                  onClick={() => handleDeleteClick(payment.id)}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  <Trash2 className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Swipeable Content */}
              <div
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative"
                style={{
                  transform: `translateX(${offset}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
                onTouchStart={(e) => handleTouchStart(payment.id, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                      {userType === 'propietario' && (
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-[#8B1538]" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[#8B1538] mt-0.5">{payment.category}</p>
                    <p className="text-xs text-gray-500 mt-1">Fecha Límite: {payment.dueDate}</p>
                    {payment.totalAmount ? (
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {userType === 'propietario'
                          ? `$${payment.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${payment.frequency ? `/ ${payment.frequency}` : ''}`
                          : (() => {
                            const myRoomie = payment.roomies.find(r => r.name === userName);
                            return myRoomie ? `${getRoomieAmount(payment, myRoomie)} ${payment.frequency ? `/ ${payment.frequency}` : ''}` : '';
                          })()
                        }
                      </p>
                    ) : null}
                  </div>

                  {/* Progress Circle */}
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="relative w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke={paid === total ? '#22c55e' : '#8B1538'}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(paid / total) * 125.6} 125.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-semibold">
                      {paid}/{total}
                    </span>
                  </button>
                </div>

                {/* Roomies Status */}
                <div className="grid grid-cols-2 gap-2">
                  {payment.roomies.map((roomie, index) => {
                    const isCurrentUser = roomie.name === userName;
                    const canPay = roomie.status === 'unpaid' && isCurrentUser;

                    return (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoomieClick(roomie, payment);
                        }}
                        className={`text-sm px-3 py-1.5 rounded-md ${roomie.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : canPay
                            ? 'bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200'
                            : 'bg-gray-100 text-gray-600'
                          } transition-colors`}
                      >
                        {roomie.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[340px] max-h-[500px] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-gray-900">{selectedPayment.name}</h2>
                <p className="text-sm text-[#8B1538]">{selectedPayment.category}</p>
                {selectedPayment.totalAmount && (
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${Number(selectedPayment.totalAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-gray-400 ml-1">MXN total</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 max-h-[380px] overflow-y-auto">
              <div className="space-y-3">
                {selectedPayment.roomies.map((roomie, index) => {
                  const isCurrentUser = roomie.name === userName;
                  const canPay = roomie.status === 'unpaid' && isCurrentUser;

                  return (
                    <div
                      key={index}
                      onClick={() => handleRoomieClick(roomie, selectedPayment)}
                      className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 ${canPay ? 'cursor-pointer hover:bg-gray-50' : ''
                        } rounded-lg px-2 -mx-2 transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${roomie.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {roomie.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{roomie.name}</span>
                          {selectedPayment.totalAmount ? (
                            <span className="text-xs text-[#8B1538] font-semibold">
                              {getRoomieAmount(selectedPayment, roomie)}
                              {roomie.percentage !== undefined ? ` (${roomie.percentage}%)` : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span
                        className={`text-sm ${roomie.status === 'paid'
                          ? 'text-green-700 font-medium'
                          : 'text-gray-500'
                          }`}
                      >
                        {roomie.status === 'paid' ? roomie.paidDate : 'Pendiente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Create Payment Modal */}
      {isCreatePaymentOpen && userType === 'propietario' && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[340px] max-h-[550px] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setIsCreatePaymentOpen(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-bold text-lg text-gray-900">
                  {isEditMode ? 'Editar Pago' : 'Nuevo Pago'}
                </h2>
              </div>
              <button
                onClick={handleSavePayment}
                className="px-4 py-1.5 bg-[#8B1538] text-white rounded-lg text-sm font-medium hover:bg-[#6b0f2a] transition-colors"
              >
                Guardar
              </button>
            </div>

            {/* Modal Content - Formulario */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Escribe el nombre del pago"
                    className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-[#8B1538] outline-none text-sm transition-colors"
                  />
                </div>

                {/* Responsables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsables: <span className="text-xs text-gray-500">(los registrados en la propiedad)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {registeredPeople.map(person => (
                      <button
                        key={person.id}
                        onClick={() => toggleResponsible(person.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm transition-colors ${selectedResponsibles.includes(person.id)
                          ? 'bg-[#8B1538] border-[#8B1538] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#8B1538]'
                          }`}
                      >
                        {/* Avatar */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${selectedResponsibles.includes(person.id)
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                          }`}>
                          {person.name.charAt(0)}
                        </div>
                        <span>{person.name}</span>
                        {selectedResponsibles.includes(person.id) && (
                          <Plus className="w-3 h-3 rotate-45" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría:
                  </label>
                  {!showAddCategory ? (
                    <div className="flex gap-2">
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className="w-9 h-9 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nueva categoría"
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                      />
                      <button
                        onClick={addCustomCategory}
                        className="px-3 py-2 bg-[#8B1538] text-white rounded-lg text-sm hover:bg-[#6b0f2a] transition-colors"
                      >
                        Agregar
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                        className="w-9 h-9 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    selectedDate={formStartDate}
                    onDateSelect={(date) => setFormStartDate(date)}
                    label="Fecha Inicio:"
                    minDate={(() => {
                      const oneMonthAgo = new Date();
                      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                      return oneMonthAgo;
                    })()}
                  />
                  <DatePicker
                    selectedDate={formEndDate}
                    onDateSelect={(date) => setFormEndDate(date)}
                    label="Fecha Fin:"
                    minDate={(() => {
                      const oneMonthAgo = new Date();
                      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                      return oneMonthAgo;
                    })()}
                  />
                </div>

                {/* Monto del Pago con Icono 💵 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Total a Cobrar:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💵</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors font-medium"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 italic">
                    {paymentAmount && formFrequency
                      ? `Cobro total de $${paymentAmount} ${formFrequency.toLowerCase()}`
                      : "Define el monto total que se dividirá entre los responsables."}
                  </p>
                </div>

                {/* Frecuencia */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia:</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors"
                  >
                    <option value="">Seleccionar frecuencia</option>
                    {frequencies.map(frequency => (
                      <option key={frequency} value={frequency}>{frequency}</option>
                    ))}
                  </select>
                </div>

              
                {/* Método de Pago */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago (Propietario):</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="**** 1234"
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#8B1538] outline-none text-sm transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tarjeta donde recibirás los pagos</p>
                </div>

                {/* Distribución de Pago - Sección completa */}
                {selectedResponsibles.length > 0 && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distribución de Pago:</label>

                    {/* Checkbox Todos por igual */}
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={equalDistribution}
                        onChange={(e) => handleEqualDistributionChange(e.target.checked)}
                        className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                      />
                      <span className="text-sm text-gray-700">Todos por igual</span>
                    </label>

                    {/* Distribución Pago con porcentajes individuales */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Distribución Pago</label>
                        <span className={`text-lg font-semibold ${isPercentageValid() ? 'text-green-600' : 'text-[#8B1538]'
                          }`}>
                          {calculateTotalPercentage()}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedResponsibles.map(responsibleId => {
                          const person = registeredPeople.find(p => p.id === responsibleId);
                          return (
                            <div key={responsibleId} className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-2">
                              {/* Avatar Circle */}
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                                {person?.name.charAt(0)}
                              </div>

                              {/* Name */}
                              <span className="flex-1 text-sm text-gray-700">{person?.name}</span>

                              {/* Percentage Input */}
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={distributions[responsibleId] || ''}
                                  onChange={(e) => setDistributions(prev => ({
                                    ...prev,
                                    [responsibleId]: parseFloat(e.target.value) || 0
                                  }))}
                                  placeholder="0"
                                  className="w-16 px-2 py-1 text-right border-none outline-none text-sm font-medium"
                                />
                                <span className="text-sm font-medium text-gray-700">%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!isPercentageValid() && calculateTotalPercentage() > 0 && (
                        <p className="text-xs text-red-600 mt-2">
                          ⚠️ La suma debe ser 100%
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Eliminar Pago */}
                <div className="border-t pt-4 pb-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Eliminar Pago</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div >
      )
      }

      {/* Edit Confirmation Modal */}
      {
        showEditConfirmation && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl w-[320px] p-6 shadow-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">¿Cómo quieres editar este pago?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Este es un pago recurrente. Elige si quieres modificar solo esta vez o todas las futuras.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmEditPayment('once')}
                  className="w-full px-4 py-3 border-2 border-[#8B1538] text-[#8B1538] rounded-lg font-medium hover:bg-[#8B1538] hover:text-white transition-colors"
                >
                  Solo esta vez
                </button>
                <button
                  onClick={() => confirmEditPayment('all')}
                  className="w-full px-4 py-3 bg-[#8B1538] text-white rounded-lg font-medium hover:bg-[#6b0f2a] transition-colors"
                >
                  Esta y futuras
                </button>
                <button
                  onClick={() => setShowEditConfirmation(false)}
                  className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        showDeleteConfirmation && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl w-[320px] p-6 shadow-xl">
              {isEditMode && formFrequency !== 'Único' && formFrequency !== '' ? (
                // Modal para pagos recurrentes
                <>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">¿Cómo quieres eliminar este pago?</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Este es un pago recurrente. Elige si quieres eliminar solo esta ocurrencia o todas.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => confirmDeleteFromForm('once')}
                      className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Solo esta vez
                    </button>
                    <button
                      onClick={() => confirmDeleteFromForm('all')}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                // Modal para pagos únicos o sin frecuencia
                <>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">¿Estás seguro?</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {isEditMode
                      ? 'Este pago será eliminado permanentemente. Esta acción no se puede deshacer.'
                      : 'El pago no se ha guardado. Si eliminas, se perderán todos los datos ingresados.'
                    }
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeletePayment}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      {isEditMode ? 'Eliminar' : 'Aceptar'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      {/* Delete from List Confirmation Modal */}
      {
        showDeleteListConfirmation && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl w-[320px] p-6 shadow-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">¿Cómo quieres eliminar este pago?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Este es un pago recurrente. Elige si quieres eliminar solo esta ocurrencia o todas.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmDeletePayment('once')}
                  className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors"
                >
                  Solo esta vez
                </button>
                <button
                  onClick={() => confirmDeletePayment('all')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Todas
                </button>
                <button
                  onClick={() => {
                    setShowDeleteListConfirmation(false);
                    setDeletingPaymentId(null);
                    // NO cerrar el swipe, mantenerlo abierto
                  }}
                  className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Payment Modal - Confirmación simple */}
      {
        showPaymentModal && selectedRoomie && selectedPayment && !showCheckoutModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl w-[320px] p-6 shadow-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Realizar Pago</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmar pago para <span className="font-semibold text-gray-900">{selectedRoomie.name}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Pago:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPayment.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Categoría:</span>
                  <span className="text-sm font-medium text-[#8B1538]">{selectedPayment.category}</span>
                </div>
                {selectedPayment.totalAmount ? (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tu parte:</span>
                    <span className="text-sm font-bold text-[#8B1538]">
                      {getRoomieAmount(selectedPayment, selectedRoomie)}
                      {selectedRoomie.percentage !== undefined ? ` (${selectedRoomie.percentage}%)` : ''}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fecha límite:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPayment.dueDate}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedRoomie(null); }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="flex-1 px-4 py-2 bg-[#8B1538] text-white rounded-lg font-medium hover:bg-[#6b0f2a] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Checkout Modal - Pago Único / Programado */}
      {
        showCheckoutModal && selectedRoomie && selectedPayment && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
            <div className="bg-white rounded-2xl w-[340px] max-h-[90vh] overflow-hidden flex flex-col shadow-xl">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{selectedPayment.name}</h2>
                  <p className="text-sm text-[#8B1538]">{selectedPayment.category}</p>
                  {selectedPayment.totalAmount ? (
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {getRoomieAmount(selectedPayment, selectedRoomie)}
                    </p>
                  ) : null}
                </div>
                <button onClick={closeCheckout} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {showPaymentSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">¡Pago Completado!</h3>
                  <p className="text-sm text-gray-500 mb-1">{selectedPayment.name}</p>
                  <p className="text-xs text-gray-400 mb-6">
                    {paymentTab === 'programado' ? 'Pago programado exitosamente' : 'Pago único realizado'}
                  </p>
                  <button
                    onClick={closeCheckout}
                    className="px-8 py-2.5 bg-[#8B1538] text-white rounded-lg font-medium hover:bg-[#6b0f2a] transition-colors"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setPaymentTab('unico')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentTab === 'unico'
                        ? 'text-[#8B1538] border-b-2 border-[#8B1538]'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Pago Único
                    </button>
                    <button
                      onClick={() => setPaymentTab('programado')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentTab === 'programado'
                        ? 'text-[#8B1538] border-b-2 border-[#8B1538]'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Pago Programado
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {paymentTab === 'unico' ? (
                      <>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500">Fecha del pago: </span>
                          <span className="font-medium text-gray-900">{selectedPayment.dueDate}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Número de tarjeta</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                            }}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre en tarjeta</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="JUAN PÉREZ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setCardExpiry(v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v);
                              }}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                            <input
                              type="password"
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center">Checkout de confirmación</p>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#8B1538]" />
                          <span className="text-gray-500">Inicio: </span>
                          <span className="font-medium text-gray-900">{selectedPayment.dueDate}</span>
                        </div>
                        {selectedPayment.totalAmount && selectedRoomie && (
                          <div className="bg-[#8B1538]/5 border border-[#8B1538]/20 rounded-lg p-3 text-sm flex justify-between items-center">
                            <span className="text-gray-600">Tu parte:</span>
                            <span className="font-bold text-[#8B1538] text-base">
                              {getRoomieAmount(selectedPayment, selectedRoomie)}
                            </span>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Frecuencia</label>
                          <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#8B1538] inline-block"></span>
                            Bimestral
                            <span className="text-xs text-gray-400">(del pago)</span>
                          </div>
                        </div>
                        <DatePicker
                          selectedDate={scheduledEndDate}
                          onDateSelect={(date) => setScheduledEndDate(date)}
                          label="Hasta cuándo pagar"
                          minDate={new Date()}
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Número de tarjeta</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                            }}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setCardExpiry(v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v);
                              }}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                            <input
                              type="password"
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8B1538] outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center">Checkout de confirmación</p>
                      </>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100">
                    <button
                      onClick={confirmPayment}
                      disabled={!cardNumber || !cardExpiry || !cardCVV || (paymentTab === 'programado' && !scheduledEndDate)}
                      className="w-full py-3 bg-[#8B1538] text-white rounded-xl font-semibold hover:bg-[#6b0f2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Completar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      {/* Floating Add Button - Only for Propietario */}
      {
        userType === 'propietario' && (
          <button
            onClick={() => {
              resetForm();
              setIsCreatePaymentOpen(true);
            }}
            className="absolute bottom-24 right-6 w-14 h-14 bg-[#8B1538] rounded-full flex items-center justify-center shadow-lg hover:bg-[#6b0f2a] transition-colors z-40"
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={3} />
          </button>
        )
      }

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div >
  );
}