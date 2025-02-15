import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export default function NavHome() {
  const navigate = useNavigate();
  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      onClick={() => navigate("/")}
    >
      <div className="flex items-center justify-center rounded-lg aspect-square size-8 text-sidebar-primary-foreground">
        <img
          src={`https://static.regal-soft.in/icons/${iconName}.png`}
          alt="image"
          className="object-contain"
        />
      </div>
      <div className="flex-1 leading-tight text-left">
        <div>
          <div className="text-lg font-semibold truncate">${moduleName}</div>
          <div className="text-sm font-semibold truncate">Regal Jewellers</div>
        </div>
      </div>
    </SidebarMenuButton>
  );
}
