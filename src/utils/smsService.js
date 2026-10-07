// Production SMS / OTP Gateway Service

const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY || '';
const SMS_PROVIDER = import.meta.env.VITE_SMS_PROVIDER || 'demo'; // 'fast2sms' | 'msg91' | 'twilio' | 'demo'
const SMS_SENDER_ID = import.meta.env.VITE_SMS_SENDER_ID || 'SPNFLW';

export const isLiveSmsConfigured = Boolean(SMS_API_KEY && SMS_API_KEY.length > 5);

export const smsService = {
  // Send 4-digit verification OTP to the target phone number
  async sendOtp(phone, otpCode) {
    const cleanPhone = String(phone).replace(/\D/g, '');

    // If real SMS gateway is configured in environment variables:
    if (isLiveSmsConfigured && SMS_PROVIDER === 'fast2sms') {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otpCode,
            numbers: cleanPhone.slice(-10),
          }),
        });
        const result = await response.json();
        return {
          success: result.return === true,
          message: result.message || 'OTP sent successfully via SMS.',
          provider: 'Fast2SMS',
          simulated: false,
        };
      } catch (err) {
        console.warn('Fast2SMS gateway error:', err);
      }
    }

    // Generic Custom Webhook SMS Gateway (e.g. your backend server endpoint)
    if (isLiveSmsConfigured && import.meta.env.VITE_SMS_WEBHOOK_URL) {
      try {
        const response = await fetch(import.meta.env.VITE_SMS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SMS_API_KEY}`,
          },
          body: JSON.stringify({
            phone: cleanPhone,
            otp: otpCode,
            message: `Your SpinFlow Admin Security OTP is ${otpCode}. Valid for 5 minutes.`,
          }),
        });
        return {
          success: response.ok,
          message: 'OTP sent via SMS Gateway.',
          simulated: false,
        };
      } catch (err) {
        console.warn('SMS Webhook error:', err);
      }
    }

    // Default In-App Secure Display
    return {
      success: true,
      message: `OTP generated for +91 ${cleanPhone.slice(-10)}.`,
      simulated: true,
    };
  },
};
