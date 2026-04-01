'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Farmereg() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, confirmPassword: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    console.log('Form submitted:', formData)
    alert('Registration successful! (demo)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-400 to-amber-400 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      {/* Floating farm icons */}
      <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce">🌾</div>
      <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-bounce delay-700">🚜</div>
      <div className="absolute top-40 right-40 text-4xl opacity-20 animate-spin-slow">☀️</div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center transform transition-transform duration-500 hover:scale-110">
          <div className="relative">
            <Image
              src="/favicon_io/android-chrome-512x512.png"
              alt="Harvest Host"
              width={120}
              height={120}
              className="rounded-2xl shadow-2xl ring-4 ring-white/50"
              priority
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              🌱
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white drop-shadow-lg">
          Join as a Farmer
        </h2>
        <p className="mt-2 text-center text-lg text-white/90">
          Share your farm with visitors
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 transform transition-all duration-300 hover:shadow-3xl border border-white/20">
          
          {/* Progress indicator */}
          <div className="mb-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="transform transition-all duration-300 hover:translate-x-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="John Doe"
              />
            </div>

            <div className="transform transition-all duration-300 hover:translate-x-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="farmer@example.com"
              />
            </div>

            <div className="transform transition-all duration-300 hover:translate-x-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="+254 700 000000"
              />
            </div>

            <div className="transform transition-all duration-300 hover:translate-x-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <div className="transform transition-all duration-300 hover:translate-x-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already growing with us?</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark underline decoration-2 decoration-primary/30 hover:decoration-primary transition-all">
              Sign in
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">🔒 Secure</span>
            <span className="flex items-center">🌱 500+ Farmers</span>
            <span className="flex items-center">⭐ Trusted</span>
          </div>
        </div>
      </div>
    </div>
  )
}