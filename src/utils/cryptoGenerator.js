import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export function generateReferralCode(mobileNumber) {
    const min = 10000000;
    const max = 99999999;

    const randomBytes = crypto.randomBytes(32).toString('hex'); 
    const salt = crypto.randomBytes(16).toString('hex');       
    const uuid = uuidv4().replace(/-/g, '');                    

    const hash = crypto
        .createHash('sha512')  
        .update(`${randomBytes}${salt}${uuid}${mobileNumber}${Date.now()}`)
        .digest('hex');

 
    const numericPart = parseInt(hash.substring(0, 12), 16); 

    return min + (numericPart % (max - min + 1));
}