import Link from 'next/link'
import { Home, Users, Settings, HelpCircle } from 'lucide-react'

export function AdminNav() {
  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex-shrink-0">
              <span className="font-bold text-xl">Admin Dashboard</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground hover:text-primary transition-colors">
                <Home className="inline-block w-5 h-5 mr-1" />
                Home
              </Link>
              <Link href="/getAll" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground hover:text-primary transition-colors">
                <Users className="inline-block w-5 h-5 mr-1" />
                all blogs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}