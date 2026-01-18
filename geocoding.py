from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

def get_country(lat, lon):
    """
    Get the country name for a given latitude and longitude.
    
    Args:
        lat: Latitude in degrees
        lon: Longitude in degrees
        
    Returns:
        str: Country name or error message
    """
    geolocator = Nominatim(user_agent="lla_ecef_converter_app")
    try:
        # location = geolocator.reverse(f"{lat}, {lon}", language='en', zoom=3)
        # Using a slightly higher zoom to ensure we catch country even if in a city
        location = geolocator.reverse(f"{lat}, {lon}", language='en')
        
        if location and location.raw.get('address'):
            address = location.raw['address']
            country = address.get('country', "Unknown Country")
            state = address.get('state', address.get('province', "Unknown State"))
            return {"country": country, "state": state}
        else:
            return {"country": "Ocean / Unknown", "state": "---"}
            
    except (GeocoderTimedOut, GeocoderUnavailable):
        return "Network Error"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # Test
    print(get_country(48.8588443, 2.2943506)) # France
