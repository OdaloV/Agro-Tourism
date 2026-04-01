// src/app/auth/page.tsx
'use client'

import Link from 'next/link'
import { Shield, User, Sprout } from 'lucide-react'

const roles = [
  {
    id: "admin",
    title: "Administrator",
    description: "Manage platform, verify farmers, and monitor operations",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    href: "/auth/login/admin"
  },
  {
    id: "farmer",
    title: "Farmer",
    description: "List your farm, manage bookings, and connect with visitors",
    icon: Sprout,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "/auth/login/farmer"
  },
  {
    id: "visitor",
    title: "Visitor",
    description: "Discover farms, book experiences, and enjoy agritourism",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/auth/login/visitor"
  }
]

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Harvest Host</h1>
          <p className="mt-2 text-gray-600">Choose your role to continue</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Link
                key={role.id}
                href={role.href}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100"
              >
                <div className={`w-16 h-16 ${role.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-8 w-8 ${role.color}`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h2>
                <p className="text-gray-500 text-sm">{role.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}