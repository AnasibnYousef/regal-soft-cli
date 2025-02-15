import { type LucideIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

export default function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col gap-2 p-2">
      {items.map((item) => (
        <SidebarMenuButton
          key={item.title}
          onClick={() => navigate(item.url)}
          tooltip={item.title}
          isActive={
            item.title === "Dashboard"
              ? pathname === "/"
              : pathname.includes(item.url)
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      ))}
    </div>
  );
}
