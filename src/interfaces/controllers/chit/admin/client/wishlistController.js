class WishlistController{
    constructor(wishlistUsecase){
        this.wishlistUsecase = wishlistUsecase;
    }

    async toggleWishlistItem (req,res){
        try {
            const {id_customer,itemId} = req.body;

            if(!id_customer){
                return res.status(400).json({message:"Provide a customer id"})
            }else if(!itemId){
                return res.status(400).json({message:"Provide item id"})
            }

            const data= {...req.body}
            const result  = await this.wishlistUsecase.toggleWishlistItem(data,req.user)

            if(!result.status){
                return res.status(400).json({statue:result.send,message:result.message})
            }

            return res.status(201).json({state:result.send,message:result.message})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getWishlist (req,res){
        try {
            const {customer} = req.query;

            if(!customer){
                return res.status(400).json({message:"Provide a customer id"})
            }

            const result  = await this.wishlistUsecase.getWishlist(customer)

            if(!result.status){
                return res.status(400).json({statue:result.status,message:result.message})
            }

            return res.status(200).json({state:result.status,message:result.message,data:result.data})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }
}

export default WishlistController;