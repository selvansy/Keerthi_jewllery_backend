import { query } from 'express';
import giftVendorModel from '../../models/chit/giftVendorModel.js';
import mongoose from 'mongoose';
 
class giftVendorRepository { 

    async findById(id) {
        try {
            const vendorData = await giftVendorModel.findById(id)
                .select('vendor_name _id active address mobile gst')
                .populate({
                    path: 'id_branch',
                    select: ('branch_name _id')
                })
                .lean();

            if (!vendorData) {
                return null
            }

            return vendorData;
        } catch (error) {
            console.error(error);
            throw new Error('Database error')
        }
    }

    async checExists(id, mobile,gst) {
        try {
            const existingVendor = await giftVendorModel.findOne({
                _id: { $ne: id },
                is_deleted: false,
                $or: [{ mobile }, { gst }]
            });

            if (existingVendor) {
                return existingVendor;
            }

            return null;
        } catch (error) {
            console.error(error);
        }
    }

    async checkMobileGst(mobile, gst) {
        try {
            return await giftVendorModel.findOne({
                is_deleted: false,
                $or: [{ mobile }, { gst }]
            }) || null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error occurred while checking mobile and GST");
        }
    }

    async findOne(data) {
        try {
            // is_deleted
            let query = { is_deleted: false, ...data };

            const Data = await giftVendorModel.findOne(query);

            if (Data) {
                return Data;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error occured while finding vendor")
        }
    }

    async findByBranch(query) {
        try {
            const Data = await giftVendorModel.find(query)
                // .select('_id vendor_name active addresss')
                .populate({
                    path: 'id_branch',
                    select: ('branch_name mobile active')
                })
                .lean()

            if (Data) {
                return Data;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error occured while finding vendor")
        }
    }


    async getAllActiveVendors() {
        try {
            const vendorData = await giftVendorModel.find({ active: true });

            if (vendorData) {
                return vendorData;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error")
        }
    }

    async addGiftVendor(data) {
        try {
            const savedData = await giftVendorModel.create(data);

            if (!savedData) {
                return null;
            }

            return savedData;
        } catch (error) {
            console.error("Error in addGiftVendor:", error);
            throw new Error("Database error occurred while adding vendor");
        }
    }

    async editVendor(id, data) {
        try {
            const editedData = await giftVendorModel.findByIdAndUpdate(
                { _id: id },
                { $set: data },
                { new: true }
            )

            if (!editedData) {
                return null;
            }

            return editedData;
        } catch (error) {
            console.error("Error in editVendor:", error);
            throw new Error("Database error occurred while editing vendor");
        }
    }

    async deleteVendor(id) {
        try {
            const newData = await giftVendorModel.findByIdAndUpdate(
                { _id: id },
                { $set: { is_deleted: true, active: false } },
                { new: true }
            );

            if (newData) {
                return newData;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new R
        }
    }

    async changeVendorActiveState(id, active) {
        try {
            const newData = await giftVendorModel.findByIdAndUpdate(
                { _id: id },
                { $set: { active: !active } },
                { new: true }
            );

            if (newData) {
                return newData;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new R
        }
    }

    async allVendorsDataTable({ query, documentskip, documentlimit }) {
        try {
            const totalCount = await giftVendorModel.countDocuments(query);
            const data = await giftVendorModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                // .select('vendor_name _id active id_branch address gst')
                .populate({
                    path: 'id_branch',
                    select: ('branch_name active mobile')
                })
                .sort({ _id: -1 })

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error(error);
        }
    }
}

export default giftVendorRepository;