'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Check, ChevronDown, Menu, ArrowRight, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useAppState } from '@/components/app-state'
import { PERSONAS, type Notification } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'
import { UniCoreMark } from './unicore-mark'

function useNavItems() {
  const { persona } = useAppState()
  const items = [
    { href: '/explore', label: 'Explore Labs' },
    { href: '/passport', label: 'My Passport' },
    { href: '/bookings', label: 'Custody & Bookings' },
  ]
  if (persona.id === 'manager') items.push({ href: '/manager', label: 'Facility Ops' })
  if (persona.id === 'admin') items.push({ href: '/admin', label: 'Compliance' })
  return items
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()
  const items = useNavItems()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <MobileNav items={items} pathname={pathname} />
        <Link href="/explore" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <UniCoreMark />
          <span className="text-[15px] font-semibold tracking-tight">UniCore</span>
          <span className="hidden text-[15px] font-normal text-muted-foreground xl:inline">Platform</span>
        </Link>

        <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                isActive(pathname, item.href) && 'bg-accent text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PersonaSwitcher />
          <NotificationDrawer />
          <Avatar className="hidden size-8 sm:flex">
            <AvatarFallback className="text-xs font-semibold">
              <PersonaInitials />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

function PersonaInitials() {
  const { persona } = useAppState()
  return <>{persona.initials}</>
}

function PersonaSwitcher() {
  const { persona, setPersona } = useAppState()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-8 gap-2 rounded-full pr-2 pl-3">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            <span className="hidden text-xs text-muted-foreground sm:inline">Demo persona:</span>
            <span className="text-xs font-semibold">{persona.role}</span>
            <ChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch evaluation persona</DropdownMenuLabel>
          {PERSONAS.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => {
                setPersona(p.id)
                router.push(p.home)
              }}
              className="items-start gap-3 py-2"
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-[11px] font-semibold">{p.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {p.role} · {p.org}
                </span>
              </div>
              {p.id === persona.id && <Check className="mt-1 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">No sign-out needed. Views update instantly.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const toneDot: Record<Notification['tone'], string> = {
  info: 'bg-info',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-destructive',
}

function NotificationDrawer() {
  const { notifications, dismissNotification, clearNotifications } = useAppState()
  const count = notifications.length

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${count} unread)`}>
            <Bell />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                {count}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Actionable alerts across bookings, waitlists and custody.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto">
          {count === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 p-8 text-center">
              <p className="text-sm font-medium">{"You're all caught up"}</p>
              <p className="text-xs text-muted-foreground">New alerts will appear here in real time.</p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {notifications.map((n) => (
                <li key={n.id} className="group flex gap-3 border-b px-4 py-4">
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', toneDot[n.tone])} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {n.action && (
                        <Link
                          href={n.action.href}
                          className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), 'gap-1')}
                        >
                          {n.action.label}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => dismissNotification(n.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {count > 0 && (
          <div className="border-t p-3">
            <Button variant="ghost" className="w-full" onClick={clearNotifications}>
              <X data-icon="inline-start" />
              Clear all
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function MobileNav({ items, pathname }: { items: { href: string; label: string }[]; pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <Menu />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UniCoreMark /> UniCore
          </SheetTitle>
          <SheetDescription className="sr-only">Primary navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground',
                isActive(pathname, item.href) && 'bg-accent text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
