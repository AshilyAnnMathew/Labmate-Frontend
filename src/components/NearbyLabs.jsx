import React, { useState, useEffect, useRef } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { MapPin, Navigation, Phone, Clock, Star, ExternalLink, Search, X, History } from 'lucide-react'
import Swal from 'sweetalert2'

// Cache-busting timestamp: 2025-01-07T12:00:00Z - Google Maps Error Fix
const GOOGLE_MAPS_API_KEY = 'AIzaSyC3fancRF9cg1Jfy-e9Ae0b4tL2Ym5-3b0'

// Function to clear Google Maps script cache
const clearGoogleMapsCache = () => {
  // Remove existing Google Maps script
  const existingScript = document.getElementById('google-maps-script')
  if (existingScript) {
    existingScript.remove()
  }
  
  // Clear any cached Google Maps objects
  if (window.google) {
    delete window.google
  }
  
  // Clear any cached loader instances
  if (window.__googleMapsScriptId) {
    delete window.__googleMapsScriptId
  }
}

// Error Boundary Component for Google Maps
class GoogleMapsErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Google Maps Error:', error, errorInfo)
  }

  render() {
    // Check if Google Maps is available before even trying to render
    if (!window.google || !window.google.maps) {
      return <FallbackMapComponent labs={this.props.labs || []} onLabSelect={this.props.onLabSelect} />
    }

    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-2 font-semibold">Google Maps Error</p>
            <p className="text-red-500 text-sm mb-4">
              {this.state.error?.message?.includes('different options') 
                ? 'API key conflict detected. Please refresh to load with the new API key.'
                : 'There was an issue loading the map. Please refresh the page to try again.'
              }
            </p>
            <button
              onClick={() => {
                clearGoogleMapsCache()
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                clearGoogleMapsCache()
                // Force parent component to re-render with new map key
                if (this.props.onRetry) {
                  this.props.onRetry()
                }
                this.setState({ hasError: false, error: null })
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Clear Cache & Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Function to search for real labs near user location
const searchNearbyLabs = async (userLocation, radius = 10000) => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.warn('Google Places API not loaded')
    return []
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'))
    
    const request = {
      location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: radius,
      keyword: 'laboratory medical diagnostic testing',
      type: ['hospital', 'health', 'establishment'],
      fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'opening_hours', 'formatted_phone_number', 'types']
    }

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Filter results to include only medical labs, diagnostic centers, and hospitals
        const medicalPlaces = results.filter(place => {
          const types = place.types || []
          return types.some(type => 
            type.includes('hospital') || 
            type.includes('health') || 
            type.includes('medical') ||
            place.name.toLowerCase().includes('lab') ||
            place.name.toLowerCase().includes('diagnostic') ||
            place.name.toLowerCase().includes('medical') ||
            place.name.toLowerCase().includes('clinic') ||
            place.name.toLowerCase().includes('health')
          )
        })

        // Get detailed information for each place
        const detailedPlaces = medicalPlaces.slice(0, 10).map((place, index) => ({
          id: `real-lab-${index}`,
          name: place.name,
          address: place.formatted_address || 'Address not available',
          phone: place.formatted_phone_number || 'Phone not available',
          hours: place.opening_hours ? 
            (place.opening_hours.weekday_text ? place.opening_hours.weekday_text.join(', ') : 'Hours not available') : 
            'Hours not available',
          rating: place.rating || 0,
          userRatingsTotal: place.user_ratings_total || 0,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          distance: calculateDistance(userLocation.lat, userLocation.lng, place.geometry.location.lat(), place.geometry.location.lng()),
          services: getLabServices(place.name, place.types),
          placeId: place.place_id,
          isReal: true
        }))

        // Sort by distance
        detailedPlaces.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
        resolve(detailedPlaces)
      } else {
        console.warn('Places API search failed:', status)
        resolve([])
      }
    })
  })
}

