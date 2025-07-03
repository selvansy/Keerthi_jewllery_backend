import axios from 'axios';

class SmsSender {
  async sendSms(url) {
    try {
      const response = await axios.get(url);
      if (response.status === 200 ) {  // response.data.includes('SENT') if need
        console.info('SMS sent successfully:', response.data);
        return { success: true, message: 'SMS sent successfully' };
      } else {
        console.error('SMS sending failed:', response.data);
        return { success: false, message: 'SMS sending failed', response: response.data };
      }
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      return { success: false, message: 'An error occurred while sending SMS', error: error.message };
    }
  }
}

export default SmsSender;