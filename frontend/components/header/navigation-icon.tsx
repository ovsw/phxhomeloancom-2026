import {
  Award,
  Building2,
  ChevronRight,
  Home,
  KeyRound,
  ListCollapse,
  RefreshCw,
  ShieldCheck,
  ShieldPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  award: Award,
  building2: Building2,
  "building-2": Building2,
  "chevron-right": ChevronRight,
  home: Home,
  key: KeyRound,
  "list-collapse": ListCollapse,
  "refresh-cw": RefreshCw,
  "shield-check": ShieldCheck,
  "shield-plus": ShieldPlus,
  users2: UsersRound,
  "users-2": UsersRound,
};

export function NavigationIcon({ className, name }: { className?: string; name: string }) {
  const Icon = icons[name];
  return Icon ? <Icon aria-hidden="true" className={cn("size-4", className)} /> : null;
}
