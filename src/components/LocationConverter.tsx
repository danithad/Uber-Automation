import React, { useState, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
  locationName?: string;
}

interface ExampleLink {
  type: string;
  label: string;
  icon: string;
  url: string;
}

const LocationConverter: React.FC = () => {
  const [locationLink, setLocationLink] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const exampleLinks: ExampleLink[] = [
    {
      type: 'google',
      label: 'Google Maps',
      icon: '',
      url: 'https://www.google.com/maps?q=12.935192,77.614177'
    },
    {
      type: 'google-short',
      label: 'Google Short',
      icon: '',
      url: 'https://g.co/kgs/t31e9pH'
    },
    {
      type: 'apple-old',
      label: 'Apple Maps',
      icon: '',
      url: 'https://maps.apple.com/?ll=12.935192,77.614177'
    },
    {
      type: 'apple-new',
      label: 'Apple Place',
      icon: '',
      url: 'https://maps.apple.com/place?address=499/1,%209th%20Main%20Road,%20Block%205,%20Jayanagar,%20Bengaluru,%20560041,%20Karnataka,%20India&coordinate=12.916645,77.583374&name=Garden%20By%20Su&place-id=I22E5FB82B7759C05&map=explore'
    }
  ];

  const extractCoordinates = useCallback((link: string): Coordinates | null => {
    console.log('Extracting coordinates from:', link);
    
    // Google Maps patterns - more comprehensive
    const googlePatterns = [
      /maps\.google\.com\/maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com\/maps\?ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com\/maps\?daddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com\/maps\?saddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com\/maps\?cid=.*?@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /google\.com\/maps.*?@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com.*?@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /www\.google\.com\/maps.*?@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.google\.com\/maps.*?@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /google\.com\/maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/
    ];

    // Google Maps short links
    const googleShortPatterns = [
      /g\.co\/kgs\/[a-zA-Z0-9]+/,
      /goo\.gl\/maps\/[a-zA-Z0-9]+/,
      /maps\.app\.goo\.gl\/[a-zA-Z0-9]+/,
      /maps\.google\.com\/maps\/[a-zA-Z0-9]+/,
      /google\.com\/maps\/[a-zA-Z0-9]+/
    ];

    // Apple Maps patterns
    const applePatterns = [
      /maps\.apple\.com\/\?ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.apple\.com\/\?daddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.apple\.com\/\?saddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /maps\.apple\.com\/place\?.*?coordinate=(-?\d+\.\d+),(-?\d+\.\d+)/
    ];

    // Try Google Maps patterns first
    for (const pattern of googlePatterns) {
      const match = link.match(pattern);
      if (match) {
        console.log('Google Maps match found:', match);
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Try to extract location name from the URL
          const locationName = extractLocationName(link);
          return { latitude: lat, longitude: lng, locationName };
        }
      }
    }

    // Try Google Maps short links
    for (const pattern of googleShortPatterns) {
      if (pattern.test(link)) {
        console.log('Short link detected, will handle in processLocationLink');
        return null; // Let the async handler deal with it
      }
    }

    // Try Apple Maps patterns
    for (const pattern of applePatterns) {
      const match = link.match(pattern);
      if (match) {
        console.log('Apple Maps match found:', match);
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Try to extract location name from the URL
          const locationName = extractLocationName(link);
          return { latitude: lat, longitude: lng, locationName };
        }
      }
    }

    // Additional patterns for various formats
    const additionalPatterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /coordinate=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /lat=(-?\d+\.\d+).*?lng=(-?\d+\.\d+)/,
      /latitude=(-?\d+\.\d+).*?longitude=(-?\d+\.\d+)/,
      /daddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /saddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /(-?\d+\.\d+),(-?\d+\.\d+)/ // Generic lat,lng pattern
    ];

    for (const pattern of additionalPatterns) {
      const match = link.match(pattern);
      if (match) {
        console.log('Additional pattern match found:', match);
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Try to extract location name from the URL
          const locationName = extractLocationName(link);
          return { latitude: lat, longitude: lng, locationName };
        }
      }
    }

    // Final fallback: try to find any coordinate-like pattern in the URL
    const fallbackPattern = /(-?\d+\.\d+),(-?\d+\.\d+)/g;
    let match;
    while ((match = fallbackPattern.exec(link)) !== null) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Validate coordinates
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log('Fallback pattern match found:', match);
        // Try to extract location name from the URL
        const locationName = extractLocationName(link);
        return { latitude: lat, longitude: lng, locationName };
      }
    }
    
    console.log('No valid coordinates found');
    return null;
  }, []);

  const extractLocationName = useCallback((link: string): string | undefined => {
    // Try to extract location name from various URL patterns
    const namePatterns = [
      /[?&]name=([^&]+)/,
      /[?&]q=([^&]+)/,
      /[?&]address=([^&]+)/,
      /[?&]place=([^&]+)/,
      /[?&]location=([^&]+)/
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
  }, []);

  const openUberWeb = useCallback(() => {
    if (!coordinates) return;
    
    const { latitude, longitude, locationName } = coordinates;
    // Use extracted location name or default to "Shared Location"
    const nickname = locationName ? encodeURIComponent(locationName) : 'Shared%20Location';
    const uberWebLink = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${nickname}`;
    
    console.log('Opening Uber web link:', uberWebLink);
    window.open(uberWebLink, '_blank');
  }, [coordinates]);

  const openUberDeepLink = useCallback(() => {
    if (!coordinates) return;
    
    const { latitude, longitude, locationName } = coordinates;
    // Use extracted location name or default to "Shared Location"
    const nickname = locationName ? encodeURIComponent(locationName) : 'Shared%20Location';
    const uberDeepLink = `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${nickname}`;
    
    console.log('Opening Uber deep link:', uberDeepLink);
    
    // Try to open the deep link
    window.location.href = uberDeepLink;
    
    // Fallback after a short delay if the app doesn't open
    setTimeout(() => {
      console.log('Falling back to web version');
      openUberWeb();
    }, 2000);
  }, [coordinates, openUberWeb]);

  const processLocationLink = useCallback(() => {
    const link = locationLink.trim();
    
    if (!link) {
      return; // Just return without showing any error
    }

    // Clear any existing error when processing
    setError('');

    setIsProcessing(true);
    setError('');

    // Check if it's a Google Maps short link
    const isShortLink = /g\.co\/kgs\/|goo\.gl\/maps\/|maps\.app\.goo\.gl\//.test(link);
    
    if (isShortLink) {
      // Follow the redirect for short links
      console.log('Processing short link:', link);
      
      // Try to resolve the short link
      fetch(link, { 
        method: 'HEAD', 
        redirect: 'follow',
        mode: 'no-cors' // Try to avoid CORS issues
      })
        .then(response => {
          const finalUrl = response.url;
          console.log('Short link resolved to:', finalUrl);
          const coords = extractCoordinates(finalUrl);
          
          if (coords) {
            setCoordinates(coords);
            setError('');
            console.log('Coordinates extracted from short link:', coords);
          } else {
            // Try to extract from the original short link as fallback
            const fallbackCoords = extractCoordinates(link);
            if (fallbackCoords) {
              setCoordinates(fallbackCoords);
              setError('');
              console.log('Coordinates extracted from short link fallback:', fallbackCoords);
            } else {
              setError('Could not extract coordinates from the short link. Please try the full Google Maps link.');
              setCoordinates(null);
            }
          }
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error('Error resolving short link:', error);
          
          // Try to extract from the original short link as fallback
          const fallbackCoords = extractCoordinates(link);
          if (fallbackCoords) {
            setCoordinates(fallbackCoords);
            setError('');
            console.log('Coordinates extracted from short link fallback after error:', fallbackCoords);
          } else {
            setError('Could not resolve the short link. Please try the full Google Maps link.');
            setCoordinates(null);
          }
          setIsProcessing(false);
        });
    } else {
      // Handle regular links
      setTimeout(() => {
        const coords = extractCoordinates(link);
        console.log('Extracted coordinates:', coords);
        
        if (coords) {
          setCoordinates(coords);
          setError('');
          console.log('Coordinates set successfully');
        } else {
          setError('Invalid link format. Please paste a valid Google Maps or Apple Maps link.');
          setCoordinates(null);
          console.log('No coordinates found');
        }
        
        setIsProcessing(false);
      }, 300);
    }
  }, [locationLink, extractCoordinates, openUberDeepLink]);

  const handleExampleClick = useCallback((example: ExampleLink) => {
    setLocationLink(example.url);
    // Auto-process after setting the link
    setTimeout(() => {
      setLocationLink(example.url);
      setTimeout(processLocationLink, 100);
    }, 50);
  }, [processLocationLink]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processLocationLink();
    }
  }, [processLocationLink]);

  const handlePaste = useCallback(() => {
    setTimeout(processLocationLink, 100);
  }, [processLocationLink]);

  return (
    <div className="container">
             <div className="hero-section">
         <div className="logo">
           <h1>WhatsApp to Uber</h1>
         </div>
         <p className="hero-subtitle">Paste a location link and open it directly in Uber</p>
       </div>

      <main className="main-card">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea 
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Paste your location link here..."
              rows={2}
              disabled={isProcessing}
            />
                         <button 
               className={`primary-btn ${isProcessing ? 'loading' : ''}`}
               onClick={processLocationLink}
               disabled={isProcessing}
             >
               <span className="btn-text">
                 {isProcessing ? 'Processing...' : 'Extract'}
               </span>
             </button>
          </div>
        </div>

        {coordinates && (
          <div className="result-section">
            <div className="success-animation">
              <div className="checkmark">✓</div>
            </div>
                         <div className="coordinates">
               <h3>Location Found</h3>
              <div className="coord-display">
                <div className="coord-item">
                  <span className="coord-label">Latitude</span>
                  <span className="coord-value">{coordinates.latitude.toFixed(6)}</span>
                </div>
                <div className="coord-item">
                  <span className="coord-label">Longitude</span>
                  <span className="coord-value">{coordinates.longitude.toFixed(6)}</span>
                </div>
              </div>
              
            </div>
            
            <div className="action-buttons">
              <button className="uber-btn" onClick={openUberDeepLink}>
                <span>Book Uber</span>
              </button>
            </div>
          </div>
        )}

                 {error && !coordinates && (
           <div className="error-section">
             <div className="error-animation">
               <div className="error-icon">!</div>
             </div>
             <p>{error}</p>
           </div>
         )}
      </main>

             <div className="examples-section">
         <div className="examples-container">
           <h3>Try these examples</h3>
          <div className="example-buttons">
            {exampleLinks.map((example) => (
              <button 
                key={example.type}
                className="example-btn"
                onClick={() => handleExampleClick(example)}
                disabled={isProcessing}
              >
                <span className="example-icon">{example.icon}</span>
                <span>{example.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationConverter; 