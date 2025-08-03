class LocationLinkConverter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.locationInput = document.getElementById('locationLink');
        this.openUberBtn = document.getElementById('openUberBtn');
        this.resultSection = document.getElementById('result');
        this.errorSection = document.getElementById('error');
        this.latitudeDisplay = document.getElementById('latitude');
        this.longitudeDisplay = document.getElementById('longitude');
        this.openUberMainBtn = document.getElementById('openUberMain');
    }

    bindEvents() {
        this.openUberBtn.addEventListener('click', () => this.processLocationLink());
        this.openUberMainBtn.addEventListener('click', () => this.openUber());
        
        // Allow Enter key to trigger the process
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.processLocationLink();
            }
        });

        // Auto-process when pasting
        this.locationInput.addEventListener('paste', () => {
            setTimeout(() => this.processLocationLink(), 100);
        });
    }

    async processLocationLink() {
        const link = this.locationInput.value.trim();
        
        if (!link) {
            this.showError('Please paste a location link first.');
            return;
        }

        console.log('Processing link:', link);
        
        // Handle various URL formats with @ prefix
        let processedLink = link;
        if (link.includes('gmaps tinyurl @')) {
            processedLink = link.replace('gmaps tinyurl @', '');
            console.log('Extracted URL from gmaps tinyurl format:', processedLink);
        } else if (link.startsWith('@')) {
            processedLink = link.substring(1);
            console.log('Extracted URL from @ prefix format:', processedLink);
        }
        
        // Check if it's a short link first
        if (this.isShortLink(processedLink)) {
            console.log('Detected short link, attempting to resolve...');
            this.showError('Resolving short link... Please wait.');
            
            try {
                const resolvedUrl = await this.resolveShortLink(processedLink);
                console.log('Resolved URL:', resolvedUrl);
                
                // Try to extract coordinates from the resolved URL
                const coordinates = this.extractCoordinates(resolvedUrl);
                if (coordinates) {
                    console.log('Coordinates extracted from resolved URL:', coordinates);
                    const isValid = this.isValidCoordinate(coordinates.latitude, coordinates.longitude);
                    
                    if (isValid) {
                        await this.displayCoordinates(coordinates);
                        this.hideError();
                        this.showResult();
                        return;
                    }
                } else {
                    // Try to extract location name and geocode it
                    const locationName = this.extractLocationName(resolvedUrl);
                    if (locationName) {
                        console.log('Location name extracted, attempting to geocode:', locationName);
                        this.showError('Geocoding location... Please wait.');
                        
                        const geocodedCoords = await this.geocodeLocation(locationName);
                        if (geocodedCoords) {
                            await this.displayCoordinates(geocodedCoords);
                            this.hideError();
                            this.showResult();
                            return;
                        }
                    }
                    
                    this.showError('Short link resolved but no coordinates or location name found. Please try the full Google Maps link.');
                    return;
                }
            } catch (error) {
                console.error('Error resolving short link:', error);
                this.showError('This short link appears to be blocked or restricted. Please try the full Google Maps link instead.');
                return;
            }
        }
        
        // Try to extract coordinates directly from the original link
        const coordinates = this.extractCoordinates(processedLink);
        console.log('Extracted coordinates:', coordinates);

        // Validate coordinates before displaying
        if (coordinates) {
            console.log('Validating coordinates:', coordinates.latitude, coordinates.longitude);
            const isValid = this.isValidCoordinate(coordinates.latitude, coordinates.longitude);
            console.log('Coordinates valid:', isValid);
            
            if (isValid) {
                await this.displayCoordinates(coordinates);
                this.hideError();
                this.showResult();
            } else {
                this.showError(`Invalid coordinates: Latitude (${coordinates.latitude}) must be between -90 and 90, Longitude (${coordinates.longitude}) must be between -180 and 180.`);
            }
        } else {
            // Try to extract location name and geocode it
            const locationName = this.extractLocationName(processedLink);
            if (locationName) {
                console.log('Location name extracted, attempting to geocode:', locationName);
                this.showError('Geocoding location... Please wait.');
                
                const geocodedCoords = await this.geocodeLocation(locationName);
                if (geocodedCoords) {
                    await this.displayCoordinates(geocodedCoords);
                    this.hideError();
                    this.showResult();
                } else {
                    this.showError('Could not find coordinates for this location. Please try a different link or location name.');
                }
            } else {
                this.showError('Could not extract coordinates or location name from the link. Please paste a valid Google Maps or Apple Maps link.');
            }
        }
    }

    extractCoordinates(link) {
        console.log('Extracting coordinates from:', link);
        
        // Updated coordinate pattern to handle both integers and decimals
        const coordPattern = '(-?\\d+(?:\\.\\d+)?)';
        
        // Comprehensive coordinate extraction patterns
        const coordinatePatterns = [
            // Google Maps patterns
            new RegExp(`maps\\.google\\.com\\/maps\\?q=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?ll=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?daddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?saddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?cid=.*?@${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com.*?@${coordPattern},${coordPattern}`),
            new RegExp(`google\\.com\\/maps.*?@${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\/place\\/.*?@${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\/place\\/.*?\\/${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/\\?q=${coordPattern},${coordPattern}`),
            new RegExp(`google\\.com\\/maps\\?q=${coordPattern},${coordPattern}`),
            
            // Apple Maps patterns
            new RegExp(`maps\\.apple\\.com\\/\\?ll=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/\\?daddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/\\?saddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/place\\?.*?coordinate=${coordPattern},${coordPattern}`),
            
            // Bing Maps patterns
            new RegExp(`bing\\.com\\/maps.*?cp=${coordPattern}~${coordPattern}`),
            new RegExp(`bing\\.com\\/maps.*?sp=${coordPattern},${coordPattern}`),
            
            // OpenStreetMap patterns
            new RegExp(`openstreetmap\\.org.*?mlat=${coordPattern}.*?mlon=${coordPattern}`),
            new RegExp(`openstreetmap\\.org.*?lat=${coordPattern}.*?lon=${coordPattern}`),
            
            // Here Maps patterns
            new RegExp(`here\\.com.*?map=${coordPattern},${coordPattern}`),
            
            // Waze patterns
            new RegExp(`waze\\.com.*?ll=${coordPattern},${coordPattern}`),
            
            // Generic patterns
            new RegExp(`@${coordPattern},${coordPattern}`),
            new RegExp(`q=${coordPattern},${coordPattern}`),
            new RegExp(`ll=${coordPattern},${coordPattern}`),
            new RegExp(`coordinate=${coordPattern},${coordPattern}`),
            new RegExp(`lat=${coordPattern}.*?lng=${coordPattern}`),
            new RegExp(`latitude=${coordPattern}.*?longitude=${coordPattern}`),
            new RegExp(`daddr=${coordPattern},${coordPattern}`),
            new RegExp(`saddr=${coordPattern},${coordPattern}`),
            
            // Most generic pattern (should be last)
            new RegExp(`${coordPattern},${coordPattern}`)
        ];

        // Try all patterns
        for (const pattern of coordinatePatterns) {
            const match = link.match(pattern);
            if (match) {
                console.log('Pattern match found:', match);
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                
                // Validate coordinates
                if (this.isValidCoordinate(lat, lng)) {
                    console.log('Valid coordinates extracted:', { lat, lng });
                    return { latitude: lat, longitude: lng };
                }
            }
        }

        // Final fallback: find any coordinate-like pattern in the URL
        const fallbackPattern = /(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/g;
        let match;
        while ((match = fallbackPattern.exec(link)) !== null) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            // Validate coordinates
            if (this.isValidCoordinate(lat, lng)) {
                console.log('Fallback coordinates found:', { lat, lng });
                return { latitude: lat, longitude: lng };
            }
        }
        
        console.log('No valid coordinates found in URL');
        return null;
    }

    // Check if the link is a Google Maps short link
    isShortLink(link) {
        const shortLinkPatterns = [
            /g\.co\/kgs\//,
            /goo\.gl\/maps\//,
            /maps\.app\.goo\.gl\//,
            /maps\.google\.com\/maps\/[a-zA-Z0-9]+/,
            /google\.com\/maps\/[a-zA-Z0-9]+/,
            /gmaps\.tinyurl\.com\//,
            /tinyurl\.com\/[a-zA-Z0-9]+/,
            /bit\.ly\/[a-zA-Z0-9]+/,
            /is\.gd\/[a-zA-Z0-9]+/
        ];
        
        return shortLinkPatterns.some(pattern => pattern.test(link));
    }

    // Extract location name from URL
    extractLocationName(link) {
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

        return null;
    }

    // Geocode location name to coordinates
    async geocodeLocation(locationName) {
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
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    locationName: locationName
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

    // Resolve Google Maps short link to get the full URL
    async resolveShortLink(shortLink) {
        try {
            console.log('Resolving short link:', shortLink);
            
            // Try multiple CORS proxies for better reliability
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://cors-anywhere.herokuapp.com/',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            
            for (const proxy of proxies) {
                try {
                    console.log(`Trying proxy: ${proxy}`);
                    const response = await fetch(proxy + encodeURIComponent(shortLink), {
                        method: 'HEAD',
                        redirect: 'follow'
                    });
                    
                    if (response.ok) {
                        const finalUrl = response.url;
                        console.log('Short link resolved to:', finalUrl);
                        
                        // Check if the resolved URL is different from the original
                        if (finalUrl !== shortLink && finalUrl.includes('google.com/maps')) {
                            return finalUrl;
                        } else {
                            console.log('Resolved URL is not a valid Google Maps URL');
                            continue;
                        }
                    }
                } catch (proxyError) {
                    console.log(`Proxy ${proxy} failed:`, proxyError.message);
                    continue;
                }
            }
            
            throw new Error('All proxies failed to resolve short link');
        } catch (error) {
            console.error('Error resolving short link:', error);
            throw error;
        }
    }

    async displayCoordinates(coordinates) {
        this.latitudeDisplay.textContent = coordinates.latitude.toFixed(6);
        this.longitudeDisplay.textContent = coordinates.longitude.toFixed(6);
        
        // Store coordinates for use in Uber links
        this.currentCoordinates = coordinates;
        
        // Get location name from coordinates
        try {
            const locationName = await this.reverseGeocode(coordinates.latitude, coordinates.longitude);
            this.updateLocationDisplay(locationName);
        } catch (err) {
            console.error('Error getting location name:', err);
            // Fallback to coordinates if reverse geocoding fails
            this.updateLocationDisplay(`${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`);
        }
    }

    openUber() {
        if (!this.currentCoordinates) return;
        
        const { latitude, longitude } = this.currentCoordinates;
        
        // Try multiple Uber URL formats for better compatibility
        const uberUrls = [
            // Format 1: Standard deep link with formatted address
            `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[formatted_address]=Destination`,
            // Format 2: Web fallback
            `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[formatted_address]=Destination`
        ];
        
        // Try deep link first
        console.log('Opening Uber with coordinates:', latitude, longitude);
        
        // Create a hidden iframe to test if the app opens
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = uberUrls[0];
        document.body.appendChild(iframe);
        
        // Fallback to web version after 2 seconds if app doesn't open
        setTimeout(() => {
            document.body.removeChild(iframe);
            window.open(uberUrls[1], '_blank');
        }, 2000);
    }

    showResult() {
        this.resultSection.classList.remove('hidden');
    }

    showError(message) {
        this.errorSection.querySelector('p').textContent = message;
        this.errorSection.classList.remove('hidden');
        this.resultSection.classList.add('hidden');
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }

    // Reverse geocode coordinates to get location name
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            
            const data = await response.json();
            
            // Try to get a meaningful name from the address components
            let name = '';
            if (data.address) {
                const components = data.address;
                if (components.name) {
                    name = components.name;
                } else if (components.house_number && components.road) {
                    name = `${components.house_number} ${components.road}`;
                } else if (components.road) {
                    name = components.road;
                } else if (components.suburb) {
                    name = components.suburb;
                } else if (components.city) {
                    name = components.city;
                } else if (components.town) {
                    name = components.town;
                } else if (components.village) {
                    name = components.village;
                }
                
                // Add city/state if available and not already included
                if (name && components.city && !name.includes(components.city)) {
                    name += `, ${components.city}`;
                } else if (name && components.state && !name.includes(components.state)) {
                    name += `, ${components.state}`;
                }
            }
            
            // Fallback to display_name if we couldn't construct a good name
            if (!name) {
                name = this.extractDestinationName(data.display_name || `${lat}, ${lng}`);
            }
            
            return name || data.display_name || `${lat}, ${lng}`;
        } catch (err) {
            console.error('Error reverse geocoding:', err);
            return `${lat}, ${lng}`;
        }
    }

    // Extract a clean destination name from the full address
    extractDestinationName(fullAddress) {
        try {
            // Split the address by commas and take the first few meaningful parts
            const parts = fullAddress.split(', ');
            
            // Try to find the most relevant part (usually the first 1-3 parts)
            if (parts.length >= 3) {
                // Take first 2-3 parts for a cleaner name
                return parts.slice(0, 3).join(', ');
            } else if (parts.length >= 2) {
                return parts.slice(0, 2).join(', ');
            } else {
                return parts[0] || fullAddress;
            }
        } catch (err) {
            return fullAddress;
        }
    }

    // Update location display to show name instead of coordinates
    updateLocationDisplay(locationName) {
        // Find or create a location name display element
        let locationNameElement = document.getElementById('locationName');
        if (!locationNameElement) {
            // Create the element if it doesn't exist
            const coordDisplay = document.querySelector('.coord-display');
            if (coordDisplay) {
                locationNameElement = document.createElement('div');
                locationNameElement.id = 'locationName';
                locationNameElement.className = 'location-name';
                locationNameElement.style.cssText = `
                    margin-top: 12px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                    font-size: 16px;
                    font-weight: 500;
                    color: #212529;
                    text-align: center;
                `;
                coordDisplay.appendChild(locationNameElement);
            }
        }
        
        if (locationNameElement) {
            locationNameElement.textContent = locationName;
        }
    }

    // Utility method to validate coordinates
    isValidCoordinate(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LocationLinkConverter();
});

// Global function for example buttons
async function testLink(type) {
    const examples = {
        'google': 'https://www.google.com/maps?q=12.9716,77.5946',
        'google-short': 'https://maps.google.com/?q=12.9789,77.5917',
        'at-prefix': '@https://maps.google.com/?q=12.9789,77.5917',
        'apple-maps': 'https://maps.apple.com/?ll=12.9716,77.5946'
    };
    
    const link = examples[type];
    if (link) {
        document.getElementById('locationLink').value = link;
        // Create a new instance and process the link
        const converter = new LocationLinkConverter();
        await converter.processLocationLink();
    }
}

