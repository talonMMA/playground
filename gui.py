import tkinter as tk
from tkinter import ttk, messagebox
import threading
import lla_to_ecef
import geocoding

class ConverterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("LLA <-> ECEF Converter")
        self.root.geometry("500x350")
        self.root.resizable(False, False)

        # Style
        style = ttk.Style()
        style.configure("TLabel", padding=5)
        style.configure("TButton", padding=5)

        # Main Frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # LLA Frame
        lla_frame = ttk.LabelFrame(main_frame, text="LLA (Geodetic)", padding="10")
        lla_frame.pack(fill=tk.X, pady=5)

        self.lat_var = tk.StringVar()
        self.lon_var = tk.StringVar()
        self.alt_var = tk.StringVar()

        self._create_input_row(lla_frame, "Latitude (deg):", self.lat_var, 0)
        self._create_input_row(lla_frame, "Longitude (deg):", self.lon_var, 1)
        self._create_input_row(lla_frame, "Altitude (m):", self.alt_var, 2)
        
        # Country Display
        self.country_var = tk.StringVar(value="---")
        self._create_display_row(lla_frame, "Country:", self.country_var, 3)

        # Buttons Frame
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X, pady=10)

        # Buttons with arrows indicating direction
        ttk.Button(btn_frame, text="LLA -> ECEF \u25BC", command=self.convert_lla_to_ecef).pack(side=tk.LEFT, expand=True, padx=5)
        ttk.Button(btn_frame, text="Clear", command=self.clear_fields).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="\u25B2 ECEF -> LLA", command=self.convert_ecef_to_lla).pack(side=tk.LEFT, expand=True, padx=5)

        # ECEF Frame
        ecef_frame = ttk.LabelFrame(main_frame, text="ECEF (Cartesian)", padding="10")
        ecef_frame.pack(fill=tk.X, pady=5)

        self.x_var = tk.StringVar()
        self.y_var = tk.StringVar()
        self.z_var = tk.StringVar()

        self._create_input_row(ecef_frame, "X (m):", self.x_var, 0)
        self._create_input_row(ecef_frame, "Y (m):", self.y_var, 1)
        self._create_input_row(ecef_frame, "Z (m):", self.z_var, 2)

    def _create_input_row(self, parent, label_text, variable, row):
        ttk.Label(parent, text=label_text, width=15).grid(row=row, column=0, sticky=tk.W)
        ttk.Entry(parent, textvariable=variable, width=30).grid(row=row, column=1, sticky=tk.W)


    def _create_display_row(self, parent, label_text, variable, row):
        ttk.Label(parent, text=label_text).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Label(parent, textvariable=variable, font=("Arial", 10, "bold")).grid(row=row, column=1, sticky=tk.W, pady=5)

    def update_country(self, lat, lon):
        def task():
            self.country_var.set("Loading...")
            country = geocoding.get_country(lat, lon)
            self.country_var.set(country)
        threading.Thread(target=task, daemon=True).start()

    def convert_lla_to_ecef(self):
        try:
            lat = float(self.lat_var.get())
            lon = float(self.lon_var.get())
            alt = float(self.alt_var.get())

            x, y, z = lla_to_ecef.lla_to_ecef(lat, lon, alt)
            
            self.update_country(lat, lon)

            self.x_var.set(f"{x:.4f}")
            self.y_var.set(f"{y:.4f}")
            self.z_var.set(f"{z:.4f}")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numeric values for Lat, Lon, and Alt.")

    def convert_ecef_to_lla(self):
        try:
            x = float(self.x_var.get())
            y = float(self.y_var.get())
            z = float(self.z_var.get())

            lat, lon, alt = lla_to_ecef.ecef_to_lla(x, y, z)
            
            self.update_country(lat, lon)

            self.lat_var.set(f"{lat:.8f}")
            self.lon_var.set(f"{lon:.8f}")
            self.alt_var.set(f"{alt:.4f}")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numeric values for X, Y, and Z.")

    def clear_fields(self):
        self.lat_var.set("")
        self.lon_var.set("")
        self.alt_var.set("")
        self.country_var.set("---")
        self.x_var.set("")
        self.y_var.set("")
        self.z_var.set("")

if __name__ == "__main__":
    root = tk.Tk()
    app = ConverterApp(root)
    root.mainloop()
