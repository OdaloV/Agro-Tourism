// src/app/farms/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Phone,
  Mail,
  Users,
  Clock,
  X,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import BookingModal from "@/app/components/BookingModal";
import MessageModal from "@/app/components/MessageModal";

interface Farm {
  id: number;
  farm_name: string;
  farm_location: string;
  farm_description: string;
  farm_size: string;
  year_established: number;
  farm_type: string;
  accommodation: boolean;
  max_guests: number;
  video_link: string;
  average_rating: number;
  profile_photo_url: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  location_address: string;
  farmer_name: string;
  farmer_email: string;
  farmer_phone: string;
  is_favorite: boolean;
  review_count: number;
}

interface Activity {
  id: number;
  name: string;
  category: string;
  price: number;
  is_free: boolean;
  currency: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  farm_response: string;
  responded_at: string;
  visitor_name: string;
}

export default function FarmDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params.id as string;
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false); 
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isVisitor, setIsVisitor] = useState(false);
  
  // Booking form state
  const [bookingDate, setBookingDate] = useState("");
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Check if user is logged in as visitor
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setIsVisitor(userRole === "visitor");
  }, []);

  useEffect(() => {
    fetchFarmDetails();
  }, [farmId]);

  const fetchFarmDetails = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}`);
      const data = await response.json();
      setFarm(data.farm);
      setPhotos(data.photos || []);
      setActivities(data.activities || []);
      setFacilities(data.facilities || []);
      setReviews(data.reviews || []);
      setReviewStats(data.reviewStats);
      setIsFavorite(data.isFavorite);
      setHasBooked(data.hasBooked);
    } catch (error) {
      console.error("Error fetching farm details:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId: parseInt(farmId) })
      });
      
      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleBooking = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowBookingModal(true);
  };

  const shareFarm = () => {
    if (navigator.share) {
      navigator.share({
        title: farm?.farm_name,
        text: `Check out ${farm?.farm_name} on HarvestHost!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleBookingComplete = (booking: any) => {
    console.log("Booking created:", booking);
    alert(`Booking created successfully! Booking reference: ${booking.reference}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Farm not found</h2>
          <Link href="/farms" className="text-emerald-600 hover:underline mt-2 inline-block">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Back Buttons - Show both Back to Dashboard (if visitor) and Back to Discover */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-3">
            {isVisitor && (
              <Link 
                href="/visitor/dashboard" 
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            )}
            <Link 
              href="/farms" 
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Discover
            </Link>
          </div>
        </div>

        {/* Farm Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-6">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-100">
            {photos.length > 0 ? (
              <img
                src={photos[0].photo_url || photos[0].url || farm.profile_photo_url}
                alt={farm.farm_name}
                className="w-full h-full object-cover"
              />
            ) : farm.profile_photo_url ? (
              <img
      src={farm.profile_photo_url}
      alt={farm.farm_name}
      className="w-full h-full object-cover"
    />
  ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🌾</span>
              </div>
            )}
             {photos && photos.length > 1 && (
    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
      {photos.length} photos
    </div>
  )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={toggleFavorite}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={shareFarm}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Rating Badge */}
            {farm.average_rating > 0 && (
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{farm.average_rating.toFixed(1)}</span>
                <span className="text-gray-500">({farm.review_count} reviews)</span>
              </div>
            )}
          </div>
          
          {/* Farm Info */}
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-emerald-900">
                  {farm.farm_name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                  <span>{farm.city || farm.county || farm.farm_location}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {farm.farm_size && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      📏 {farm.farm_size} acres
                    </span>
                  )}
                  {farm.year_established && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      📅 Est. {farm.year_established}
                    </span>
                  )}
                  {farm.accommodation && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      🏡 Accommodation ({farm.max_guests} guests)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium"
                >
                  Contact Farmer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-xl font-semibold text-emerald-900 mb-4">About the Farm</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {farm.farm_description}
              </p>
            </div>

            {/* Activities Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-xl font-semibold text-emerald-900 mb-4">Activities & Experiences</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900">{activity.name}</h3>
                        {activity.category && (
                          <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {activity.category}
                          </span>
                        )}
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {activity.duration_minutes > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.duration_minutes} min
                            </span>
                          )}
                          {activity.max_capacity > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Max {activity.max_capacity} guests
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.is_free ? (
                          <span className="text-lg font-semibold text-green-600">Free</span>
                        ) : (
                          <div>
                            <span className="text-2xl font-bold text-emerald-600">
                              {activity.currency} {activity.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">/person</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleBooking(activity)}
                          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition w-full"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No activities listed yet</p>
                )}
              </div>
            </div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                <h2 className="text-xl font-semibold text-emerald-900 mb-4">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-xl font-semibold text-emerald-900 mb-4">Reviews</h2>
              
              {/* Rating Summary */}
              {reviewStats && reviewStats.total > 0 && (
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-900">{reviewStats.average.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(reviewStats.average)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{reviewStats.total} reviews</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(rating => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating} ★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${(reviewStats.distribution[rating] / reviewStats.total) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">
                          {reviewStats.distribution[rating]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Review List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{review.visitor_name}</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-gray-800 mt-2">{review.title}</h4>
                    )}
                    <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                    
                    {/* Farm Response */}
                    {review.farm_response && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">Farm Response</span>
                        </div>
                        <p className="text-sm text-gray-700">{review.farm_response}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No reviews yet</p>
                )}
                
                {hasBooked && (
                  <Link href={`/visitor/dashboard/reviews?farmId=${farmId}`}>
                    <button className="w-full mt-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium">
                      Write a Review
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Farmer Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h3 className="font-semibold text-emerald-900 mb-4">Farm Host</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {farm.farmer_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{farm.farmer_name}</p>
                  <p className="text-xs text-gray-500">Farmer</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Contact Farmer
              </button>
            </div>
            
            {/* Location Map (placeholder) */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h3 className="font-semibold text-emerald-900 mb-3">Location</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 ml-2">Map view coming soon</span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {farm.location_address || farm.city || farm.county || farm.farm_location}
              </p>
            </div>
            
            {/* Quick Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100">
              <h3 className="font-semibold text-emerald-900 mb-3">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response rate</span>
                  <span className="text-emerald-700 font-medium">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg response time</span>
                  <span className="text-emerald-700 font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="text-emerald-700 font-medium">Flexible</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Languages</span>
                  <span className="text-emerald-700 font-medium">English, Swahili</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
   

{showContactModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
    <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-emerald-900">Contact {farm.farmer_name}</h3>
        <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {farm.farmer_phone && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-5 w-5 text-emerald-600" />
            <a href={`tel:${farm.farmer_phone}`} className="text-gray-900 hover:text-emerald-600">
              {farm.farmer_phone}
            </a>
          </div>
        )}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-5 w-5 text-emerald-600" />
          <a href={`mailto:${farm.farmer_email}`} className="text-gray-900 hover:text-emerald-600">
            {farm.farmer_email}
          </a>
        </div>
        
        {/* Send Message Button - Now opens a message modal */}
       <button
  onClick={() => {
    setShowContactModal(false);
    setShowMessageModal(true);
  }}
  className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
>
  Send Message
</button>
      </div>
    </div>
  </div>
)}

      {/* Booking Modal */}
      {showBookingModal && selectedActivity && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedActivity(null);
            setBookingDate("");
            setParticipants(1);
            setSpecialRequests("");
          }}
          activity={selectedActivity}
          farmId={parseInt(farmId)}
          farmName={farm?.farm_name || ""}
          onBookingComplete={handleBookingComplete}
        />
      )}
            <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        farmId={parseInt(farmId)}
        farmName={farm?.farm_name || ""}
        farmerName={farm?.farmer_name || ""}
        onMessageSent={() => {
          console.log("Message sent successfully");
        }}
      />
    </div>
  );
}
   