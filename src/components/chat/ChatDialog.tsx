import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCompanySettings } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ArrowLeft,
  CheckCircle,
  Settings,
  Paperclip,
  Mic,
  Send,
  StickyNote,
  Calendar,
  CalendarCheck,
  Users,
  RefreshCw,
  X,
  User,
  ChevronLeft,
  Clock,
  Upload,
  FileText,
  DollarSign,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pin,
  Printer,
  Truck,
  Package,
  Wrench,
} from 'lucide-react';
import { SalePrintView } from '@/components/sales/SalePrintView';
import { PinConversationModal } from '@/components/chat/PinConversationModal';
import { ScheduleAppointmentModal } from '@/components/chat/ScheduleAppointmentModal';
import { SellerCalendarView } from '@/components/funil/SellerCalendarView';
import { useLeadSchedules, LeadSchedule } from '@/stores/leads/lead-schedules-store';
import { useUserRole } from '@/hooks/useUserRole';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: string;
  content: string;
  sender: 'client' | 'company';
  timestamp: string;
}

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    phone: string;
  };
}

// Mock messages for demonstration - realistic sales conversation
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Olá! Vi o anúncio de vocês no Google sobre gestão de vendas. Podem me dar mais informações?',
    sender: 'client',
    timestamp: '06/12, 08:45',
  },
  {
    id: '2',
    content: 'Bom dia! Claro, ficamos felizes com seu interesse! Você está buscando uma solução para sua empresa ou é autônomo?',
    sender: 'company',
    timestamp: '06/12, 09:00',
  },
  {
    id: '3',
    content: 'Tenho uma empresa pequena, somos 5 vendedores. Hoje usamos planilhas mas está ficando difícil de controlar',
    sender: 'client',
    timestamp: '06/12, 09:15',
  },
  {
    id: '4',
    content: 'Entendo perfeitamente! Esse é um cenário muito comum. Nossa solução resolve exatamente isso - você terá visão completa do funil, desempenho de cada vendedor e automação de follow-ups.',
    sender: 'company',
    timestamp: '06/12, 09:20',
  },
  {
    id: '5',
    content: 'Quanto custa? E demora muito pra implantar?',
    sender: 'client',
    timestamp: '06/12, 09:25',
  },
  {
    id: '6',
    content: 'Para 5 usuários, o investimento fica em R$ 497/mês. A implantação leva em média 2 semanas, incluindo treinamento da equipe. Podemos agendar uma demonstração para você conhecer a ferramenta?',
    sender: 'company',
    timestamp: '06/12, 09:30',
  },
  {
    id: '7',
    content: 'Parece interessante. Pode ser quinta-feira às 14h?',
    sender: 'client',
    timestamp: '06/12, 09:35',
  },
  {
    id: '8',
    content: 'Perfeito! Agendado para quinta, 14h. Vou enviar o link da reunião por aqui mesmo. Até lá! 🚀',
    sender: 'company',
    timestamp: '06/12, 09:40',
  },
];

// Mock vendedores list
const mockVendedores = [
  { id: '1', name: 'Ademir José', email: 'ademir.jose@empresa.com' },
  { id: '2', name: 'Administrativo TIME', email: 'admin@empresa.com' },
  { id: '3', name: 'Alexsandro', email: 'alexsandro.maciel@empresa.com' },
  { id: '4', name: 'Andrea', email: 'andrea@empresa.com' },
  { id: '5', name: 'Antônio', email: 'antonio.pereira@empresa.com' },
  { id: '6', name: 'Bertoni', email: 'bertoni.marcos@empresa.com' },
  { id: '7', name: 'Carol', email: 'carol.ferreira@empresa.com' },
  { id: '8', name: 'Cleofas', email: 'cleofas@gmail.com' },
  { id: '9', name: 'Damião', email: 'damiao.silva@empresa.com' },
];

const configOptions = [
  {
    id: 'temperature',
    icon: RefreshCw,
    title: 'Temperatura',
    description: 'Alterar status do lead',
  },
  {
    id: 'schedule',
    icon: Calendar,
    title: 'Agendar Retorno',
    description: 'Programar mensagem futura',
  },
  {
    id: 'transfer',
    icon: Users,
    title: 'Transferir Atendimento',
    description: 'Transferir lead para outro vendedor',
  },
  {
    id: 'notes',
    icon: StickyNote,
    title: 'Observações',
    description: 'Adicionar notas sobre o lead',
  },
];

// All status options in funnel order - colors synced with Funil.tsx
const allStatusOptions = [
  { id: 'frio', label: 'Frio', color: '#5B8DEF' },
  { id: 'morno', label: 'Morno', color: '#F5A15D' },
  { id: 'quente', label: 'Quente', color: '#E96A6A' },
  { id: 'qualificado', label: 'Qualificado', color: '#4FC3B5' },
  { 
    id: 'em_atendimento', 
    label: 'Em Atendimento', 
    color: '#9B7CF4', 
    hasSubStatus: true,
    subStatuses: [
      { id: 'carteira', label: 'Carteira' },
      { id: 'marcar_agenda', label: 'Marcar Agenda' },
    ]
  },
  { 
    id: 'em_negociacao', 
    label: 'Em Negociação', 
    color: '#F4C95D',
    hasSubStatus: true,
    subStatuses: [
      { id: 'proposta_enviada', label: 'Proposta Enviada' },
    ]
  },
  { id: 'fechado_ganho', label: 'Fechado – Ganho', color: '#4CAF50' },
  { id: 'fechado_perdido', label: 'Fechado – Perdido', color: '#9E9E9E' },
  { id: 'arquivado', label: 'Arquivado', color: '#607D8B' },
  { id: 'fora_de_perfil', label: 'Fora de Perfil', color: '#795548' },
  { id: 'sem_retorno', label: 'Sem retorno', color: '#455A64' },
];

