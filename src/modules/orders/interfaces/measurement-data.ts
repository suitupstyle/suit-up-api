export interface MeasurementData {
    id: number
    url: string
    gender: 'male' | 'female'
    height: number
    volume_params: VolumeParams
    front_params: FrontParams
    side_params: SideParams
}

export interface VolumeParams {
    chest: number
    waist: number
    low_hips: number
    high_hips: number
    bicep: number
    knee: number
    ankle: number
    wrist: number
    calf: number
    thigh: number
    mid_thigh_girth: number
    neck: number
    forearm: number
    neck_girth: number
    neck_girth_relaxed: number
    under_bust_girth: number
    upper_chest_girth: number
    elbow_girth: number
    abdomen: number
    armscye_girth: number
}

export interface FrontParams {
    soft_validation: SoftValidation
    body_height: number
    outseam: number
    outseam_from_upper_hip_level: number
    inseam: number
    inside_crotch_length_to_mid_thigh: number
    inside_crotch_length_to_knee: number
    inside_crotch_length_to_calf: number
    crotch_length: number
    sleeve_length: number
    underarm_length: number
    legs_distance: number
    high_hips: number
    hip_height: number
    shoulders: number
    chest_top: number
    jacket_length: number
    shoulder_length: number
    neck: number
    waist: number
    waist_to_low_hips: number
    waist_to_knees: number
    nape_to_waist_centre_back: number
    bust_height: number
    shoulder_slope: number
    shoulder_to_waist: number
    side_neck_point_to_armpit: number
    back_neck_height: number
    back_neck_point_to_wrist_length: number
    upper_hip_height: number
    waist_height: number
    across_back_width: number
    outer_ankle_height: number
    knee_height: number
    across_back_shoulder_width: number
    total_crotch_length: number
    inside_leg_height: number
    neck_length: number
    upper_arm_length: number
    lower_arm_length: number
    upper_hip_to_hip_length: number
    back_shoulder_width: number
    rise: number
    back_neck_to_hip_length: number
    torso_height: number
    front_crotch_length: number
    back_crotch_length: number
}

export interface SideParams {
    soft_validation: SoftValidation
    neck_to_chest: number
    chest_to_waist: number
    waist_to_ankle: number
    shoulders_to_knees: number
    side_upper_hip_level_to_knee: number
    side_neck_point_to_upper_hip: number
}

export interface SoftValidation {
    messages: string
}
