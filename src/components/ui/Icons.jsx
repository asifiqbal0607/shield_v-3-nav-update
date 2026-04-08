/**
 * Icons.jsx — all icons powered by lucide-react.
 * Every export name is identical to the previous custom SVG version,
 * so no other file needs to change.
 *
 * Install: npm install lucide-react
 */

import {
  X,
  Check,
  Eye,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Info,
  Filter,
  SlidersHorizontal,
  LayoutDashboard,
  Users,
  Settings,
  Network,
  Globe,
  ClipboardList,
  BarChart2,
  Ban,
  MapPin,
  Smartphone,
  Package,
  Activity,
  BookOpen,
  ShieldCheck,
  KeyRound,
  Copy,
  Plus,
  AlertTriangle,
  Mail,
  Lock,
  LogOut,
  Search,
  Send,
  MessageSquare,
  FileText,
  Save,
  ArrowLeft,
  Pencil,
} from "lucide-react";

// ── Wrapper to pass size consistently ────────────────────────────────────────
// Each export accepts { size } and passes it to the Lucide component.
// Lucide icons use `size` natively, so this is a transparent pass-through.

export const CloseIcon        = ({ size = 16 }) => <X             size={size} />;
export const CheckIcon        = ({ size = 16 }) => <Check         size={size} />;
export const EyeIcon          = ({ size = 16 }) => <Eye           size={size} />;
export const EyeOffIcon       = ({ size = 16 }) => <EyeOff        size={size} />;
export const DownloadIcon     = ({ size = 16 }) => <Download      size={size} />;
export const BackArrowIcon    = ({ size = 16 }) => <ChevronLeft   size={size} />;
export const ChevronRightIcon = ({ size = 11 }) => <ChevronRight  size={size} />;
export const ChevronUpIcon    = ({ size = 11 }) => <ChevronUp     size={size} />;
export const ChevronDownIcon  = ({ size = 11 }) => <ChevronDown   size={size} />;
export const InfoIcon         = ({ size = 13 }) => <Info          size={size} />;
export const FilterIcon       = ({ size = 14 }) => <Filter        size={size} />;
export const FiltersIcon      = ({ size = 14 }) => <SlidersHorizontal size={size} />;
export const SearchIcon       = ({ size = 13 }) => <Search        size={size} />;
export const CopyIcon         = ({ size = 11 }) => <Copy          size={size} />;
export const PlusIcon         = ({ size = 16 }) => <Plus          size={size} />;
export const LockIcon         = ({ size = 32 }) => <Lock          size={size} />;
export const LogOutIcon       = ({ size = 16 }) => <LogOut        size={size} />;
export const MailIcon         = ({ size = 40 }) => <Mail          size={size} />;
export const AlertIcon        = ({ size = 16 }) => <AlertTriangle size={size} />;
export const SendIcon         = ({ size = 14 }) => <Send          size={size} />;
export const MessageIcon      = ({ size = 20 }) => <MessageSquare size={size} />;
export const FileTextIcon     = ({ size = 14 }) => <FileText      size={size} />;
export const SaveIcon         = ({ size = 14 }) => <Save          size={size} />;
export const ArrowLeftIcon    = ({ size = 13 }) => <ArrowLeft     size={size} />;
export const EditIcon         = ({ size = 14 }) => <Pencil        size={size} />;

// ── Nav icons ─────────────────────────────────────────────────────────────────
export const DashboardIcon  = ({ size = 16 }) => <LayoutDashboard size={size} />;
export const UsersIcon      = ({ size = 16 }) => <Users           size={size} />;
export const SettingsIcon   = ({ size = 16 }) => <Settings        size={size} />;
export const PartnersIcon   = ({ size = 16 }) => <Network         size={size} />;
export const GlobeIcon      = ({ size = 16 }) => <Globe           size={size} />;
export const ClipboardIcon  = ({ size = 16 }) => <ClipboardList   size={size} />;
export const ReportingIcon  = ({ size = 16 }) => <BarChart2       size={size} />;
export const BlockIcon      = ({ size = 16 }) => <Ban             size={size} />;
export const GeoIcon        = ({ size = 16 }) => <MapPin          size={size} />;
export const DeviceIcon     = ({ size = 16 }) => <Smartphone      size={size} />;
export const PackageIcon    = ({ size = 16 }) => <Package         size={size} />;
export const TrafficIcon    = ({ size = 16 }) => <Activity        size={size} />;
export const DocsIcon       = ({ size = 16 }) => <BookOpen        size={size} />;
export const ShieldIcon     = ({ size = 16 }) => <ShieldCheck     size={size} />;
export const KeyIcon        = ({ size = 16 }) => <KeyRound        size={size} />;