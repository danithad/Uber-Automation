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

    processLocationLink() {
        const link = this.locationInput.value.trim();
        
        if (!link) {
            this.showError('Please paste a location link first.');
            return;
        }

        console.log('Processing link:', link);
        const coordinates = this.extractCoordinates(link);
        console.log('Extracted coordinates:', coordinates);

        // Validate coordinates before displaying
        if (coordinates) {
            console.log('Validating coordinates:', coordinates.latitude, coordinates.longitude);
            const isValid = this.isValidCoordinate(coordinates.latitude, coordinates.longitude);
            console.log('Coordinates valid:', isValid);
            
            if (isValid) {
                this.displayCoordinates(coordinates);
                this.hideError();
                this.showResult();
            } else {
                this.showError(`Invalid coordinates: Latitude (${coordinates.latitude}) must be between -90 and 90, Longitude (${coordinates.longitude}) must be between -180 and 180.`);
            }
        } else {
            this.showError('Could not extract coordinates from the link. Please paste a valid Google Maps or Apple Maps link.');
        }
    }

    extractCoordinates(link) {
        console.log('Extracting coordinates from:', link);
        
        // Updated coordinate pattern to handle both integers and decimals
        const coordPattern = '(-?\\d+(?:\\.\\d+)?)';
        
        // Google Maps patterns - updated to handle more formats
        const googlePatterns = [
            new RegExp(`maps\\.google\\.com\\/maps\\?q=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?ll=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?daddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?saddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com\\/maps\\?cid=.*?@${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.google\\.com.*?@${coordPattern},${coordPattern}`),
            new RegExp(`google\\.com\\/maps.*?@${coordPattern},${coordPattern}`)
        ];

        // Apple Maps patterns
        const applePatterns = [
            new RegExp(`maps\\.apple\\.com\\/\\?ll=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/\\?daddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/\\?saddr=${coordPattern},${coordPattern}`),
            new RegExp(`maps\\.apple\\.com\\/place\\?.*?coordinate=${coordPattern},${coordPattern}`)
        ];

        // Try Google Maps patterns first
        for (const pattern of googlePatterns) {
            const match = link.match(pattern);
            if (match) {
                console.log('Google Maps match found:', match);
                return {
                    latitude: parseFloat(match[1]),
                    longitude: parseFloat(match[2])
                };
            }
        }

        // Try Apple Maps patterns
        for (const pattern of applePatterns) {
            const match = link.match(pattern);
            if (match) {
                console.log('Apple Maps match found:', match);
                return {
                    latitude: parseFloat(match[1]),
                    longitude: parseFloat(match[2])
                };
            }
        }

        // Additional patterns for various formats
        const additionalPatterns = [
            new RegExp(`@${coordPattern},${coordPattern}`),
            new RegExp(`q=${coordPattern},${coordPattern}`),
            new RegExp(`ll=${coordPattern},${coordPattern}`),
            new RegExp(`coordinate=${coordPattern},${coordPattern}`),
            new RegExp(`${coordPattern},${coordPattern}`) // Generic lat,lng pattern
        ];

        for (const pattern of additionalPatterns) {
            const match = link.match(pattern);
            if (match) {
                console.log('Additional pattern match found:', match);
                return {
                    latitude: parseFloat(match[1]),
                    longitude: parseFloat(match[2])
                };
            }
        }

        console.log('No coordinate pattern matched');
        return null;
    }

    displayCoordinates(coordinates) {
        this.latitudeDisplay.textContent = coordinates.latitude.toFixed(6);
        this.longitudeDisplay.textContent = coordinates.longitude.toFixed(6);
        
        // Store coordinates for use in Uber links
        this.currentCoordinates = coordinates;
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
function testLink(type) {
    const examples = {
        'google': 'https://www.google.com/maps?q=12.935192,77.614177',
        'apple-old': 'https://maps.apple.com/?ll=12.935192,77.614177',
        'apple-new': 'https://maps.apple.com/place?address=499/1,%209th%20Main%20Road,%20Block%205,%20Jayanagar,%20Bengaluru,%20560041,%20Karnataka,%20India&coordinate=12.916645,77.583374&name=Garden%20By%20Su&place-id=I22E5FB82B7759C05&map=explore'
    };
    
    const link = examples[type];
    if (link) {
        document.getElementById('locationLink').value = link;
        // Create a new instance and process the link
        const converter = new LocationLinkConverter();
        converter.processLocationLink();
    }
}

