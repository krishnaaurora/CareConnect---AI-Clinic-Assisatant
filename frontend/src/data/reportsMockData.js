/**
 * CareConnect AI - Reports & Follow-ups Mock Data (Phase 1)
 * 
 * Fictional sample records covering different clinical workflow states.
 * No real patient information is used.
 */

export const INITIAL_PATIENTS = [
  { id: 'PID-1042', name: 'Ananya Reddy', phone: '+91 99001 77889', age: 29, gender: 'Female' },
  { id: 'PID-1043', name: 'Anita Deshmukh', phone: '+91 98201 54321', age: 48, gender: 'Female' },
  { id: 'PID-1044', name: 'Vikram Malhotra', phone: '+91 98450 11223', age: 34, gender: 'Male' },
  { id: 'PID-1045', name: 'Meera Krishnan', phone: '+91 94480 55667', age: 52, gender: 'Female' },
  { id: 'PID-1046', name: 'Deepak Choudhury', phone: '+91 98451 90876', age: 41, gender: 'Male' },
  { id: 'PID-1047', name: 'Karan Johar', phone: '+91 98860 33445', age: 38, gender: 'Male' },
  { id: 'PID-1048', name: 'Sunita Rao', phone: '+91 97312 99887', age: 61, gender: 'Female' },
  { id: 'PID-1049', name: 'Rohan Deshpande', phone: '+91 97410 44556', age: 27, gender: 'Male' },
  { id: 'PID-1050', name: 'Suresh Patil', phone: '+91 98800 12345', age: 55, gender: 'Male' },
];

