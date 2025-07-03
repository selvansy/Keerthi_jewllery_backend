import bcrypt from 'bcrypt';

class HashingService {
    async hashPassword(password){
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password, hashedPassword)  {
        return await bcrypt.compare(password, hashedPassword);
    }
}

export default HashingService;