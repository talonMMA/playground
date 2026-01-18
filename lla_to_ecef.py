import math

# WGS84 Ellipsoid Constants
WGS84_A = 6378137.0  # Semi-major axis (meters)
WGS84_F = 1.0 / 298.257223563  # Flattening
WGS84_E2 = 2 * WGS84_F - WGS84_F ** 2  # Square of eccentricity

def lla_to_ecef(lat_deg, lon_deg, alt_m):
    """
    Convert Geodetic coordinates (LLA) to ECEF.
    
    Args:
        lat_deg: Latitude in degrees
        lon_deg: Longitude in degrees
        alt_m: Altitude in meters
        
    Returns:
        tuple: (x, y, z) in meters
    """
    lat_rad = math.radians(lat_deg)
    lon_rad = math.radians(lon_deg)
    
    sin_lat = math.sin(lat_rad)
    cos_lat = math.cos(lat_rad)
    sin_lon = math.sin(lon_rad)
    cos_lon = math.cos(lon_rad)
    
    N = WGS84_A / math.sqrt(1.0 - WGS84_E2 * sin_lat ** 2)
    
    x = (N + alt_m) * cos_lat * cos_lon
    y = (N + alt_m) * cos_lat * sin_lon
    z = (N * (1.0 - WGS84_E2) + alt_m) * sin_lat
    
    return x, y, z

def ecef_to_lla(x, y, z):
    """
    Convert ECEF coordinates to Geodetic (LLA).
    Uses the iterative method or Ferrari's solution. 
    Here we use a robust iterative approach.
    
    Args:
        x: X coordinate in meters
        y: Y coordinate in meters
        z: Z coordinate in meters
        
    Returns:
        tuple: (lat_deg, lon_deg, alt_m)
    """
    # Longitude is straightforward
    lon_rad = math.atan2(y, x)
    
    # Distance from Z-axis
    p = math.sqrt(x**2 + y**2)
    
    # Initial approximation for Latitude
    # Assumes h=0 for initial guess
    if p == 0:
        if z > 0:
            lat_rad = math.pi / 2
        else:
            lat_rad = -math.pi / 2
    else:
        lat_rad = math.atan2(z, p * (1 - WGS84_E2))
    
    # Iteratively refine Latitude and Height
    # Usually converges in 3-4 iterations
    prev_alt = 0.0
    for _ in range(5):
        sin_lat = math.sin(lat_rad)
        N = WGS84_A / math.sqrt(1.0 - WGS84_E2 * sin_lat ** 2)
        alt_m = p / math.cos(lat_rad) - N
        lat_rad = math.atan2(z, p * (1 - WGS84_E2 * N / (N + alt_m)))
        
        # Check convergence (optional, but good practice)
        if abs(alt_m - prev_alt) < 1e-6:
            break
        prev_alt = alt_m
        
    lat_deg = math.degrees(lat_rad)
    lon_deg = math.degrees(lon_rad)
    
    return lat_deg, lon_deg, alt_m