export const INITIAL_REPORTS = [
  {
    id: 'RPT-1001',
    patient_id: 'PID-1042',
    patient_name: 'Ananya Reddy',
    patient_phone: '+91 99001 77889',
    report_type: 'Blood Test',
    title: 'Complete Blood Count (CBC) & Lipid Panel',
    file_name: 'CBC_Lipid_Panel_Ananya_Reddy.pdf',
    file_size: '1.4 MB',
    uploaded_date: '2026-10-29',
    uploaded_time: '09:15 AM',
    uploaded_by: 'Kavita Nair (Receptionist)',
    verification_status: 'Awaiting Verification',
    notification_status: 'Not Started',
    notes: 'Routine fasting sample collected at Indiranagar diagnostic wing. Requires physician sign-off.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-29 09:15 AM', actor: 'Kavita Nair', done: true },
      { step: 'Physician Verification', timestamp: 'Pending', actor: 'Dr. Rajesh Sharma', done: false },
      { step: 'Ready to Notify', timestamp: 'Pending', actor: 'Clinical Team', done: false },
      { step: 'Patient Notification', timestamp: 'Scheduled Phase 4', actor: 'Priya AI Voice', done: false },
    ]
  },
  {
    id: 'RPT-1002',
    patient_id: 'PID-1043',
    patient_name: 'Anita Deshmukh',
    patient_phone: '+91 98201 54321',
    report_type: 'Diagnostic Report',
    title: '12-Lead Electrocardiogram (ECG) Report',
    file_name: 'ECG_Analysis_Anita_Deshmukh.pdf',
    file_size: '2.1 MB',
    uploaded_date: '2026-10-29',
    uploaded_time: '10:05 AM',
    uploaded_by: 'Admin',
    verification_status: 'Ready to Notify',
    notification_status: 'Pending',
    notes: 'Normal sinus rhythm confirmed by Dr. Sharma. Front office cleared for patient notification.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-29 10:05 AM', actor: 'Admin', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-29 10:30 AM', actor: 'Dr. Rajesh Sharma', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-29 10:35 AM', actor: 'Kavita Nair', done: true },
      { step: 'Patient Notification', timestamp: 'Queued', actor: 'Priya AI Voice', done: false },
    ]
  },
  {
    id: 'RPT-1003',
    patient_id: 'PID-1044',
    patient_name: 'Vikram Malhotra',
    patient_phone: '+91 98450 11223',
    report_type: 'Urine Test',
    title: 'Urine Routine & Microscopic Examination',
    file_name: 'Urine_Micro_Vikram_M.pdf',
    file_size: '890 KB',
    uploaded_date: '2026-10-28',
    uploaded_time: '04:20 PM',
    uploaded_by: 'Sunil Kumar (Front Desk)',
    verification_status: 'Verified',
    notification_status: 'Patient Notified',
    notes: 'No abnormal sediments detected. Notified patient via SMS link and verified receipt.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-28 04:20 PM', actor: 'Sunil Kumar', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-28 05:00 PM', actor: 'Dr. Sneha Kulkarni', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-28 05:10 PM', actor: 'Desk Staff', done: true },
      { step: 'Patient Notified', timestamp: '2026-10-28 05:25 PM', actor: 'CareConnect Notification Service', done: true },
    ]
  },
  {
    id: 'RPT-1004',
    patient_id: 'PID-1045',
    patient_name: 'Meera Krishnan',
    patient_phone: '+91 94480 55667',
    report_type: 'Blood Test',
    title: 'Glycated Hemoglobin (HbA1c) & Fasting Glucose',
    file_name: 'HbA1c_Meera_Krishnan.pdf',
    file_size: '1.2 MB',
    uploaded_date: '2026-10-28',
    uploaded_time: '02:45 PM',
    uploaded_by: 'Kavita Nair (Receptionist)',
    verification_status: 'Ready to Notify',
    notification_status: 'Call Queued',
    notes: 'HbA1c value 6.8%. Routine quarterly diabetic monitoring. Auto voice notification queued.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-28 02:45 PM', actor: 'Kavita Nair', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-28 03:30 PM', actor: 'Dr. Rajesh Sharma', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-28 03:45 PM', actor: 'Admin Desk', done: true },
      { step: 'Patient Notification', timestamp: 'In Queue', actor: 'Priya AI Voice', done: false },
    ]
  },
  {
    id: 'RPT-1005',
    patient_id: 'PID-1046',
    patient_name: 'Deepak Choudhury',
    patient_phone: '+91 98451 90876',
    report_type: 'Imaging',
    title: 'Digital Chest X-Ray (PA View)',
    file_name: 'Chest_XRay_PA_Deepak_C.pdf',
    file_size: '4.8 MB',
    uploaded_date: '2026-10-27',
    uploaded_time: '11:15 AM',
    uploaded_by: 'Admin',
    verification_status: 'Ready to Notify',
    notification_status: 'No Answer',
    notes: 'Clear lung fields. Tried dialing patient twice at 11:30 AM and 03:15 PM; call went unanswered.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-27 11:15 AM', actor: 'Admin', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-27 11:45 AM', actor: 'Dr. Rajesh Sharma', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-27 12:00 PM', actor: 'Admin Desk', done: true },
      { step: 'Patient Notification', timestamp: 'No Answer (2 attempts)', actor: 'Telephony Bridge', done: false },
    ]
  },
  {
    id: 'RPT-1006',
    patient_id: 'PID-1047',
    patient_name: 'Karan Johar',
    patient_phone: '+91 98860 33445',
    report_type: 'Blood Test',
    title: 'Thyroid Function Test (T3, T4, TSH Ultra)',
    file_name: 'Thyroid_Profile_Karan_Johar.pdf',
    file_size: '1.1 MB',
    uploaded_date: '2026-10-27',
    uploaded_time: '09:30 AM',
    uploaded_by: 'Sunil Kumar (Front Desk)',
    verification_status: 'Ready to Notify',
    notification_status: 'Call Failed',
    notes: 'Number temporarily unreachable. Marked for front-desk follow-up and alternate WhatsApp notification.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-27 09:30 AM', actor: 'Sunil Kumar', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-27 10:15 AM', actor: 'Dr. Rajesh Sharma', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-27 10:30 AM', actor: 'Admin Desk', done: true },
      { step: 'Patient Notification', timestamp: 'Failed - Unreachable', actor: 'Telephony Bridge', done: false },
    ]
  },
  {
    id: 'RPT-1007',
    patient_id: 'PID-1048',
    patient_name: 'Sunita Rao',
    patient_phone: '+91 97312 99887',
    report_type: 'Imaging',
    title: 'Knee Joint Digital Radiography (AP & Lateral View)',
    file_name: 'Knee_XRay_Sunita_Rao.pdf',
    file_size: '5.2 MB',
    uploaded_date: '2026-10-26',
    uploaded_time: '03:50 PM',
    uploaded_by: 'Admin',
    verification_status: 'Verified',
    notification_status: 'Follow-up Required',
    notes: 'Post-operative evaluation reviewed by Dr. Venkat Rao. Patient requested in-depth telephonic consultation callback.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-26 03:50 PM', actor: 'Admin', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-26 04:30 PM', actor: 'Dr. Venkat Rao', done: true },
      { step: 'Ready to Notify', timestamp: '2026-10-26 04:45 PM', actor: 'Kavita Nair', done: true },
      { step: 'Follow-up Created', timestamp: '2026-10-26 05:15 PM', actor: 'Front Office Coordinator', done: true },
    ]
  },
  {
    id: 'RPT-1008',
    patient_id: 'PID-1049',
    patient_name: 'Rohan Deshpande',
    patient_phone: '+91 97410 44556',
    report_type: 'Blood Test',
    title: 'Vitamin D3 & Vitamin B12 Immunoassay',
    file_name: 'Vitamins_D3_B12_Rohan_D.pdf',
    file_size: '1.3 MB',
    uploaded_date: '2026-10-26',
    uploaded_time: '01:10 PM',
    uploaded_by: 'Kavita Nair (Receptionist)',
    verification_status: 'Rejected',
    notification_status: 'Not Started',
    notes: 'Sample hemolyzed during centrifugation. Physician requested repeat venous blood sample collection.',
    timeline: [
      { step: 'Report Uploaded', timestamp: '2026-10-26 01:10 PM', actor: 'Kavita Nair', done: true },
      { step: 'Physician Verification', timestamp: '2026-10-26 02:00 PM', actor: 'Dr. Rajesh Sharma (Rejected)', done: true },
      { step: 'Redraw Requested', timestamp: '2026-10-26 02:15 PM', actor: 'Laboratory Coordinator', done: true },
    ]
  }
];

