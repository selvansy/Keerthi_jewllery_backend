import { isValidObjectId } from "mongoose";

class OrderVendorUsecase {
    constructor(vendorRepo){
        this.vendorRepo = vendorRepo;
    }
}

export default OrderVendorUsecase;