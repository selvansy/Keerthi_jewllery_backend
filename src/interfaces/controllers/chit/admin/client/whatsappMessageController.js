class WhatsappMessgeController{
    constructor(whatappMsgUseCase){
        this.whatappMsgUseCase= whatappMsgUseCase;
    }

    async sendWhatsappMessage(req,res){
        try {
            const {id,senttype,id_branch} = req.body;

            if(!id){
                return res.status(400).json({message:"Id is requried to add message"})
            }
            else if(!senttype){
                return res.status(400).json({message:"Sent type is requried"})
            }
            else if(!id_branch){
                return res.status(400).json({message:"Branch id is requried"})
            }

            const result = await this.whatappMsgUseCase.sendWhatsappMessage(req.body);

            if(!result.success){
                return res.status(400).json({status:false,message:result.message})
            }

            return res.status(201).json({message:result.message,status:true})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error",status:false})
        }
    }

    async deleteWhatsappMessage(req,res){
        const {id} = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"Provide whatsapp message id"})
            }

            const result = await this.whatappMsgUseCase.deleteWhatsappMessage(id);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }
            
            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }
}

export default WhatsappMessgeController;