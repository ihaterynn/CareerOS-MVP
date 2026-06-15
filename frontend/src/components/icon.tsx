import {
  Compass,
  Briefcase,
  User,
  Users,
  LayoutGrid,
  Sun,
  Moon,
  Sparkles,
  Send,
  Check,
  CircleCheck,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Bell,
  Building2,
  GitBranch,
  MessageSquare,
  Shield,
  Search,
  Heart,
  Star,
  Clock,
  Filter,
  X,
  Plus,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Layers,
  RefreshCw,
  Pencil,
  MapPin,
  TriangleAlert,
  Info,
  type LucideIcon
} from "lucide-react";

/**
 * Typed icon adapter — careeros ui/shell components reference icons by string
 * name (`<Icon name="sun" />`). We keep lucide-react as the single icon source
 * and map those names to lucide components. Names are a closed union so an
 * unknown name is a compile error, not a silent blank.
 */
const ICONS = {
  compass: Compass,
  briefcase: Briefcase,
  user: User,
  users: Users,
  grid: LayoutGrid,
  sun: Sun,
  moon: Moon,
  sparkles: Sparkles,
  send: Send,
  check: Check,
  checkCircle: CircleCheck,
  trend: TrendingUp,
  trendDown: TrendingDown,
  bolt: Zap,
  target: Target,
  bell: Bell,
  building: Building2,
  git: GitBranch,
  message: MessageSquare,
  shield: Shield,
  search: Search,
  heart: Heart,
  star: Star,
  clock: Clock,
  filter: Filter,
  x: X,
  plus: Plus,
  arrowRight: ArrowRight,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  graduation: GraduationCap,
  book: BookOpen,
  layers: Layers,
  refresh: RefreshCw,
  edit: Pencil,
  pin: MapPin,
  alert: TriangleAlert,
  info: Info
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  style,
  className
}: {
  name: IconName;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const Cmp = ICONS[name];
  return <Cmp size={size} style={style} className={className} aria-hidden="true" />;
}
