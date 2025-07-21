import axios from "axios";
import { addPromotion } from "./promotionService"; // Import your addPromotion function

/**
 * Send WhatsApp Message (Single or Bulk) & Store in addPromotion
 * @param {object} options - WhatsApp message options
 * @param {string} options.smsType - WhatsApp provider type ("kavitha", etc.)
 * @param {string} options.numbers - Multiline string of numbers (each number in a new line)
 * @param {string} options.message - Message type (e.g., "kavitha_aupaypayment")
 * @param {string} options.imageUrl - Optional image URL
 * @param {string} options.customerName - Customer name
 * @param {string} options.companyMobile - Company mobile number
 * @param {number} options.paymentId - Payment ID (for logging)
 * @param {number} options.customerId - Customer ID (for logging)
 * @returns {Promise<object[]>} - WhatsApp sending results
 */
export const sendWhatsApp = async ({
    smsType,
    numbers,
    message,
    imageUrl = "",
    customerName,
    companyMobile,
    paymentId,
    customerId,
}) => {
    try {
        // todo - get data from aupay configuration

        const providers = {
            kavitha: "http://whatsapp.atts.in/api/sendmsg.php?user=KAVITHAJWL&pass=kavithajwl@atts&sender=BUZWAP",
        };

        if (!providers[smsType]) {
            throw new Error(`Invalid WhatsApp provider: ${smsType}`);
        }

        // Convert multiline string into an array
        const numberList = numbers
            .split("\n")
            .map((num) => num.trim())
            .filter((num) => num);

        const results = [];

        for (const number of numberList) {
            const formattedCustomerName = encodeURIComponent(customerName);
            const whatsappUrl = `${providers[smsType]}&phone=${number}&text=${message}&priority=wa&stype=normal&Params=param1,param2&htype=image&url=${encodeURIComponent(imageUrl)}&params=${formattedCustomerName},KAVITHA%20JEWELLERS,${companyMobile}.%20Social%20App%20Link%20https://kavithajewellers.com/social.php`;

            let status = "failed";
            let responseData = null;
            let httpStatus = null;
            let errorMessage = null;

            try {
                const response = await axios.get(whatsappUrl);
                status = "success";
                responseData = response.data;
                httpStatus = response.status;

            } catch (error) {
                httpStatus = error.response ? error.response.status : null;
                errorMessage = error.message;

                console.error(`Error sending WhatsApp to ${number}:`, error.message);
            }

            // Store result
            const result = {
                number,
                status,
                http_status: httpStatus,
                server_response: responseData,
                error: errorMessage,
            };
            results.push(result);

            // Store in addPromotion
            await addPromotion({
                mobile: number,
                wayId: paymentId,
                customerId,
                type: "whatsapp",
                status,
                response: responseData,
                error: errorMessage,
            });

            // Optional delay to avoid rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return results;
    } catch (error) {
        console.error("Error in sendWhatsApp function:", error);
        throw error;
    }
};
