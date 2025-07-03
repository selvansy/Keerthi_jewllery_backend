import jwt from 'jsonwebtoken';
import config from '../config/chit/env.js';

class TokenService {
  constructor() {
    this.secret = config.JWT_SECRET;
    this.expireTime = config.JWT_EXPIRE;
  }

  generateToken(payload,expireTime = this.expireTime) {
    return jwt.sign(payload, this.secret, {
      expiresIn: expireTime,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default TokenService;