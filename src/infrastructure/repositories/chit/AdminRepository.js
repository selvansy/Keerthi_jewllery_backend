import adminModel from '../../models/chit/adminModel.js';
import {isValidObjectId} from 'mongoose' 

class AdminRepository { 
    async findByEmail(email) {
        const adminData = await adminModel.findOne({ email: email });
        if (!adminData) return null;

        return {
            _id:adminData._id,
            email: adminData.email,
            password: adminData.password,
            active: adminData.active,
            is_super: adminData.is_super,
        };
    }

    async addNewAdmin(data) {
        const savedAdmin = await adminModel.create(data);
        if (!savedAdmin) return null;

        return {
            username: savedAdmin.username
        };
    }

    async findById(id) {
        if (!isValidObjectId(id)) return null;

        const adminData = await adminModel.findById(id);
        if (!adminData) return null;

        return {
            email: adminData.email,
            username: adminData.username,
            active: adminData.active,
            is_admin: adminData.is_admin,
        };
    }

    async updateStatus(id,data) {
        const updatedData = await adminModel.findByIdAndUpdate(
             id,
            { active: !data.active },
            { new: true }
        );

        if (!updatedData) return null;
    
        return {
            active: updatedData.active,
            username: updatedData.username,
            is_admin: updatedData.is_admin,
        };
    }

    async deleteAdmin(id) {
        const updatedData = await adminModel.findByIdAndUpdate(
             id,
            { is_deleted:true },
            { new: true }
        );

        if (!updatedData) return null;
    
        return {
            is_deleted: updatedData.is_deleted,
        };
    }
}

export default AdminRepository;