export const INITIAL_FOLLOWUPS = [
  {
    id: 'FLP-201',
    patient_reference: 'PID-1046',
    patient_name: 'Deepak Choudhury',
    patient_phone: '+91 98451 90876',
    report_id: 'RPT-1005',
    report_title: 'Digital Chest X-Ray (PA View)',
    reason: 'Patient did not answer',
    last_attempt: 'Yesterday, 03:15 PM',
    assigned_staff: 'Kavita Nair',
    due_date: '2026-10-30',
    status: 'Pending',
    priority: 'Medium',
    notes: 'Attempted voice call twice without answer. Alternate phone number inquiry required from registration card.'
  },
  {
    id: 'FLP-202',
    patient_reference: 'PID-1048',
    patient_name: 'Sunita Rao',
    patient_phone: '+91 97312 99887',
    report_id: 'RPT-1007',
    report_title: 'Knee Joint Digital Radiography (AP & Lateral View)',
    reason: 'Patient requested assistance',
    last_attempt: 'Today, 10:45 AM',
    assigned_staff: 'Dr. Venkat Rao (Care Coordinator)',
    due_date: '2026-10-29',
    status: 'In Progress',
    priority: 'High',
    notes: 'Patient inquired whether post-surgery swelling is normal; scheduled 10-minute follow-up phone call.'
  },
  {
    id: 'FLP-203',
    patient_reference: 'PID-1047',
    patient_name: 'Karan Johar',
    patient_phone: '+91 98860 33445',
    report_id: 'RPT-1006',
    report_title: 'Thyroid Function Test (T3, T4, TSH Ultra)',
    reason: 'Notification failed',
    last_attempt: '27 Oct 2026, 10:30 AM',
    assigned_staff: 'Sunil Kumar',
    due_date: '2026-10-30',
    status: 'Pending',
    priority: 'Medium',
    notes: 'Carrier returned unreachable status. Send encrypted PDF report link via WhatsApp business API.'
  },
  {
    id: 'FLP-204',
    patient_reference: 'PID-1049',
    patient_name: 'Rohan Deshpande',
    patient_phone: '+91 97410 44556',
    report_id: 'RPT-1008',
    report_title: 'Vitamin D3 & Vitamin B12 Immunoassay',
    reason: 'Reception callback required',
    last_attempt: '26 Oct 2026, 03:00 PM',
    assigned_staff: 'Vikram Sethi',
    due_date: '2026-10-28',
    status: 'Resolved',
    priority: 'Low',
    notes: 'Patient visited clinic for repeat venous blood redraw; specimen re-routed to diagnostics laboratory.'
  }
];

export const REPORT_TYPES = [
  'Blood Test',
  'Urine Test',
  'Imaging',
  'Diagnostic Report',
  'Other'
];

export const VERIFICATION_STATUSES = [
  'Awaiting Verification',
  'Verified',
  'Rejected',
  'Ready to Notify'
];

export const NOTIFICATION_STATUSES = [
  'Not Started',
  'Pending',
  'Call Queued',
  'Patient Notified',
  'No Answer',
  'Call Failed',
  'Follow-up Required'
];
