export const CONTACT_EMAIL = 'aamadaycare@gmail.com';
export const CONTACT_PHONE = '5107783220';

export const DEFAULT_INQUIRY_SUBJECT = 'Daycare Enrollment Inquiry';
export const DEFAULT_INQUIRY_BODY = `Hello,

I am interested in enrolling my child in your daycare and would like more information.

Child's Age: 
Desired Start Date: 
Full-Time or Part-Time: 
Days Needed: Monday to Friday

Please let me know if you have availability and provide information about tuition, your daily schedule, and the enrollment process.

Thank you! I look forward to hearing from you.`;

export const defaultInquiryMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DEFAULT_INQUIRY_SUBJECT)}&body=${encodeURIComponent(DEFAULT_INQUIRY_BODY)}`;
export const defaultInquirySms = `sms:${CONTACT_PHONE}?body=${encodeURIComponent(DEFAULT_INQUIRY_BODY)}`;
// Google Maps directions to Aama Day Care Center, 737 Birdwood Ct, San Ramon, CA 94582
export const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Aama+Day+Care+Center,+San+Ramon,+CA+94582';

// Always the live production URL — printed on a physical door sign, so it must never
// resolve to a dev/preview origin even if generated from one.
export const checkinDoorSignUrl = 'https://aamadaycare.com/checkin';
