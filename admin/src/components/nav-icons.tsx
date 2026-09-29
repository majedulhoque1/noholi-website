import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  Gift,
  BadgeDollarSign,
  BarChart3,
  Settings,
  Mail,
} from "lucide-react";

/** Icon for each NAV_ITEMS title, shared by the desktop sidebar and the mobile drawer/tab bar. */
export const NAV_ICON_MAP: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Inventory: BookOpen,
  Lending: ArrowLeftRight,
  Members: Users,
  "Book Donations": Gift,
  Messages: Mail,
  Fines: BadgeDollarSign,
  Reports: BarChart3,
  Settings: Settings,
};