// Function to get lab services based on place name and types
const getLabServices = (name, types) => {
  const services = ['General Health Checkup']
  const nameLower = name.toLowerCase()
  
  if (nameLower.includes('lab') || nameLower.includes('diagnostic')) {
    services.push('Blood Tests', 'Urine Analysis', 'Pathology')
  }
  
  if (nameLower.includes('hospital') || nameLower.includes('medical center')) {
    services.push('Emergency Services', 'Specialized Tests', 'Imaging')
  }
  
  if (nameLower.includes('clinic') || nameLower.includes('health center')) {
    services.push('Basic Tests', 'Vaccinations', 'Health Checkups')
  }
  
  // Add more services based on types
  if (types) {
    if (types.includes('hospital')) {
      services.push('Emergency Care', 'Specialized Tests', 'Surgery')
    }
    if (types.includes('health')) {
      services.push('Preventive Care', 'Health Screening')
    }
  }
  
  return services
}

// Function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return `${distance.toFixed(1)} km`
}

// Fallback sample labs if no real labs are found
const FALLBACK_LABS = [
  {
    id: 'fallback-1',
    name: "Sample Medical Lab",
    address: "Medical Center Area",
    phone: "Contact for details",
    hours: "Mon-Fri: 8:00 AM - 6:00 PM",
    rating: 4.0,
    services: ["Blood Tests", "General Health Checkup"],
    lat: 40.7128,
    lng: -74.0060,
    distance: "N/A",
    isReal: false
  }
]

// Simple fallback map component without Google Maps
const FallbackMapComponent = ({ labs, onLabSelect }) => {
  return (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map Unavailable</h3>
        <p className="text-gray-600 mb-4">
          Google Maps is currently unavailable. You can still view all available labs in the list below.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {labs.length} labs found in your area
          </div>
          <p className="text-xs text-gray-400">
            Click on labs in the list to view details and get directions
          </p>
        </div>
      </div>
    </div>
  )
}

