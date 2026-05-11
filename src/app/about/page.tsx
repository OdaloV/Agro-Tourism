"use client";

import { Leaf, Heart, Users, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About HarvestHost
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Connecting you with authentic farm experiences across Kenya
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-12 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Story
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HarvestHost was born from a simple idea: to bridge the gap between urban dwellers and the rich agricultural heritage of Kenya. We believe that everyone should have the opportunity to experience the beauty of farm life, learn where their food comes from, and support local farmers.
          </p>
          <p className="text-gray-700 leading-relaxed">
            What started as a small community of farms has grown into a trusted platform connecting thousands of visitors with authentic farm experiences – from fruit picking and farm tours to overnight stays and educational workshops.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="h-8 w-8 text-emerald-700" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Our Mission
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To empower local farmers by providing a digital marketplace that showcases their unique offerings, while making farm tourism accessible, educational, and memorable for all Kenyans.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-rose-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Our Vision
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A Kenya where every farm thrives through agritourism, and every visitor builds a lasting connection to the land and people who grow their food.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-12 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Our Core Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="h-10 w-10 text-emerald-700 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Community</h3>
              <p className="text-sm text-gray-600">Building strong relationships between farmers and visitors</p>
            </div>
            <div className="text-center">
              <Leaf className="h-10 w-10 text-emerald-700 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Sustainability</h3>
              <p className="text-sm text-gray-600">Promoting eco‑friendly and regenerative farming practices</p>
            </div>
            <div className="text-center">
              <Heart className="h-10 w-10 text-rose-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Authenticity</h3>
              <p className="text-sm text-gray-600">Real experiences, real farms, real people</p>
            </div>
            <div className="text-center">
              <Award className="h-10 w-10 text-emerald-700 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Trust</h3>
              <p className="text-sm text-gray-600">Secure bookings and verified farms</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-800">50+</div>
            <div className="text-sm text-gray-600">Partner Farms</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-800">10k+</div>
            <div className="text-sm text-gray-600">Happy Visitors</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-800">100+</div>
            <div className="text-sm text-gray-600">Unique Activities</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-800">4.9★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Explore Farms button removed */}
      </div>
    </div>
  );
}
