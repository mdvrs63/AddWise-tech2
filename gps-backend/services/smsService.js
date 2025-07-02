import fetch from 'node-fetch';

// SMS configuration
const SMS_CONFIG = {
  secret: 'xledocqmXkNPrTesuqWr',
  sender: 'NIGHAI',
  tempid: '1207174264191607433',
  route: 'TA',
  msgtype: '1',
  baseUrl: 'http://43.252.88.250/index.php/smsapi/httpapi/'
};

export class SmsService {
  static buildSmsUrl(phoneNumber, message) {
    return `${SMS_CONFIG.baseUrl}?secret=${SMS_CONFIG.secret}&sender=${SMS_CONFIG.sender}&tempid=${SMS_CONFIG.tempid}&receiver=${phoneNumber}&route=${SMS_CONFIG.route}&msgtype=${SMS_CONFIG.msgtype}&sms=${encodeURIComponent(message)}`;
  }

  static async sendSms(phoneNumber, message) {
    try {
      console.log(`📱 Sending SMS to ${phoneNumber}`);
      console.log(`📱 Message: ${message}`);
      
      const smsUrl = this.buildSmsUrl(phoneNumber, message);
      console.log(`📱 SMS URL: ${smsUrl}`);
      
      // Make the SMS API call
      const response = await fetch(smsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js SMS Service'
        }
      });
      
      const responseText = await response.text();
      console.log(`📱 SMS API Response Status: ${response.status}`);
      console.log(`📱 SMS API Response Text: ${responseText}`);
      
      // Check if the response indicates success
      // Common success indicators in SMS APIs
      const successIndicators = ['success', 'sent', 'delivered', 'ok', 'accepted'];
      const isSuccess = response.ok && (
        successIndicators.some(indicator => 
          responseText.toLowerCase().includes(indicator.toLowerCase())
        ) || response.status === 200
      );
      
      console.log(`📱 SMS Success Check: ${isSuccess}`);
      
      if (isSuccess) {
        console.log(`✅ SMS sent successfully to ${phoneNumber}`);
        return {
          success: true,
          message: `SMS sent successfully to ${phoneNumber}`,
          apiResponse: responseText,
          status: response.status
        };
      } else {
        console.log(`❌ SMS failed for ${phoneNumber}`);
        return {
          success: false,
          error: `SMS API returned error: ${responseText}`,
          apiResponse: responseText,
          status: response.status
        };
      }
      
    } catch (error) {
      console.error('📱 SMS Service Error:', error);
      return {
        success: false,
        error: `Failed to send SMS: ${error.message}`,
        exception: error.name
      };
    }
  }

  static async sendOtpSms(phoneNumber, otp) {
    const message = `Your OTP for login is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return this.sendSms(phoneNumber, message);
  }

  static async sendCustomSms(phoneNumber, message) {
    return this.sendSms(phoneNumber, message);
  }
}

export default SmsService;