type ActivePanel = 'main' | 'notes' | 'schedule' | 'transfer' | 'temperature';

// Sale registration interface - Complete data collection
interface SaleClientAddress {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface SaleData {
  // Tipo da venda
  saleType: 'produto' | 'servico';
  
  // Dados do cliente
  clientName: string;
  clientDocument: string;
  clientDocumentType: 'cpf' | 'cnpj';
  clientPhone: string;
  clientEmail: string;
  clientAddress: SaleClientAddress;
  
  // Dados da venda
  productSold: string;
  saleCode: string;
  description: string;
  saleDate: string;
  value: string;
  paymentMethod: 'pix' | 'cartao_vista' | 'cartao_parcelado' | 'boleto' | 'transferencia' | 'dinheiro' | '';
  paymentCondition: 'avista' | 'parcelado' | '';
  installments: string;
  observations: string;
  
  // Status de entrega/serviço
  deliveryMode: 'immediate' | 'scheduled';
  
  // Dados de Entrega/Serviço (quando agendado)
  deliveryDate: string;
  deliveryShift: 'manha' | 'tarde' | 'noite' | 'personalizado' | '';
  deliveryTime: string;
  deliveryContact: string;
}

const initialSaleData: SaleData = {
  saleType: 'produto',
  clientName: '',
  clientDocument: '',
  clientDocumentType: 'cpf',
  clientPhone: '',
  clientEmail: '',
  clientAddress: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  productSold: '',
  saleCode: '',
  description: '',
  saleDate: new Date().toISOString().split('T')[0],
  value: '',
  paymentMethod: '',
  paymentCondition: '',
  installments: '',
  observations: '',
  // Delivery/Service mode and data
  deliveryMode: 'immediate',
  deliveryDate: '',
  deliveryShift: '',
  deliveryTime: '',
  deliveryContact: '',
};

export const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, lead }) => {
  const isMobile = useIsMobile();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showSettings, setShowSettings] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('main');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [observations, setObservations] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  
  // Temperature substatus expansion state
  const [expandedTemperatureStatus, setExpandedTemperatureStatus] = useState<string | null>(null);
  
  // Sale registration modal states
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleData, setSaleData] = useState<SaleData>(initialSaleData);
  const [saleErrors, setSaleErrors] = useState<Partial<Record<keyof SaleData, string>>>({});
  
  // Print view state
  const [showPrintView, setShowPrintView] = useState(false);
  const [savedSaleData, setSavedSaleData] = useState<SaleData | null>(null);
  
  // Pin conversation state
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Schedule appointment modal state - now uses full calendar view
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LeadSchedule | null>(null);
  const [newScheduleData, setNewScheduleData] = useState<{ date: Date; time: string } | null>(null);
  
  // User role for conditional features
  const { role, isSuperAdmin } = useUserRole();
  const canPinConversation = role === 'TENANT_ADMIN' || role === 'TENANT_GERENTE';

  // Status indicators
  const [isConversationRead, setIsConversationRead] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasObservations = observations.trim().length > 0;
  const hasScheduledMessage = scheduleDate.trim().length > 0 && scheduleMessage.trim().length > 0;

  // Sale form validation
  const isSaleFormValid = useMemo(() => {
    const hasClientName = saleData.clientName.trim().length > 0;
    const hasClientDocument = saleData.clientDocument.trim().length > 0;
    const hasClientPhone = saleData.clientPhone.trim().length > 0;
    const hasProduct = saleData.productSold.trim().length > 0;
    const hasValue = saleData.value.trim().length > 0 && parseFloat(saleData.value.replace(/\./g, '').replace(',', '.')) > 0;
    const hasPaymentMethod = saleData.paymentMethod !== '';
    const hasPaymentCondition = saleData.paymentCondition !== '';
    const hasInstallments = saleData.paymentCondition === 'avista' || (saleData.paymentCondition === 'parcelado' && saleData.installments.trim().length > 0 && parseInt(saleData.installments) > 0);
    return hasClientName && hasClientDocument && hasClientPhone && hasProduct && hasValue && hasPaymentMethod && hasPaymentCondition && hasInstallments;
  }, [saleData]);

  // Format currency input
  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setSaleData(prev => ({ ...prev, value: formatted }));
    if (saleErrors.value) setSaleErrors(prev => ({ ...prev, value: '' }));
  };

  // Format document input (CPF or CNPJ)
  const formatDocument = (value: string, type: 'cpf' | 'cnpj'): string => {
    const numbers = value.replace(/\D/g, '');
    if (type === 'cpf') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  // Format phone input
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Format CEP input
  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSaveSale = () => {
    const errors: Partial<Record<keyof SaleData, string>> = {};
    
    if (!saleData.clientName.trim()) {
      errors.clientName = 'Nome do cliente é obrigatório';
    }
    
    if (!saleData.clientDocument.trim()) {
      errors.clientDocument = 'Documento é obrigatório';
    }
    
    if (!saleData.clientPhone.trim()) {
      errors.clientPhone = 'Telefone é obrigatório';
    }
    
    if (!saleData.productSold.trim()) {
      errors.productSold = 'Informe o que foi vendido';
    }
    
    if (!saleData.value.trim() || parseFloat(saleData.value.replace(/\./g, '').replace(',', '.')) <= 0) {
      errors.value = 'Informe um valor válido maior que zero';
    }
    
    if (!saleData.paymentMethod) {
      errors.paymentMethod = 'Selecione a forma de pagamento';
    }
    
    if (!saleData.paymentCondition) {
      errors.paymentCondition = 'Selecione a condição de pagamento';
    }
    
    if (saleData.paymentCondition === 'parcelado' && (!saleData.installments.trim() || parseInt(saleData.installments) <= 0)) {
      errors.installments = 'Informe o número de parcelas';
    }

    if (Object.keys(errors).length > 0) {
      setSaleErrors(errors);
      return;
    }

    // Save sale data (mock - will be integrated with backend later)
    console.log('Sale registered:', {
      leadId: lead.id,
      leadName: lead.name,
      ...saleData,
    });

    // Save for print view
    setSavedSaleData({ ...saleData });

    // Reset form and close modal
    setSaleData(initialSaleData);
    setSaleErrors({});
    setShowSaleModal(false);
    handleBackToMain();

    toast.success('Venda registrada com sucesso! Lead atualizado para Fechado – Ganho');
    
    // Show print option
    setTimeout(() => {
      setShowPrintView(true);
    }, 500);
  };

  const handleCancelSale = () => {
    setSaleData(initialSaleData);
    setSaleErrors({});
    setShowSaleModal(false);
  };
  
  // Handle pin conversation (for managers)
  const handlePinConversation = (sellerId: string, note: string) => {
    console.log('Pin conversation:', { leadId: lead.id, sellerId, note });
    // This would be integrated with backend/n8n
  };

  // Handle status selection - intercept "Fechado – Ganho" and "Marcar Agenda"
  const handleStatusSelect = (statusId: string) => {
    if (statusId === 'fechado_ganho') {
      // Open sale modal instead of changing status directly
      setShowSaleModal(true);
    } else if (statusId === 'marcar_agenda') {
      // Open schedule appointment modal for "Marcar Agenda" substatus
      setShowScheduleModal(true);
    } else {
      // Apply other status changes directly
      toast.success(`Status alterado com sucesso`);
      handleBackToMain();
    }
  };

  // Get company logo from localStorage using the same source as Header
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    const settings = getCompanySettings();
    return settings.logoUrl;
  });
  
  useEffect(() => {
    // Listen for company settings updates
    const handleCompanyUpdate = (e: CustomEvent) => {
      setCompanyLogo(e.detail?.logoUrl || null);
    };
    window.addEventListener('companySettingsUpdated', handleCompanyUpdate as EventListener);
    return () => {
      window.removeEventListener('companySettingsUpdated', handleCompanyUpdate as EventListener);
    };
  }, []);

  // Always start at the most recent message when opening the chat
  useEffect(() => {
    if (!open) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        endOfMessagesRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, messages.length]);

  // Reset panel when settings close
  useEffect(() => {
    if (!showSettings) {
      setActivePanel('main');
    }
  }, [showSettings]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'company',
      timestamp: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'temperature') {
      setActivePanel('temperature');
    } else {
      setActivePanel(optionId as ActivePanel);
    }
  };

  const handleBackToMain = () => {
    setActivePanel('main');
  };

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, show a toast with the file name - in production this would upload the file
      toast.success(`Anexo selecionado: ${file.name}`);
      
      // Add message with attachment indicator
      const newMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Anexo: ${file.name}`,
        sender: 'company',
        timestamp: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [...prev, newMessage]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const sendAudio = () => {
    if (audioBlob) {
      // In production, this would upload the audio file
      const duration = formatRecordingTime(recordingTime);
      toast.success(`Áudio enviado (${duration})`);
      
      // Add message with audio indicator
      const newMessage: Message = {
        id: Date.now().toString(),
        content: `🎤 Áudio (${duration})`,
        sender: 'company',
        timestamp: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [...prev, newMessage]);
      
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Mobile-optimized settings content
  const renderMobileSettingsContent = () => {
    const panelClasses = "p-4 space-y-4";
    const headerClasses = "flex items-center gap-3 mb-4";
    const listItemClasses = "w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left min-h-[52px]";
    const iconContainerClasses = "w-10 h-10 rounded-xl flex items-center justify-center bg-muted shrink-0";
    const iconClasses = "w-5 h-5 text-muted-foreground";

    switch (activePanel) {
      case 'notes':
        return (
          <div className={panelClasses}>
            <div className={headerClasses}>
              <Button variant="ghost" size="icon" onClick={handleBackToMain} className="h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground">Observações</h3>
                <p className="text-xs text-muted-foreground">Adicione notas sobre o lead</p>
              </div>
            </div>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Digite suas observações aqui..."
              className="min-h-[140px] bg-background border-border resize-none text-sm"
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleBackToMain} className="flex-1 h-11">
                Cancelar
              </Button>
              <Button onClick={() => handleBackToMain()} className="flex-1 h-11 bg-foreground text-background">
                Salvar
              </Button>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className={panelClasses}>
            <div className={headerClasses}>
              <Button variant="ghost" size="icon" onClick={handleBackToMain} className="h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground">Agendar Retorno</h3>
                <p className="text-xs text-muted-foreground">Programe uma mensagem futura</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="pl-10 bg-background h-11"
                  />
                </div>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-24 bg-background h-11 text-center"
                />
              </div>
              <Textarea
                value={scheduleMessage}
                onChange={(e) => setScheduleMessage(e.target.value)}
                placeholder="Mensagem a enviar..."
                className="min-h-[80px] bg-background resize-none text-sm"
              />
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Anexar arquivo</span>
                <input type="file" className="hidden" onChange={(e) => setScheduleFile(e.target.files?.[0] || null)} />
              </label>
              {scheduleFile && <p className="text-xs text-muted-foreground text-center">{scheduleFile.name}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleBackToMain} className="flex-1 h-11">
                Cancelar
              </Button>
              <Button onClick={() => handleBackToMain()} className="flex-1 h-11 bg-foreground text-background">
                Agendar
              </Button>
            </div>
          </div>
        );

      case 'transfer':
        return (
          <div className={panelClasses}>
            <div className={headerClasses}>
              <Button variant="ghost" size="icon" onClick={handleBackToMain} className="h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground">Escolher Vendedor</h3>
                <p className="text-xs text-muted-foreground">Transferir lead</p>
              </div>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {mockVendedores.map((vendedor) => (
                  <button
                    key={vendedor.id}
                    className={listItemClasses}
                    onClick={() => handleBackToMain()}
                  >
                    <div className={iconContainerClasses}>
                      <User className={iconClasses} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{vendedor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{vendedor.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'temperature':
        return (
          <div className={panelClasses}>
            <div className={headerClasses}>
              <Button variant="ghost" size="icon" onClick={handleBackToMain} className="h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground">Temperatura</h3>
                <p className="text-xs text-muted-foreground">Alterar status do lead</p>
              </div>
            </div>
            <div className="space-y-2 pb-6">
              {allStatusOptions.map((option) => (
                <div key={option.id}>
                  <button
                    className={listItemClasses}
                    onClick={() => {
                      if (option.hasSubStatus && option.subStatuses) {
                        setExpandedTemperatureStatus(prev => prev === option.id ? null : option.id);
                      } else {
                        handleStatusSelect(option.id);
                      }
                    }}
                  >
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                    </div>
                    {option.hasSubStatus && (
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedTemperatureStatus === option.id && "rotate-90")} />
                    )}
                  </button>
                  {option.hasSubStatus && expandedTemperatureStatus === option.id && option.subStatuses && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-muted pl-3">
                      {option.subStatuses.map((sub) => (
                        <button
                          type="button"
                          key={sub.id}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[44px] cursor-pointer bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusSelect(sub.id);
                          }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                          <span className="text-sm text-foreground">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={panelClasses}>
            <div className="space-y-2">
              {configOptions.map((option) => (
                <button
                  key={option.id}
                  className={listItemClasses}
                  onClick={() => handleOptionClick(option.id)}
                >
                  <div className={iconContainerClasses}>
                    <option.icon className={iconClasses} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{option.title}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderSettingsContent = () => {
    switch (activePanel) {
      case 'notes':
        return (
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Observações do Lead
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adicione notas e observações sobre esta conversa
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToMain}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Editar observações
                </label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Digite suas observações aqui..."
                  className="min-h-[180px] bg-background border-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToMain}
                  className="text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Save observations logic
                    handleBackToMain();
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Agendar Mensagem
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agende uma Mensagem para ser Enviada
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1 h-8"
                >
                  <Clock className="w-4 h-4" />
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToMain}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Data e Hora
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="pl-10 bg-background"
                      placeholder="Enviar na Data e Hora"
                    />
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-background text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Mensagem
                </label>
                <Textarea
                  value={scheduleMessage}
                  onChange={(e) => setScheduleMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[100px] bg-background resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Anexos
                </label>
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Escolher arquivo</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setScheduleFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {scheduleFile ? scheduleFile.name : 'Nenhum arquivo escolhido'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToMain}
                  className="text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Schedule message logic
                    handleBackToMain();
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Agendar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'transfer':
        return (
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Escolher Vendedor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione o vendedor responsável por este lead
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToMain}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="h-[400px] -mx-2">
              <div className="space-y-1 px-2">
                {mockVendedores.map((vendedor) => (
                  <button
                    key={vendedor.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left border border-border/50"
                    onClick={() => {
                      // Select vendedor logic
                      handleBackToMain();
                    }}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {vendedor.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {vendedor.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'temperature':
        return (
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Temperatura do Lead
                </h3>
                <p className="text-sm text-muted-foreground">
                  Alterar status/temperatura do lead
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToMain}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="h-[400px] -mx-2">
              <div className="space-y-1 px-2">
                {allStatusOptions.map((option) => (
                  <div key={option.id}>
                    <button
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      onClick={() => {
                        if (option.hasSubStatus && option.subStatuses) {
                          setExpandedTemperatureStatus(prev => prev === option.id ? null : option.id);
                        } else {
                          handleStatusSelect(option.id);
                        }
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-sm font-medium text-foreground flex-1">
                        {option.label}
                      </span>
                      {option.hasSubStatus && (
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedTemperatureStatus === option.id && "rotate-90")} />
                      )}
                    </button>
                    {option.hasSubStatus && expandedTemperatureStatus === option.id && option.subStatuses && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-muted pl-3">
                        {option.subStatuses.map((sub) => (
                          <button
                            type="button"
                            key={sub.id}
                            className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[40px] cursor-pointer bg-background"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusSelect(sub.id);
                            }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                            <span className="text-sm text-foreground">{sub.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      default:
        return (
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Configurações
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie as opções da conversa
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2">
              {configOptions.map((option) => (
                <button
                  key={option.id}
                  className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                  onClick={() => handleOptionClick(option.id)}
                >
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {option.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openState) => { if (!openState) { setIsFullscreen(false); onClose(); } }}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden flex flex-col transition-all duration-200",
          isFullscreen 
            ? "!fixed !inset-0 !w-screen !max-w-none !h-screen !max-h-none !translate-x-0 !translate-y-0 !left-0 !top-0 !right-0 !bottom-0 !rounded-none !m-0 !pt-[var(--safe-area-top)] !pb-[var(--safe-area-bottom)]" 
            : "max-w-4xl h-[85vh] max-h-[85vh]"
        )}
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>Chat com {lead.name}</DialogTitle>
        </VisuallyHidden>
        <div className="flex h-full min-h-0 flex-1">
          {/* Main Chat Area - Light Theme */}
          <div className="flex-1 flex flex-col bg-[#f0f2f5] min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/30">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                  onClick={onClose}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-base text-foreground">{lead.name}</h2>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                </div>
              </div>
              <TooltipProvider>
                <div className="flex items-center gap-0.5 mr-6">
                  {/* Ícone de observações - Aparece apenas se houver observações */}
                  {hasObservations && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-amber-500 hover:bg-amber-500/10 h-9 w-9"
                          onClick={() => {
                            setShowSettings(true);
                            setActivePanel('notes');
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Observações salvas</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Ícone de agendamento - Aparece apenas se houver mensagem agendada */}
                  {hasScheduledMessage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-success hover:bg-success/10 h-9 w-9"
                          onClick={() => {
                            setShowSettings(true);
                            setActivePanel('schedule');
                          }}
                        >
                          <CalendarCheck className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mensagem agendada</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Ícone de marcar como lida - Verde só quando ativo */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9",
                          isConversationRead 
                            ? "text-success hover:bg-success/10" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={() => {
                          const newState = !isConversationRead;
                          setIsConversationRead(newState);
                          if (newState) {
                            toast.success('Conversa marcada como lida');
                          }
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isConversationRead ? "Conversa lida" : "Marcar como lida"}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Botão Fixar Conversa - apenas para Manager/Admin */}
                  {canPinConversation && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => setShowPinModal(true)}
                        >
                          <Pin className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fixar para vendedor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Botão de configurações */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9",
                      showSettings ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  {/* Botão de tela cheia - apenas desktop */}
                  {!isMobile && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:bg-muted"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFullscreen ? "Restaurar tamanho" : "Tela cheia"}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>

            {/* Messages Area - WhatsApp-like background */}
            <ScrollArea 
              className="flex-1 p-4" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <div className="space-y-3 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2 animate-slide-up",
                      msg.sender === 'client' ? "justify-start" : "justify-end"
                    )}
                  >
                    {/* Client Avatar - Left side */}
                    {msg.sender === 'client' && (
                      <Avatar className="w-8 h-8 shrink-0 shadow-sm">
                        <AvatarFallback className="bg-white text-muted-foreground border border-border/30">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%]",
                      msg.sender === 'client' ? "order-2" : "order-1"
                    )}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          msg.sender === 'client'
                            ? "bg-white text-foreground rounded-bl-md"
                            : "bg-[#25D366] text-white rounded-br-md"
                        )}
                      >
                        {msg.content}
                      </div>
                      <p className={cn(
                        "text-[10px] text-muted-foreground/70 mt-1 px-1",
                        msg.sender === 'client' ? "text-left" : "text-right"
                      )}>
                        {msg.timestamp}
                      </p>
                    </div>

                    {/* Company Avatar - Right side with company logo */}
                    {msg.sender === 'company' && (
                      <Avatar className="w-8 h-8 shrink-0 order-2 shadow-sm border border-border/30">
                        {companyLogo ? (
                          <AvatarImage src={companyLogo} alt="Empresa" className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                          SA
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={endOfMessagesRef} className="h-0" aria-hidden="true" />
              </div>
            </ScrollArea>

            {/* Input Area - Messenger style */}
            <div className="p-3 bg-card border-t border-border/30">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              
              {/* Audio Recording UI */}
              {isRecording || audioBlob ? (
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9"
                        onClick={cancelRecording}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                      <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-destructive/10 rounded-full">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-destructive">
                          Gravando {formatRecordingTime(recordingTime)}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        className="bg-[#25D366] hover:bg-[#20bd5a] shrink-0 rounded-full h-10 w-10 shadow-sm"
                        onClick={stopRecording}
                      >
                        <Send className="w-5 h-5 text-white" />
                      </Button>
                    </>
                  ) : audioBlob ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9"
                        onClick={cancelRecording}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                      <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full">
                        <Mic className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Áudio gravado ({formatRecordingTime(recordingTime)})
                        </span>
                      </div>
                      <Button
                        size="icon"
                        className="bg-[#25D366] hover:bg-[#20bd5a] shrink-0 rounded-full h-10 w-10 shadow-sm"
                        onClick={sendAudio}
                      >
                        <Send className="w-5 h-5 text-white" />
                      </Button>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-muted shrink-0 h-9 w-9"
                    onClick={handleAttachmentClick}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="bg-muted/50 border-border/30 text-foreground placeholder:text-muted-foreground/60 rounded-full h-10 pr-10"
                    />
                  </div>
                  {message.trim() ? (
                    <Button
                      size="icon"
                      className="bg-[#25D366] hover:bg-[#20bd5a] shrink-0 rounded-full h-10 w-10 shadow-sm"
                      onClick={handleSend}
                    >
                      <Send className="w-5 h-5 text-white" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-muted shrink-0 h-9 w-9"
                      onClick={startRecording}
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Settings Sheet - Both Desktop and Mobile */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent 
            side={isMobile ? "bottom" : "right"} 
            className={cn(
              "p-0 bg-background",
              isMobile ? "rounded-t-2xl max-h-[85vh]" : "w-80 sm:w-96"
            )}
          >
            <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/30">
              <SheetTitle className="text-base font-semibold">
                {activePanel === 'main' ? 'Configurações' : 
                 activePanel === 'notes' ? 'Observações' :
                 activePanel === 'schedule' ? 'Agendar Retorno' :
                 activePanel === 'transfer' ? 'Escolher Vendedor' :
                 activePanel === 'temperature' ? 'Temperatura' : 'Configurações'}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: isMobile ? 'calc(85vh - 60px)' : 'calc(100vh - 60px)' }}>
              {isMobile ? renderMobileSettingsContent() : renderSettingsContent()}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </DialogContent>

      {/* Sale Registration Modal - Complete Data Collection */}
      <Dialog open={showSaleModal} onOpenChange={(open) => !open && handleCancelSale()}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-lg font-semibold">Registrar Venda</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Preencha as informações completas para concluir a venda.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 max-h-[calc(90vh-180px)]">
            <div className="space-y-8 py-4">
              {/* === DADOS DO CLIENTE === */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border/30 pb-2">
                  Dados do Cliente
                </h3>
                
                {/* Nome do Cliente */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome do Cliente <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Nome completo"
                    value={saleData.clientName}
                    onChange={(e) => {
                      setSaleData(prev => ({ ...prev, clientName: e.target.value }));
                      if (saleErrors.clientName) setSaleErrors(prev => ({ ...prev, clientName: '' }));
                    }}
                    className={cn("h-11 text-[16px]", saleErrors.clientName && "border-destructive")}
                  />
                  {saleErrors.clientName && (
                    <span className="text-xs text-destructive mt-1">{saleErrors.clientName}</span>
                  )}
                </div>

                {/* Documento (CPF/CNPJ) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </Label>
                    <Select
                      value={saleData.clientDocumentType}
                      onValueChange={(value: 'cpf' | 'cnpj') => {
                        setSaleData(prev => ({ ...prev, clientDocumentType: value, clientDocument: '' }));
                      }}
                    >
                      <SelectTrigger className="h-11 text-[16px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Documento <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder={saleData.clientDocumentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      value={saleData.clientDocument}
                      onChange={(e) => {
                        const formatted = formatDocument(e.target.value, saleData.clientDocumentType);
                        setSaleData(prev => ({ ...prev, clientDocument: formatted }));
                        if (saleErrors.clientDocument) setSaleErrors(prev => ({ ...prev, clientDocument: '' }));
                      }}
                      className={cn("h-11 text-[16px]", saleErrors.clientDocument && "border-destructive")}
                    />
                    {saleErrors.clientDocument && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.clientDocument}</span>
                    )}
                  </div>
                </div>

                {/* Telefone e E-mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Telefone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={saleData.clientPhone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setSaleData(prev => ({ ...prev, clientPhone: formatted }));
                        if (saleErrors.clientPhone) setSaleErrors(prev => ({ ...prev, clientPhone: '' }));
                      }}
                      className={cn("h-11 text-[16px]", saleErrors.clientPhone && "border-destructive")}
                    />
                    {saleErrors.clientPhone && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.clientPhone}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      E-mail
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={saleData.clientEmail}
                      onChange={(e) => setSaleData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      className="h-11 text-[16px]"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Endereço
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <Input
                        placeholder="Rua / Avenida"
                        value={saleData.clientAddress.street}
                        onChange={(e) => setSaleData(prev => ({ 
                          ...prev, 
                          clientAddress: { ...prev.clientAddress, street: e.target.value } 
                        }))}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Nº"
                        value={saleData.clientAddress.number}
                        onChange={(e) => setSaleData(prev => ({ 
                          ...prev, 
                          clientAddress: { ...prev.clientAddress, number: e.target.value } 
                        }))}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Complemento"
                      value={saleData.clientAddress.complement}
                      onChange={(e) => setSaleData(prev => ({ 
                        ...prev, 
                        clientAddress: { ...prev.clientAddress, complement: e.target.value } 
                      }))}
                      className="h-10 text-sm"
                    />
                    <Input
                      placeholder="Bairro"
                      value={saleData.clientAddress.neighborhood}
                      onChange={(e) => setSaleData(prev => ({ 
                        ...prev, 
                        clientAddress: { ...prev.clientAddress, neighborhood: e.target.value } 
                      }))}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <Input
                        placeholder="Cidade"
                        value={saleData.clientAddress.city}
                        onChange={(e) => setSaleData(prev => ({ 
                          ...prev, 
                          clientAddress: { ...prev.clientAddress, city: e.target.value } 
                        }))}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="UF"
                        maxLength={2}
                        value={saleData.clientAddress.state}
                        onChange={(e) => setSaleData(prev => ({ 
                          ...prev, 
                          clientAddress: { ...prev.clientAddress, state: e.target.value.toUpperCase() } 
                        }))}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="CEP"
                        value={saleData.clientAddress.zipCode}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value);
                          setSaleData(prev => ({ 
                            ...prev, 
                            clientAddress: { ...prev.clientAddress, zipCode: formatted } 
                          }));
                        }}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === DADOS DA VENDA === */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border/30 pb-2">
                  Dados da Venda
                </h3>

                {/* Tipo de Venda */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo de Venda <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSaleData(prev => ({ ...prev, saleType: 'produto' }))}
                      className={cn(
                        "flex-1 h-11 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                        saleData.saleType === 'produto'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Package className="w-4 h-4" />
                      Produto
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaleData(prev => ({ ...prev, saleType: 'servico' }))}
                      className={cn(
                        "flex-1 h-11 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                        saleData.saleType === 'servico'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Wrench className="w-4 h-4" />
                      Serviço
                    </button>
                  </div>
                </div>

                {/* O que foi vendido + Código */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {saleData.saleType === 'produto' ? 'Produto vendido' : 'Serviço vendido'} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder={saleData.saleType === 'produto' ? "Ex: Sofá, Mesa, Eletrodoméstico" : "Ex: Instalação, Consultoria, Manutenção"}
                      value={saleData.productSold}
                      onChange={(e) => {
                        setSaleData(prev => ({ ...prev, productSold: e.target.value }));
                        if (saleErrors.productSold) setSaleErrors(prev => ({ ...prev, productSold: '' }));
                      }}
                      className={cn("h-11 text-[16px]", saleErrors.productSold && "border-destructive")}
                    />
                    {saleErrors.productSold && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.productSold}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Código / ID
                    </Label>
                    <Input
                      placeholder="Ex: AP-302"
                      value={saleData.saleCode}
                      onChange={(e) => setSaleData(prev => ({ ...prev, saleCode: e.target.value }))}
                      className="h-11 text-[16px]"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descrição da venda
                  </Label>
                  <Textarea
                    placeholder="Ex: Venda realizada após visita e negociação"
                    value={saleData.description}
                    onChange={(e) => setSaleData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>

                {/* Data e Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Data da venda
                    </Label>
                    <Input
                      type="date"
                      value={saleData.saleDate}
                      onChange={(e) => setSaleData(prev => ({ ...prev, saleDate: e.target.value }))}
                      className="h-11 text-[16px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Valor da venda <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="15.000,00"
                        value={saleData.value}
                        onChange={handleValueChange}
                        className={cn("h-11 text-[16px] pl-9", saleErrors.value && "border-destructive")}
                      />
                    </div>
                    {saleErrors.value && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.value}</span>
                    )}
                  </div>
                </div>

                {/* Forma de Pagamento + Condição */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Forma de pagamento <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={saleData.paymentMethod}
                      onValueChange={(value: typeof saleData.paymentMethod) => {
                        setSaleData(prev => ({ ...prev, paymentMethod: value }));
                        if (saleErrors.paymentMethod) setSaleErrors(prev => ({ ...prev, paymentMethod: '' }));
                      }}
                    >
                      <SelectTrigger className={cn("h-11 text-[16px]", saleErrors.paymentMethod && "border-destructive")}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao_vista">Cartão à Vista</SelectItem>
                        <SelectItem value="cartao_parcelado">Cartão Parcelado</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                    {saleErrors.paymentMethod && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.paymentMethod}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Condição <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={saleData.paymentCondition}
                      onValueChange={(value: typeof saleData.paymentCondition) => {
                        setSaleData(prev => ({ ...prev, paymentCondition: value, installments: '' }));
                        if (saleErrors.paymentCondition) setSaleErrors(prev => ({ ...prev, paymentCondition: '' }));
                      }}
                    >
                      <SelectTrigger className={cn("h-11 text-[16px]", saleErrors.paymentCondition && "border-destructive")}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avista">À Vista</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                    {saleErrors.paymentCondition && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.paymentCondition}</span>
                    )}
                  </div>
                </div>

                {/* Número de Parcelas - Only shows if parcelado */}
                {saleData.paymentCondition === 'parcelado' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Número de parcelas <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="2"
                      max="60"
                      placeholder="Ex: 12"
                      value={saleData.installments}
                      onChange={(e) => {
                        setSaleData(prev => ({ ...prev, installments: e.target.value }));
                        if (saleErrors.installments) setSaleErrors(prev => ({ ...prev, installments: '' }));
                      }}
                      className={cn("h-11 text-[16px] w-40", saleErrors.installments && "border-destructive")}
                    />
                    {saleErrors.installments && (
                      <span className="text-xs text-destructive mt-1">{saleErrors.installments}</span>
                    )}
                  </div>
                )}

                {/* Observações */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Observações adicionais
                  </Label>
                  <Textarea
                    placeholder="Informações adicionais sobre a venda..."
                    value={saleData.observations}
                    onChange={(e) => setSaleData(prev => ({ ...prev, observations: e.target.value }))}
                    className="min-h-[70px] text-sm resize-none"
                  />
                </div>
              </div>

              {/* === DADOS DE ENTREGA/SERVIÇO === */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border/30 pb-2 flex items-center gap-2">
                  {saleData.saleType === 'produto' ? (
                    <>
                      <Truck className="w-4 h-4" />
                      Entrega do Produto
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      Execução do Serviço
                    </>
                  )}
                </h3>

                {/* Modo de entrega/execução */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {saleData.saleType === 'produto' ? 'A entrega será:' : 'O serviço será:'}
                  </Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSaleData(prev => ({ ...prev, deliveryMode: 'immediate', deliveryDate: '', deliveryShift: '', deliveryTime: '', deliveryContact: '' }))}
                      className={cn(
                        "flex-1 h-11 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                        saleData.deliveryMode === 'immediate'
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-background text-muted-foreground hover:border-success/50"
                      )}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {saleData.saleType === 'produto' ? 'Entrega Imediata' : 'Já Executado'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaleData(prev => ({ ...prev, deliveryMode: 'scheduled' }))}
                      className={cn(
                        "flex-1 h-11 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                        saleData.deliveryMode === 'scheduled'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Calendar className="w-4 h-4" />
                      {saleData.saleType === 'produto' ? 'Agendar Entrega' : 'Agendar Execução'}
                    </button>
                  </div>
                </div>

                {/* Campos de agendamento - só aparecem se scheduled */}
                {saleData.deliveryMode === 'scheduled' && (
                  <>
                    {/* Data e Turno */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data {saleData.saleType === 'produto' ? 'da entrega' : 'do serviço'} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={saleData.deliveryDate}
                          onChange={(e) => setSaleData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                          className="h-11 text-[16px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Turno
                        </Label>
                        <Select
                          value={saleData.deliveryShift}
                          onValueChange={(value: typeof saleData.deliveryShift) => {
                            setSaleData(prev => ({ ...prev, deliveryShift: value }));
                          }}
                        >
                          <SelectTrigger className="h-11 text-[16px]">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manha">Manhã</SelectItem>
                            <SelectItem value="tarde">Tarde</SelectItem>
                            <SelectItem value="noite">Noite</SelectItem>
                            <SelectItem value="personalizado">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Horário e Contato */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Horário
                        </Label>
                        <Input
                          type="time"
                          value={saleData.deliveryTime}
                          onChange={(e) => setSaleData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                          className="h-11 text-[16px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Contato {saleData.saleType === 'produto' ? 'na entrega' : 'no local'}
                        </Label>
                        <Input
                          placeholder="Nome do contato"
                          value={saleData.deliveryContact}
                          onChange={(e) => setSaleData(prev => ({ ...prev, deliveryContact: e.target.value }))}
                          className="h-11 text-[16px]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 px-6 py-4 border-t border-border/30">
            <Button
              variant="ghost"
              onClick={handleCancelSale}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSale}
              disabled={!isSaleFormValid}
              className="bg-primary hover:bg-primary/90"
            >
              Salvar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print View Modal */}
      {savedSaleData && (
        <SalePrintView
          open={showPrintView}
          onClose={() => setShowPrintView(false)}
          saleData={{
            leadName: lead.name,
            leadPhone: lead.phone,
            leadOrigin: 'Digital',
            clientName: savedSaleData.clientName,
            clientDocument: savedSaleData.clientDocument,
            clientPhone: savedSaleData.clientPhone,
            clientEmail: savedSaleData.clientEmail || undefined,
            clientAddress: savedSaleData.clientAddress,
            productSold: savedSaleData.productSold,
            saleCode: savedSaleData.saleCode || undefined,
            saleDate: savedSaleData.saleDate,
            value: savedSaleData.value,
            paymentMethod: savedSaleData.paymentMethod,
            paymentCondition: savedSaleData.paymentCondition,
            installments: savedSaleData.installments || undefined,
            observations: savedSaleData.observations || undefined,
            deliveryDate: savedSaleData.deliveryDate || undefined,
            deliveryShift: savedSaleData.deliveryShift || undefined,
            deliveryTime: savedSaleData.deliveryTime || undefined,
            deliveryContact: savedSaleData.deliveryContact || undefined,
            responsibleSeller: 'Vendedor Atual',
          }}
        />
      )}

      {/* Pin Conversation Modal (for Managers) */}
      <PinConversationModal
        open={showPinModal}
        onClose={() => setShowPinModal(false)}
        leadId={lead.id}
        leadName={lead.name}
        sellers={mockVendedores}
        onPin={handlePinConversation}
      />

      {/* Full Calendar View for Scheduling (replaces simple modal) */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="fixed inset-0 !top-0 !left-0 !right-0 !bottom-0 !max-w-none !w-screen !h-screen !max-h-screen !rounded-none !translate-x-0 !translate-y-0 !transform-none flex flex-col p-0 !pb-0 border-0 data-[state=open]:!slide-in-from-bottom-0 data-[state=closed]:!slide-out-to-bottom-0 !pt-[var(--safe-area-top)]">
          <VisuallyHidden>
            <DialogTitle>Agendar para {lead.name}</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowScheduleModal(false)}
                className="h-9 w-9 -ml-2"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex flex-col">
                <span className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-success" />
                  Marcar Agenda
                </span>
                <span className="text-xs text-muted-foreground">
                  Selecionando horário para {lead.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto min-h-0">
            <SellerCalendarView 
              onOpenChat={() => {}}
              onEditSchedule={(schedule) => setEditingSchedule(schedule)}
              onCreateSchedule={(date, time) => {
                setNewScheduleData({ date, time });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal (from calendar) */}
      {editingSchedule && (
        <ScheduleAppointmentModal
          open={!!editingSchedule}
          onClose={() => setEditingSchedule(null)}
          lead={{
            id: editingSchedule.leadId,
            name: editingSchedule.leadName,
            origin: editingSchedule.leadOrigin,
          }}
          existingSchedule={{
            id: editingSchedule.id,
            scheduledAt: editingSchedule.scheduledAt,
            scheduleType: editingSchedule.scheduleType,
            description: editingSchedule.description,
          }}
          onSuccess={() => {
            setEditingSchedule(null);
            handleBackToMain();
          }}
        />
      )}

      {/* Create New Schedule Modal (from calendar slot selection) */}
      {newScheduleData && (
        <ScheduleAppointmentModal
          open={!!newScheduleData}
          onClose={() => setNewScheduleData(null)}
          lead={{
            id: lead.id,
            name: lead.name,
          }}
          defaultDateTime={{
            date: newScheduleData.date,
            time: newScheduleData.time,
          }}
          onSuccess={() => {
            setNewScheduleData(null);
            setShowScheduleModal(false);
            handleBackToMain();
          }}
        />
      )}
    </Dialog>
  );
};

export default ChatDialog;
