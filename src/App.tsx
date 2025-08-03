import React, { useState, useEffect } from 'react'
import './App.css'

interface Destination {
  lat: number
  lng: number
  address: string
  name: string
}

function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [destination, setDestination] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved destination from localStorage on component mount
  useEffect(() => {
    const savedDestination = localStorage.getItem('ride-launcher-destination')
    if (savedDestination) {
      try {
        const parsed = JSON.parse(savedDestination)
        setDestination(parsed)
      } catch (err) {
        console.error('Error parsing saved destination:', err)
      }
    }
  }, [])

  // Save destination to localStorage whenever it changes
  useEffect(() => {
    if (destination) {
      localStorage.setItem('ride-launcher-destination', JSON.stringify(destination))
    }
  }, [destination])

  // Extract coordinates from Google Maps or Apple Maps URL
  const extractCoordinates = (url: string): { lat: number; lng: number } | null => {
    try {
      // Google Maps patterns
      const googlePatterns = [
        /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lng
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
        /place\/.*@(-?\d+\.\d+),(-?\d+\.\d+)/, // place/@lat,lng
      ]

      // Apple Maps patterns
      const applePatterns = [
        /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?ll=lat,lng
        /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lng
      ]

      const allPatterns = [...googlePatterns, ...applePatterns]

      for (const pattern of allPatterns) {
        const match = url.match(pattern)
        if (match) {
          const lat = parseFloat(match[1])
          const lng = parseFloat(match[2])
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng }
          }
        }
      }
      return null
    } catch (err) {
      console.error('Error extracting coordinates:', err)
      return null
    }
  }

  // Extract a clean destination name from the full address
  const extractDestinationName = (fullAddress: string): string => {
    try {
      // Split the address by commas and take the first few meaningful parts
      const parts = fullAddress.split(', ')
      
      // Try to find the most relevant part (usually the first 1-3 parts)
      if (parts.length >= 3) {
        // Take first 2-3 parts for a cleaner name
        return parts.slice(0, 3).join(', ')
      } else if (parts.length >= 2) {
        return parts.slice(0, 2).join(', ')
      } else {
        return parts[0] || fullAddress
      }
    } catch (err) {
      return fullAddress
    }
  }

  // Extract location name from URL
  const extractLocationName = (link: string): string | undefined => {
    // Try to extract location name from various URL patterns
    const namePatterns = [
      /[?&]name=([^&]+)/,
      /[?&]q=([^&]+)/,
      /[?&]address=([^&]+)/,
      /[?&]place=([^&]+)/,
      /[?&]location=([^&]+)/,
      /maps\.google\.com\/maps\/place\/([^\/\?]+)/,
      /maps\.google\.com\/maps\/search\/([^\/\?]+)/
    ];

    for (const pattern of namePatterns) {
      const match = link.match(pattern);
      if (match) {
        const decodedName = decodeURIComponent(match[1]);
        console.log('Location name extracted:', decodedName);
        return decodedName;
      }
    }

    return undefined;
  }

  // Geocode location name to coordinates
  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log('Geocoding location:', locationName);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        console.log('Geocoding failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        console.log('Geocoding successful:', coordinates);
        return coordinates;
      } else {
        console.log('No geocoding results found');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to get human-readable address
  const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; name: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }
      
      const data = await response.json()
      
      // Try to get a meaningful name from the address components
      let name = ''
      if (data.address) {
        // Try to construct a meaningful name from address components
        const components = data.address
        if (components.name) {
          name = components.name
        } else if (components.house_number && components.road) {
          name = `${components.house_number} ${components.road}`
        } else if (components.road) {
          name = components.road
        } else if (components.suburb) {
          name = components.suburb
        } else if (components.city) {
          name = components.city
        } else if (components.town) {
          name = components.town
        } else if (components.village) {
          name = components.village
        }
        
        // Add city/state if available and not already included
        if (name && components.city && !name.includes(components.city)) {
          name += `, ${components.city}`
        } else if (name && components.state && !name.includes(components.state)) {
          name += `, ${components.state}`
        }
      }
      
      // Fallback to display_name if we couldn't construct a good name
      if (!name) {
        name = extractDestinationName(data.display_name || `${lat}, ${lng}`)
      }
      
      const fullAddress = data.display_name || `${lat}, ${lng}`
      
      return {
        address: fullAddress,
        name: name || fullAddress
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err)
      const fallback = `${lat}, ${lng}`
      return {
        address: fallback,
        name: fallback
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Extract coordinates from URL
      let coords = extractCoordinates(inputUrl)
      
      if (!coords) {
        // Try to extract location name and geocode it
        const locationName = extractLocationName(inputUrl)
        if (locationName) {
          console.log('Location name extracted, attempting to geocode:', locationName)
          setError('Geocoding location... Please wait.')
          
          coords = await geocodeLocation(locationName)
          if (!coords) {
            throw new Error('Could not find coordinates for this location. Please try a different link or location name.')
          }
        } else {
          throw new Error('Could not extract coordinates or location name from the provided URL. Please make sure you\'re using a valid Google Maps or Apple Maps link.')
        }
      }

      // Get human-readable address and name
      const geocodeResult = await reverseGeocode(coords.lat, coords.lng)
      
      // Set destination
      setDestination({
        lat: coords.lat,
        lng: coords.lng,
        address: geocodeResult.address,
        name: geocodeResult.name
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the URL')
    } finally {
      setLoading(false)
    }
  }

  // Generate Uber deep link
  const generateUberLink = () => {
    if (!destination) return '#'
    
    const { lat, lng, address } = destination
    return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(address)}`
  }

  // Open Uber app
  const openUber = () => {
    const uberLink = generateUberLink()
    window.open(uberLink, '_blank')
  }

  // Clear saved destination
  const clearDestination = () => {
    setDestination(null)
    setInputUrl('')
    localStorage.removeItem('ride-launcher-destination')
  }

  return (
    <div className="app">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="logo">
            <span className="logo-icon">🚗</span>
            <h1>Ride Launcher</h1>
          </div>
          <p className="hero-subtitle">Convert location links to Uber rides instantly</p>
        </div>

        {/* Main Card */}
        <main className="main-card">
          {!destination ? (
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <div className="input-wrapper">
                  <textarea
                    id="url-input"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste your Google Maps or Apple Maps link here..."
                    rows={3}
                    disabled={loading}
                    required
                  />
                  
                  {error && (
                    <div className="error-section">
                      <div className="error-animation">
                        <div className="error-icon">⚠️</div>
                      </div>
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={loading || !inputUrl.trim()} 
                    className="primary-btn"
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                                        <span className="btn-icon">E</span>
                <span className="btn-text">Extract Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="result-section">
              <div className="success-animation">
                <div className="checkmark">✓</div>
              </div>
              
              <div className="coordinates">
                <h3>📍 Location Found</h3>
                <div className="coord-display">
                  <div className="coord-item">
                    <span className="coord-label">Latitude</span>
                    <span className="coord-value">{destination.lat.toFixed(6)}</span>
                  </div>
                  <div className="coord-item">
                    <span className="coord-label">Longitude</span>
                    <span className="coord-value">{destination.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                  Your ride to:
                </div>
                <div style={{ fontSize: '16px', color: '#007bff', fontWeight: '500' }}>
                  {destination.name}
                </div>
              </div>
              
              <div className="action-buttons">
                <button onClick={openUber} className="uber-btn">
                  <span>🚖</span>
                  <span>Continue to Uber</span>
                </button>
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={clearDestination} className="uber-web-btn">
                  <span>📍</span>
                  <span>Use Different Location</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Examples Section */}
        <div className="examples-section">
          <div className="examples-container">
            <h3>💡 Try these examples</h3>
            <div className="example-buttons">
              <button className="example-btn" onClick={() => setInputUrl('https://www.google.com/maps?q=12.935192,77.614177')}>
                <span className="example-icon">🗺️</span>
                <span>Google Maps</span>
              </button>
              <button className="example-btn" onClick={() => setInputUrl('https://g.co/kgs/t31e9pH')}>
                <span className="example-icon">🔗</span>
                <span>Google Short</span>
              </button>
              <button className="example-btn" onClick={() => setInputUrl('https://maps.apple.com/?ll=12.935192,77.614177')}>
                <span className="example-icon">🍎</span>
                <span>Apple Maps</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App