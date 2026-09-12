export type TabName = 
  | 'BMS - Voltages' 
  | 'BMS - Thermals & PDU' 
  | 'Inverter - Powertrain' 
  | 'Inverter - Vectors & Internal' 
  | 'Inverter - States & Relays'
  | 'Driver Inputs' 
  | 'Dynamics - IMU' 
  | 'Dynamics - Chassis' 
  | 'Diagnostics' 
  | 'GPS & Navigation';

export type DisplayType = 'multi-line' | 'line-chart' | 'status-badge' | 'destructive-badge' | 'toggle-pill' | 'metric-card';

export interface SignalDef {
  tab: TabName;
  type: DisplayType;
  chartGroup?: string; 
  unit?: string;
}

const errorRegisters: Record<string, SignalDef> = {};
for (let i = 0; i <= 63; i++) {
  errorRegisters[`error${i}`] = { tab: 'Diagnostics', type: 'destructive-badge' };
}

export const SIGNAL_MAP: Record<string, SignalDef> = {
  ...errorRegisters,

  // --- BMS: VOLTAGES ---
  "total_pack_voltage": { tab: "BMS - Voltages", type: "line-chart", unit: "V" },
  "max_cell_voltage": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Cell Voltages", unit: "V" },
  "min_cell_voltage": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Cell Voltages", unit: "V" },
  "voltage": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Aux Voltages", unit: "V" },
  "voltage1": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Aux Voltages", unit: "V" },
  "voltage2": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Aux Voltages", unit: "V" },
  "voltage3": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "Aux Voltages", unit: "V" },
  "lv_12v_voltage": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "LV System", unit: "V" },
  "lv_24v_voltage": { tab: "BMS - Voltages", type: "multi-line", chartGroup: "LV System", unit: "V" },

  // --- BMS: THERMALS & PDU ---
  "current": { tab: "BMS - Thermals & PDU", type: "line-chart", unit: "A" },
  "lv_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "LV Currents", unit: "A" },
  "average_pack_temperature": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "Pack Temperatures", unit: "°C" },
  "max_cell_temperature": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "Pack Temperatures", unit: "°C" },
  "min_cell_temperature": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "Pack Temperatures", unit: "°C" },
  "af1_af2_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "bm_l_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "cp_rf_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "lt_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "sh_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "sm_current": { tab: "BMS - Thermals & PDU", type: "multi-line", chartGroup: "PDU Currents", unit: "A" },
  "bms_state": { tab: "BMS - Thermals & PDU", type: "status-badge" },

  // --- INVERTER: POWERTRAIN ---
  "INV_DC_Bus_Voltage": { tab: "Inverter - Powertrain", type: "line-chart", unit: "V" },
  "INV_Output_Voltage": { tab: "Inverter - Powertrain", type: "line-chart", unit: "V" },
  "INV_Motor_Speed": { tab: "Inverter - Powertrain", type: "line-chart", unit: "RPM" },
  "INV_Commanded_Torque": { tab: "Inverter - Powertrain", type: "multi-line", chartGroup: "Motor Torque", unit: "Nm" },
  "INV_Torque_Feedback": { tab: "Inverter - Powertrain", type: "multi-line", chartGroup: "Motor Torque", unit: "Nm" },

  // --- INVERTER: VECTORS & INTERNAL ---
  "INV_Id": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Inverter Vectors", unit: "A" },
  "INV_Iq": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Inverter Vectors", unit: "A" },
  "INV_VAB_Vd_Voltage": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Inverter Voltages", unit: "V" },
  "INV_VBC_Vq_Voltage": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Inverter Voltages", unit: "V" },
  "INV_Flux_Command": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Motor Flux", unit: "Wb" },
  "INV_Flux_Feedback": { tab: "Inverter - Vectors & Internal", type: "multi-line", chartGroup: "Motor Flux", unit: "Wb" },
  "INV_Motor_Angle_Electrical": { tab: "Inverter - Vectors & Internal", type: "line-chart", unit: "Deg" },
  "INV_Electrical_Output_Frequency": { tab: "Inverter - Vectors & Internal", type: "line-chart", unit: "Hz" },
  "INV_PWM_Frequency": { tab: "Inverter - Vectors & Internal", type: "metric-card", unit: "Hz" },
  "INV_Delta_Resolver_Filtered": { tab: "Inverter - Vectors & Internal", type: "metric-card" },

  // --- INVERTER: STATES & RELAYS ---
  "INV_Inverter_Command_Mode": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Inverter_Discharge_State": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Inverter_Enable_Lockout": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Inverter_Enable_State": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Inverter_Run_Mode": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Inverter_State": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_VSM_State": { tab: "Inverter - States & Relays", type: "status-badge" },
  "INV_Relay_1_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },
  "INV_Relay_2_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },
  "INV_Relay_3_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },
  "INV_Relay_4_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },
  "INV_Relay_5_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },
  "INV_Relay_6_Status": { tab: "Inverter - States & Relays", type: "toggle-pill" },

  // --- DRIVER INPUTS ---
  "accel": { tab: "Driver Inputs", type: "line-chart", unit: "%" },
  "acc0": { tab: "Driver Inputs", type: "multi-line", chartGroup: "Accelerator Pots", unit: "Raw" },
  "acc1": { tab: "Driver Inputs", type: "multi-line", chartGroup: "Accelerator Pots", unit: "Raw" },
  "brake_position": { tab: "Driver Inputs", type: "line-chart", unit: "%" },
  "brake1_pct": { tab: "Driver Inputs", type: "multi-line", chartGroup: "Brake Pressures", unit: "%" },
  "brake2_pct": { tab: "Driver Inputs", type: "multi-line", chartGroup: "Brake Pressures", unit: "%" },
  "VCU_INV_Speed_Command": { tab: "Driver Inputs", type: "line-chart", unit: "RPM" },
  "VCU_INV_Torque_Command": { tab: "Driver Inputs", type: "line-chart", unit: "Nm" },
  "brake_pressed": { tab: "Driver Inputs", type: "toggle-pill" },
  "ready_to_drive": { tab: "Driver Inputs", type: "toggle-pill" },
  "switch1": { tab: "Driver Inputs", type: "toggle-pill" },
  "switch2": { tab: "Driver Inputs", type: "toggle-pill" },
  "button1": { tab: "Driver Inputs", type: "toggle-pill" },
  "button2": { tab: "Driver Inputs", type: "toggle-pill" },

  // --- DYNAMICS: IMU ---
  "acceleration_x": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "IMU Acceleration", unit: "G" },
  "acceleration_y": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "IMU Acceleration", unit: "G" },
  "acceleration_z": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "IMU Acceleration", unit: "G" },
  "lin_accel_x": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Linear Acceleration", unit: "m/s²" },
  "lin_accel_y": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Linear Acceleration", unit: "m/s²" },
  "lin_accel_z": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Linear Acceleration", unit: "m/s²" },
  "gyro_x": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Gyroscope", unit: "°/s" },
  "gyro_y": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Gyroscope", unit: "°/s" },
  "gyro_z": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Gyroscope", unit: "°/s" },
  "pitch": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Vehicle Orientation", unit: "°" },
  "roll": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Vehicle Orientation", unit: "°" },
  "yaw": { tab: "Dynamics - IMU", type: "multi-line", chartGroup: "Vehicle Orientation", unit: "°" },

  // --- DYNAMICS: CHASSIS ---
  "wss_left_rear": { tab: "Dynamics - Chassis", type: "multi-line", chartGroup: "Rear Wheel Speeds", unit: "RPM" },
  "wss_right_rear": { tab: "Dynamics - Chassis", type: "multi-line", chartGroup: "Rear Wheel Speeds", unit: "RPM" },
  "linear_potentiometer_1_rear": { tab: "Dynamics - Chassis", type: "multi-line", chartGroup: "Rear Suspension", unit: "mm" },
  "linear_potentiometer_2_rear": { tab: "Dynamics - Chassis", type: "multi-line", chartGroup: "Rear Suspension", unit: "mm" },
  "speed": { tab: "Dynamics - Chassis", type: "line-chart", unit: "km/h" },
  "wss_dir_flags": { tab: "Dynamics - Chassis", type: "status-badge" },

  // --- DIAGNOSTICS ---
  "accel_error": { tab: "Diagnostics", type: "destructive-badge" },
  "mag_error": { tab: "Diagnostics", type: "destructive-badge" },
  "io_expander_error": { tab: "Diagnostics", type: "destructive-badge" },
  "dash_state_stale": { tab: "Diagnostics", type: "destructive-badge" },
  "open_circuit": { tab: "Diagnostics", type: "destructive-badge" },
  "short_circuit": { tab: "Diagnostics", type: "destructive-badge" },
  "plausible": { tab: "Diagnostics", type: "status-badge" },
  "imu_temp": { tab: "Diagnostics", type: "metric-card", unit: "°C" },
  "tps_init_failed": { tab: "Diagnostics", type: "destructive-badge" },

  // --- GPS & NAVIGATION ---
  "altitude": { tab: "GPS & Navigation", type: "metric-card", unit: "m" },
  "course": { tab: "GPS & Navigation", type: "metric-card", unit: "°" },
  "fix_mode": { tab: "GPS & Navigation", type: "status-badge" },
  "has_fix": { tab: "GPS & Navigation", type: "toggle-pill" },
  "sats_in_use": { tab: "GPS & Navigation", type: "metric-card" }
};