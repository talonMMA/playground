import unittest
import math
import lla_to_ecef

class TestConversion(unittest.TestCase):
    def test_lla_to_ecef_trivial(self):
        # 0, 0, 0 -> X=a, Y=0, Z=0
        x, y, z = lla_to_ecef.lla_to_ecef(0, 0, 0)
        self.assertAlmostEqual(x, 6378137.0, places=3)
        self.assertAlmostEqual(y, 0, places=3)
        self.assertAlmostEqual(z, 0, places=3)

    def test_ecef_to_lla_trivial(self):
        # X=a, Y=0, Z=0 -> 0, 0, 0
        lat, lon, alt = lla_to_ecef.ecef_to_lla(6378137.0, 0, 0)
        self.assertAlmostEqual(lat, 0, places=5)
        self.assertAlmostEqual(lon, 0, places=5)
        self.assertAlmostEqual(alt, 0, places=3)

    def test_round_trip(self):
        # Arbitrary point
        lat0, lon0, alt0 = 45.0, -120.0, 1000.0
        x, y, z = lla_to_ecef.lla_to_ecef(lat0, lon0, alt0)
        lat1, lon1, alt1 = lla_to_ecef.ecef_to_lla(x, y, z)
        
        self.assertAlmostEqual(lat0, lat1, places=5)
        self.assertAlmostEqual(lon0, lon1, places=5)
        self.assertAlmostEqual(alt0, alt1, places=3)

if __name__ == '__main__':
    unittest.main()
