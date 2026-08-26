import math

SPEED_OF_LIGHT = 299792458.0
BOLTZMANN_K = 1.380649e-23
EARTH_RADIUS_DEFAULT = 6378137.0
EARTH_MU = 3.986004418e14

def calculate_curved_earth_geometry(altitude, look_angle_rad, earth_radius=EARTH_RADIUS_DEFAULT):
    h = altitude
    R_E = earth_radius
    R_s = R_E + h
    theta_look = look_angle_rad

    sin_horizon = R_E / R_s
    horizon_look = math.asin(min(1.0, sin_horizon))
    eff_look = min(theta_look, horizon_look - 1e-6)

    sin_inc = (R_s / R_E) * math.sin(eff_look)
    sin_inc = min(1.0, max(0.0, sin_inc))
    theta_inc = math.asin(sin_inc)

    beta = theta_inc - eff_look
    cos_inc = math.cos(theta_inc)
    slant_range = math.sqrt(R_E**2 * cos_inc**2 + 2 * R_E * h + h**2) - R_E * cos_inc
    ground_range = R_E * beta

    flat_slant = h / math.cos(eff_look)
    flat_ground = h * math.tan(eff_look)

    return {
        "incidence_deg": math.degrees(theta_inc),
        "slant_range_km": slant_range / 1000.0,
        "ground_range_km": ground_range / 1000.0,
        "delta_km": (slant_range - flat_slant) / 1000.0
    }

def calculate_link_budget_point(p):
    c = SPEED_OF_LIGHT
    k_B = BOLTZMANN_K
    R_E = EARTH_RADIUS_DEFAULT
    h = p["altitude_m"]
    look_rad = math.radians(p["look_angle_deg"])
    freq = p["freq_hz"]
    lam = c / freq
    R_s = R_E + h

    # Geometry
    sin_inc = (R_s / R_E) * math.sin(look_rad)
    sin_inc = min(1.0, max(0.0, sin_inc))
    theta_inc = math.asin(sin_inc)
    cos_inc = math.cos(theta_inc)
    R = math.sqrt(R_E**2 * cos_inc**2 + 2 * R_E * h + h**2) - R_E * cos_inc

    # Velocity
    if p.get("is_spaceborne", True):
        v = math.sqrt(EARTH_MU / R_s)
    else:
        v = p.get("platform_velocity_mps", 50.0)

    # Antenna
    L_a = p["ant_length_az"]
    W_a = p["ant_width_el"]
    eta = p.get("aperture_eff", 0.65)
    A_eff = L_a * W_a * eta
    G = (4 * math.pi / (lam**2)) * A_eff
    G_dBi = 10 * math.log10(G)

    # Resolutions
    B_rf = p["chirp_bw_hz"]
    rho_sr = c / (2 * B_rf)
    rho_gr = rho_sr / max(0.02, math.sin(theta_inc))
    rho_az = p.get("processed_az_res", L_a / 2)

    # Power & Noise
    P_t = p["peak_power_w"]
    tau_p = p["pulse_duration_s"]
    prf = p["prf_hz"]
    duty = 1.0 if p.get("is_fmcw", False) else (tau_p * prf)
    P_avg = P_t * duty

    NF = 10**(p.get("noise_figure_db", 3.5) / 10.0)
    L_sys = 10**(p.get("system_losses_db", 3.0) / 10.0)
    L_atm = 10**(p.get("atm_loss_db", 0.5) / 10.0)
    L_tot = L_sys * L_atm
    N0 = k_B * 290.0 * NF

    # NESZ
    num = 256 * (math.pi**3) * (R**3) * v * math.sin(theta_inc) * N0 * L_tot
    den = P_avg * (G**2) * (lam**3) * rho_az * rho_sr
    nesz_lin = num / den
    nesz_db = 10 * math.log10(nesz_lin)

    # Integration time & Pulses
    T_a = (lam * R) / (2 * rho_az * v)
    n_pulses = int(prf * T_a)

    # Point SNR (1 m^2)
    single_noise = N0 * B_rf * L_tot
    rx_power = (P_t * (G**2) * (lam**2) * 1.0) / (((4 * math.pi)**3) * (R**4))
    snr_single = rx_power / single_noise
    snr_proc_gain = (tau_p * B_rf) * n_pulses if not p.get("is_fmcw") else (p["pulse_duration_s"] * B_rf * n_pulses)
    snr_integ_db = 10 * math.log10(snr_single * snr_proc_gain)

    return {
        "R_km": R / 1000.0,
        "theta_inc_deg": math.degrees(theta_inc),
        "G_dBi": G_dBi,
        "NESZ_dB": nesz_db,
        "Point_SNR_dB": snr_integ_db,
        "T_a_s": T_a,
        "n_pulses": n_pulses
    }

print("Testing Python SAR Calculations:")
s1 = {
    "altitude_m": 693000,
    "look_angle_deg": 32.5,
    "freq_hz": 5.405e9,
    "peak_power_w": 4000,
    "pulse_duration_s": 37e-6,
    "prf_hz": 1650,
    "chirp_bw_hz": 42.87e6,
    "ant_length_az": 12.3,
    "ant_width_el": 0.82,
    "aperture_eff": 0.70,
    "noise_figure_db": 3.2,
    "system_losses_db": 3.5,
    "atm_loss_db": 0.5,
    "processed_az_res": 5.0,
    "is_spaceborne": True,
    "is_fmcw": False
}
res_s1 = calculate_link_budget_point(s1)
print("Sentinel-1 Results:", res_s1)

uav = {
    "altitude_m": 200,
    "look_angle_deg": 45.0,
    "freq_hz": 15.0e9,
    "peak_power_w": 5.0,
    "pulse_duration_s": 0.001,
    "prf_hz": 1000,
    "chirp_bw_hz": 600e6,
    "ant_length_az": 0.20,
    "ant_width_el": 0.12,
    "aperture_eff": 0.60,
    "noise_figure_db": 4.5,
    "system_losses_db": 2.5,
    "atm_loss_db": 0.1,
    "platform_velocity_mps": 20.0,
    "processed_az_res": 0.15,
    "is_spaceborne": False,
    "is_fmcw": True
}
res_uav = calculate_link_budget_point(uav)
print("UAV FMCW Ku Results:", res_uav)
