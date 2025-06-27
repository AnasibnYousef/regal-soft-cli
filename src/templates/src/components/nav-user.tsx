import { ChevronRight, Grip, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/services/axiosInstance'
import { Link } from 'react-router-dom'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from './ui/button'
import { logout } from '@/hooks/auth-handler'

interface AppList {
  name: string
  url: string
  icon: string
}
const CDN_DOMAIN = 'https://static.regal-soft.in/icons'

export function NavUser() {
  const ACCOUNTS_DOMAIN = import.meta.env.VITE_PUBLIC_ACCOUNTS_DOMAIN
  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get(`user/me`)
      return response.data
    },
  })
  const { data: appList, isLoading: isAppListLoading } = useQuery<AppList[], Error>({
    queryKey: ['application'],
    queryFn: async () => {
      const response = await apiClient.get(`/application/`)
      return response.data
    },
  })

  if (!isLoading && !isAppListLoading) {
    if (appList && appList?.length) {
      const isAccessible = appList.filter(app => app.name === '${moduleName}')
      if (isAccessible.length === 0) {
        logout()
      }
    } else {
      logout()
    }
  }

  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-col gap-4 pt-1 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!data?.first_name}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="pl-1 cursor-pointer ">
                      <Grip />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>Application</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="grid flex-1 text-sm leading-tight text-left">Applications</div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <div className="p-2 overflow-auto max-h-96 min-h-20">
              <div className="grid justify-center grid-cols-3 gap-1 rounded-lg cursor-pointer">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  appList?.map((el, i) => {
                    return (
                      <Link
                        to={`${el.url}?tkn=${localStorage.getItem('refreshToken')}`}
                        target="_blank"
                        key={i}
                        className={`flex flex-col items-center p-2 rounded-lg hover:bg-accent gap-2 ${
                          el.name == 'Purchase' ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="w-16 h-16 rounded-xl">
                          <img
                            width={100}
                            src={`${CDN_DOMAIN}${el?.icon}`}
                            height={100}
                            alt={el?.name}
                          />
                        </div>
                        <div className="text-xs font-bold text-center min-w-23">{el.name}</div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
            <div className="p-2">
              <Separator />
            </div>
            <div
              className="flex items-center px-4 pb-2 text-sm font-bold cursor-pointer hover:underline"
              onClick={async () => {
                window.location.href = `${ACCOUNTS_DOMAIN}/application`
              }}
            >
              Account Settings
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!data?.first_name}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center justify-center p-2 text-xs font-semibold leading-none border rounded-full cursor-pointer border-secondary text-secondary dark:border-secondary-foreground dark:text-secondary-foreground size-8">
                      {!isLoading && data?.first_name ? (
                        `${data?.first_name?.charAt(0).toUpperCase()}${data?.last_name
                          ?.charAt(0)
                          .toUpperCase()}`
                      ) : (
                        <Loader2 className="animate-spin" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>User</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">
                  {data?.employee?.employee_code ||
                    (data?.username && data?.employee?.employee_code) ||
                    data?.username}
                </span>
                <span className="text-xs truncate">
                  {data?.first_name && `${data?.first_name}${data?.last_name}`}
                </span>
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-4 px-4 py-2 pt-3 text-sm text-left">
                <div className="flex items-center justify-center p-1 text-lg font-semibold leading-none border rounded-full cursor-pointer border-primary text-primary size-10">
                  {!isLoading ? (
                    `${data?.first_name?.charAt(0).toUpperCase()}${data?.last_name
                      ?.charAt(0)
                      .toUpperCase()}`
                  ) : (
                    <Loader2 className="animate-spin" />
                  )}
                </div>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">
                    {data?.employee?.employee_code || data?.username}
                  </span>
                  <span className="text-xs truncate">{`${data?.first_name} ${data?.last_name}`}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div
                className="grid gap-4 p-4 pb-6 gap-x-6"
                style={{ gridTemplateColumns: 'auto 1fr' }}
              >
                <div className="flex items-center text-sm font-bold">Designation:</div>
                <div className="flex items-center text-sm text-primary">
                  {data?.designation.designation_name}
                </div>
                <div className="flex items-center text-sm font-bold">Department:</div>
                <div className="flex items-center text-sm text-primary">{data?.department}</div>
                <div className="flex items-center text-sm font-bold">Branch:</div>
                <div className="flex items-center text-sm text-primary">
                  {data && data?.branch.branch_name}
                </div>
              </div>
            </DropdownMenuLabel>
            <Separator />
            <DropdownMenuItem>
              <Button
                onClick={() => {
                  logout()
                }}
                variant={'ghost'}
                className="w-full"
              >
                <div className="flex items-center justify-center w-full gap-2 px-2 py-1">
                  <LogOut size={18} />
                  Logout
                </div>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
