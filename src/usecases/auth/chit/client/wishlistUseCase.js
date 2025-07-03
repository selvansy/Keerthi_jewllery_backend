class WishlistUsecase {
    constructor(wishlistRepo){
        this.wishlistRepo= wishlistRepo;
    }

    async toggleWishlistItem(data,token) {
        try {
            const exists = await this.wishlistRepo.findOne({itemId:data.itemId,id_customer:data.id_customer})

            if(exists){
              const result = await this.wishlistRepo.removedFromWishlist({itemId:data.itemId,id_customer:data.id_customer})

              if(!result){
                return {status:false,message:"Failed to remove item from wishlist",send:false}
              }

              return {status:true,message:"Item removed from wishlist",send:false}
            }

            data.createdDate= new Date()
            data.id_branch = token.id_branch
            const addResult = await this.wishlistRepo.addToWishlist(data)

            if(!addResult){
                return {status:false,message:"Failed to add to wishlist",send:false}
            }

            return {status:true,message:"Added to wishlist successfully.",send:true}
        } catch (error) {
            console.error(error);
            return {status:false,message:"Error while adding to wishlist"}
        }
    }

    async getWishlist(customerId) {
        try {
            const wishlistData = await this.wishlistRepo.getWishlist(customerId)

            if(!wishlistData){
                return {status:false,message:"No wishlist items"}
            }

            return {status:true,message:"wishlist data fetched successfully",data:wishlistData}
        } catch (error) {
            console.error(error);
            return {status:false,message:"Error while adding to wishlist"}
        }
    }
}

export default WishlistUsecase;