
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft, Search } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type SidebarContext = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | undefined>(undefined)

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)

  React.useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "h-screen flex-col border-r bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      isOpen: {
        true: "w-60",
        false: "w-16",
      },
    },
    defaultVariants: {
      isOpen: true,
    },
  }
)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    const { isOpen, isMobile } = useSidebar()
    const Comp = isMobile ? Sheet : "aside"
    const compProps = isMobile ? { open: isOpen } : { isOpen }
    
    if (isMobile) {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <PanelLeft />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <div className={cn("flex", className)} {...props} ref={ref} />
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        className={cn(sidebarVariants({ isOpen }), className, "hidden md:flex")}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-16 items-center border-b px-4",
          !isOpen && "justify-center",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} {...props} />
  )
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto border-t p-4", className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1 p-2", className)} {...props} />
  )
)
SidebarGroup.displayName = "SidebarGroup"

const itemVariants = cva(
  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
  {
    variants: {
      isActive: {
        true: "bg-primary text-primary-foreground",
        false: "text-muted-foreground hover:bg-muted",
      },
      isOpen: {
        true: "justify-start",
        false: "justify-center",
      },
    },
    defaultVariants: {
      isActive: false,
      isOpen: true,
    },
  }
)

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement>, VariantProps<typeof itemVariants> {
  href: string
  icon?: React.ReactNode
}

const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  ({ className, href, icon, children, ...props }, ref) => {
    const { isOpen } = useSidebar()
    const pathname = usePathname()
    const isActive = pathname === href
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(itemVariants({ isActive, isOpen }), className)}
        {...props}
      >
        {icon && <span className={cn(isOpen && "mr-3")}>{icon}</span>}
        {isOpen && children}
      </Link>
    )
  }
)
SidebarItem.displayName = "SidebarItem"

const SidebarToggle = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { setIsOpen, isOpen, isMobile } = useSidebar()
    
    if (isMobile) return null

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("absolute -right-4 top-1/2 -translate-y-1/2 rounded-full", className)}
        {...props}
      >
        <PanelLeft className={cn("h-5 w-5", isOpen && "rotate-180")} />
      </Button>
    )
  }
)
SidebarToggle.displayName = "SidebarToggle"

const SidebarSearch = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen } = useSidebar()
    return (
        <div ref={ref} className={cn("relative p-2", className)} {...props}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className={cn("pl-8", !isOpen && "w-0 opacity-0")} />
        </div>
    )
  }
)
SidebarSearch.displayName = "SidebarSearch"

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarToggle,
  SidebarSearch,
  useSidebar
}
