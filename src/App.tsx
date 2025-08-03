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

  // Reverse geocode coordinates to get human-readable address
  const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; name: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }
      
      const data = await response.json()
      const fullAddress = data.display_name || `${lat}, ${lng}`
      const name = extractDestinationName(fullAddress)
      
      return {
        address: fullAddress,
        name: name
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
      const coords = extractCoordinates(inputUrl)
      if (!coords) {
        throw new Error('Could not extract coordinates from the provided URL. Please make sure you\'re using a valid Google Maps or Apple Maps link.')
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
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🚗</span>
            <h1>Ride Launcher</h1>
          </div>
          <p className="subtitle">Convert Google Maps & Apple Maps links to Uber rides</p>
        </header>

        <main className="main">
          {!destination ? (
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label htmlFor="url-input" className="label">
                  Paste your Google Maps or Apple Maps link:
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.google.com/maps?q=12.935192,77.614177"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="error">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <button type="submit" disabled={loading || !inputUrl.trim()} className="button primary">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Extract Location'
                )}
              </button>
            </form>
          ) : (
            <div className="confirmation">
              <div className="confirmation-message">
                <span className="confirmation-icon">📍</span>
                <h2>You're about to book an Uber to:</h2>
                <p className="destination-name">{destination.name}</p>
                <p className="full-address">{destination.address}</p>
                <p className="coordinates">
                  {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                </p>
              </div>
              
              <div className="actions">
                <button onClick={openUber} className="button primary uber-button">
                  <span className="uber-icon">🚖</span>
                  Open in Uber
                </button>
                <button onClick={clearDestination} className="button secondary">
                  Use Different Location
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>Supports Google Maps and Apple Maps location links</p>
          {destination && (
            <p className="saved-indicator">
              <span className="saved-icon">💾</span>
              Location saved - it will be here when you return
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}

export default App