const MapComponent = ({ userLocation, labs, selectedLab, onLabSelect, searchLocation }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const directionsServiceRef = useRef(null)
  const directionsRendererRef = useRef(null)

  // Early return if Google Maps is not available
  if (!window.google || !window.google.maps) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Waiting for Google Maps...</p>
          <p className="text-gray-500 text-sm">Please wait while we load the map</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!mapRef.current || (!userLocation && !searchLocation)) return

    // Double check if Google Maps is loaded (extra safety)
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps API not loaded yet')
      return
    }

    // Determine center location (prefer search location, fallback to user location)
    const centerLocation = searchLocation || userLocation

    try {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLocation.lat, lng: centerLocation.lng },
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })
    } catch (error) {
      console.error('Error initializing Google Map:', error)
      return
    }

    try {
      // Initialize directions service
      directionsServiceRef.current = new window.google.maps.DirectionsService()
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: true
      })
      directionsRendererRef.current.setMap(mapInstanceRef.current)
    } catch (error) {
      console.error('Error initializing directions service:', error)
    }

    // Add user location marker (only if not searching)
    let userMarker = null
    if (userLocation && !searchLocation) {
      try {
        // Create custom icon for user location
        const userIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-family="Arial">📍</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
        
        userMarker = new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map: mapInstanceRef.current,
          title: "Your Location",
          icon: userIcon
        })
      } catch (error) {
        console.error('Error creating user marker:', error)
      }
    }

    // Add search location marker
    let searchMarker = null
    if (searchLocation) {
      try {
        // Create custom icon for search location
        const searchIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-family="Arial">🔍</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
        
        searchMarker = new window.google.maps.Marker({
          position: { lat: searchLocation.lat, lng: searchLocation.lng },
          map: mapInstanceRef.current,
          title: "Search Location",
          icon: searchIcon
        })
      } catch (error) {
        console.error('Error creating search marker:', error)
      }
    }

    // Add lab markers
    labs.forEach(lab => {
      try {
        // Create custom icon for lab markers
        const labIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="35" height="35" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17.5" cy="17.5" r="16" fill="#dc2626" stroke="white" stroke-width="2"/>
              <text x="17.5" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">🏥</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(35, 35),
          anchor: new window.google.maps.Point(17.5, 17.5)
        }
        
        const marker = new window.google.maps.Marker({
          position: { lat: lab.lat, lng: lab.lng },
          map: mapInstanceRef.current,
          title: lab.name,
          icon: labIcon
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #2563eb; font-size: 16px;">${lab.name}</h3>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                <strong>Address:</strong> ${lab.address}
              </p>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                <strong>Phone:</strong> ${lab.phone}
              </p>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                <strong>Rating:</strong> ⭐ ${lab.rating}
              </p>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                <strong>Distance:</strong> ${lab.distance}
              </p>
              <button onclick="selectLab(${lab.id})" style="
                background: #2563eb; 
                color: white; 
                border: none; 
                padding: 8px 12px; 
                border-radius: 4px; 
                cursor: pointer; 
                margin-top: 8px;
                font-size: 12px;
              ">View Details</button>
            </div>
          `
        })

        // Add click listener
        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
          onLabSelect(lab)
        })

        markersRef.current.push({ marker, infoWindow })
      } catch (error) {
        console.error('Error creating lab marker:', error)
      }
    })

    // Add global function for info window button
    window.selectLab = (labId) => {
      const lab = labs.find(l => l.id === labId)
      if (lab) {
        onLabSelect(lab)
      }
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(({ marker }) => {
        marker.setMap(null)
      })
      if (userMarker) userMarker.setMap(null)
      if (searchMarker) searchMarker.setMap(null)
      delete window.selectLab
    }
  }, [userLocation, labs, onLabSelect, searchLocation])

  const showDirections = (lab) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return
    if (!window.google || !window.google.maps) return

    const originLocation = searchLocation || userLocation
    if (!originLocation) return

    try {
      const request = {
        origin: { lat: originLocation.lat, lng: originLocation.lng },
        destination: { lat: lab.lat, lng: lab.lng },
        travelMode: window.google.maps.TravelMode.DRIVING
      }

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result)
          
          // Center map on route
          const bounds = new window.google.maps.LatLngBounds()
          result.routes[0].legs.forEach(leg => {
            bounds.extend(leg.start_location)
            bounds.extend(leg.end_location)
          })
          mapInstanceRef.current.fitBounds(bounds)
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Directions Error',
            text: 'Could not calculate directions to this lab.',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'OK'
          })
        }
      })
    } catch (error) {
      console.error('Error showing directions:', error)
      Swal.fire({
        icon: 'error',
        title: 'Directions Error',
        text: 'Could not calculate directions to this lab.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK'
      })
    }
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />
      
      {selectedLab && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-900 mb-2">{selectedLab.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{selectedLab.address}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => showDirections(selectedLab)}
              className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLab.lat},${selectedLab.lng}`)}
              className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in Maps
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const LabCard = ({ lab, userLocation, onSelect, onGetDirections }) => {
  const handleGetDirections = () => {
    onGetDirections(lab)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
            {lab.isReal && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Real Lab
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{lab.rating > 0 ? lab.rating : 'No rating'}</span>
            {lab.userRatingsTotal > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>({lab.userRatingsTotal} reviews)</span>
              </>
            )}
            <span className="mx-2">•</span>
            <MapPin className="h-4 w-4 mr-1" />
            <span>{lab.distance}</span>
          </div>
        </div>
        <button
          onClick={handleGetDirections}
          className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
        >
          <Navigation className="h-4 w-4 mr-1" />
          Directions
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{lab.address}</span>
        </div>
        {lab.phone !== 'Phone not available' && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <a href={`tel:${lab.phone}`} className="hover:text-primary-600">{lab.phone}</a>
          </div>
        )}
        {lab.hours !== 'Hours not available' && (
          <div className="flex items-start text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{lab.hours}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Services Available:</h4>
        <div className="flex flex-wrap gap-1">
          {lab.services.map((service, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(lab)}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
      >
        View on Map
      </button>
    </div>
  )
}

const NearbyLabs = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [labs, setLabs] = useState([])
  const [selectedLab, setSelectedLab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchLocation, setSearchLocation] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)
  const placesServiceRef = useRef(null)
  
  // Force re-render when API key changes
  const [mapKey, setMapKey] = useState(0)
  
  // Lab search state
  const [searchingLabs, setSearchingLabs] = useState(false)

  useEffect(() => {
    getCurrentLocation()
    loadSearchHistory()
    
    // Clear cache on component mount to handle API key changes
    clearGoogleMapsCache()
    setMapKey(prev => prev + 1)
    
    // Cleanup function to clear cache on unmount
    return () => {
      clearGoogleMapsCache()
    }
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSuggestions])

  // Add global error handler for IntersectionObserver and Google Maps errors
  useEffect(() => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || ''
      
      // Suppress non-critical errors
      if (
        errorMessage.includes('IntersectionObserver') ||
        errorMessage.includes('google.maps.Marker is deprecated') ||
        errorMessage.includes('RefererNotAllowedMapError') ||
        errorMessage.includes('Cannot read properties of undefined') ||
        errorMessage.includes('Map ID') ||
        errorMessage.includes('Advanced Markers') ||
        errorMessage.includes('Loader must not be called again with different options')
      ) {
        return
      }
      
      originalConsoleError.apply(console, args)
    }
    
    console.warn = (...args) => {
      const warningMessage = args[0]?.toString() || ''
      
      // Suppress Google Maps warnings
      if (
        warningMessage.includes('google.maps.Marker is deprecated') ||
        warningMessage.includes('Map ID') ||
        warningMessage.includes('Advanced Markers')
      ) {
        return
      }
      
      originalConsoleWarn.apply(console, args)
    }

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  const loadSearchHistory = () => {
    const history = localStorage.getItem('labSearchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }

  const saveSearchHistory = (query, location) => {
    const newHistory = [
      { query, location, timestamp: new Date().toISOString() },
      ...searchHistory.filter(item => item.query !== query).slice(0, 9)
    ]
    setSearchHistory(newHistory)
    localStorage.setItem('labSearchHistory', JSON.stringify(newHistory))
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length < 3) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      getPlaceSuggestions(value)
    }, 300)
  }

  const getPlaceSuggestions = (query) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps Places API not loaded yet, retrying...')
      // Retry after a short delay
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          getPlaceSuggestions(query)
        }
      }, 1000)
      return
    }

    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )
    }

    const request = {
      query: query,
      fields: ['place_id', 'name', 'formatted_address', 'geometry'],
      types: ['establishment', 'locality', 'administrative_area_level_1']
    }

    placesServiceRef.current.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSearchSuggestions(results.slice(0, 5))
        setShowSuggestions(true)
      } else {
        console.warn('Places API search failed:', status)
        // Show a helpful message to the user
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    })
  }

  const selectSearchSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    
    const location = {
      lat: suggestion.geometry.location.lat(),
      lng: suggestion.geometry.location.lng(),
      address: suggestion.formatted_address
    }
    
    setSearchLocation(location)
    saveSearchHistory(suggestion.name, location)
    
    // Filter labs near the searched location
    filterLabsByLocation(location)
  }

  const filterLabsByLocation = async (location) => {
    // Search for real labs near the search location
    await searchForRealLabs(location)
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchLocation(null)
    setLabs(SAMPLE_LABS)
    setShowSuggestions(false)
    setSearchSuggestions([])
  }

  const useCurrentLocation = () => {
    if (userLocation) {
      setSearchLocation(userLocation)
      setSearchQuery('Current Location')
      filterLabsByLocation(userLocation)
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        setLoading(false)
        
        // Search for real labs near the user's location
        await searchForRealLabs(location)
      },
      (error) => {
        let errorMessage = 'Unable to get your location.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        setError(errorMessage)
        setLoading(false)
        
        // Set fallback labs if location fails
        setLabs(FALLBACK_LABS)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const searchForRealLabs = async (location) => {
    setSearchingLabs(true)
    try {
      const realLabs = await searchNearbyLabs(location)
      if (realLabs.length > 0) {
        setLabs(realLabs)
        console.log(`Found ${realLabs.length} real labs near your location`)
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Labs Found!',
          text: `Found ${realLabs.length} medical facilities near your location`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        })
      } else {
        // Use fallback labs if no real labs found
        setLabs(FALLBACK_LABS)
        console.log('No real labs found, using fallback data')
        
        Swal.fire({
          icon: 'info',
          title: 'No Labs Found',
          text: 'No medical facilities found in your area. Showing sample data.',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        })
      }
    } catch (error) {
      console.error('Error searching for labs:', error)
      setLabs(FALLBACK_LABS)
      
      Swal.fire({
        icon: 'error',
        title: 'Search Error',
        text: 'Unable to search for labs. Showing sample data.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
    } finally {
      setSearchingLabs(false)
    }
  }

  const handleLabSelect = (lab) => {
    setSelectedLab(lab)
  }

  const handleGetDirections = (lab) => {
    if (!userLocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Location Required',
        text: 'Please allow location access to get directions.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK'
      })
      return
    }

    // Open Google Maps with directions
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lab.lat},${lab.lng}&travelmode=driving`
    window.open(directionsUrl, '_blank')
  }

  const renderMap = (status) => {
    // Always check if Google Maps is available first
    if (!window.google || !window.google.maps) {
      return <FallbackMapComponent labs={labs} onLabSelect={handleLabSelect} />
    }

    switch (status) {
      case Status.LOADING:
        return (
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
              <p className="text-gray-500 text-sm mt-2">Initializing Google Maps API...</p>
            </div>
          </div>
        )
      case Status.FAILURE:
        return <FallbackMapComponent labs={labs} onLabSelect={handleLabSelect} />
      default:
        return (
          <MapComponent
            userLocation={userLocation}
            labs={labs}
            selectedLab={selectedLab}
            onLabSelect={handleLabSelect}
            searchLocation={searchLocation}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
            {searchingLabs && (
              <p className="text-gray-500 text-sm mt-2">Searching for nearby labs...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Labs</h1>
        <p className="text-gray-600">Find laboratory locations near you and get directions</p>
        
        {/* Show fallback message if Google Maps is not available */}
        {(!window.google || !window.google.maps) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Google Maps Loading
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Google Maps is loading in the background. You can still view the labs list below.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative search-container">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a location, city, or address..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchSuggestions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b">
                      Suggestions
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSearchSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">{suggestion.name}</div>
                            <div className="text-sm text-gray-500">{suggestion.formatted_address}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && searchQuery.length === 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b">
                      Recent Searches
                    </div>
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(item.query)
                          setSearchLocation(item.location)
                          filterLabsByLocation(item.location)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <History className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">{item.query}</div>
                            <div className="text-sm text-gray-500">{item.location.address}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={useCurrentLocation}
            disabled={!userLocation}
            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Use My Location
          </button>
        </div>

        {searchLocation && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-primary-800 font-medium">Searching near: {searchLocation.address}</span>
              </div>
              <button
                onClick={clearSearch}
                className="text-primary-600 hover:text-primary-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* API Key Restriction Notice */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Google Maps API Key Configuration
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To enable full map functionality, please configure your Google Maps API key to allow:
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li><code className="bg-yellow-100 px-1 rounded">http://localhost:5173/*</code></li>
                  <li>Enable <strong>Maps JavaScript API</strong> and <strong>Places API</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Map View</h2>
            {(!window.google || !window.google.maps) ? (
              <FallbackMapComponent labs={labs} onLabSelect={handleLabSelect} />
            ) : (
              <GoogleMapsErrorBoundary 
                onRetry={() => setMapKey(prev => prev + 1)}
                labs={labs}
                onLabSelect={handleLabSelect}
              >
                <Wrapper 
                  key={mapKey}
                  apiKey={GOOGLE_MAPS_API_KEY} 
                  libraries={['places']}
                  render={renderMap} 
                />
              </GoogleMapsErrorBoundary>
            )}
          </div>
        </div>

        {/* Labs List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nearby Labs ({labs.length})</h2>
              {userLocation && (
                <button
                  onClick={() => searchForRealLabs(userLocation)}
                  disabled={searchingLabs}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4 mr-1" />
                  {searchingLabs ? 'Searching...' : 'Refresh'}
                </button>
              )}
            </div>
            
            {searchingLabs && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Searching for nearby labs...</p>
                </div>
              </div>
            )}
            
            {!searchingLabs && labs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No labs found in your area</p>
                <button
                  onClick={() => userLocation && searchForRealLabs(userLocation)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {!searchingLabs && labs.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {labs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    userLocation={userLocation}
                    onSelect={handleLabSelect}
                    onGetDirections={handleGetDirections}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Lab Details */}
      {selectedLab && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Lab Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedLab.name}</h3>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Address:</strong> {selectedLab.address}</p>
                <p className="text-gray-600"><strong>Phone:</strong> {selectedLab.phone}</p>
                <p className="text-gray-600"><strong>Hours:</strong> {selectedLab.hours}</p>
                <p className="text-gray-600"><strong>Rating:</strong> ⭐ {selectedLab.rating}</p>
                <p className="text-gray-600"><strong>Distance:</strong> {selectedLab.distance}</p>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Available Services</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedLab.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full text-center"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NearbyLabs
