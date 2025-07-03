class OrderVendorController{
    constructor(vendroUsecase){
        this.vendroUsecase = vendroUsecase;
    }

    async addVendor(req,res){
        try {
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }
}

export default OrderVendorController;