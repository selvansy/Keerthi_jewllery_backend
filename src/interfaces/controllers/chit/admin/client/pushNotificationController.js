class PushNotificationController {
    constructor(pushnotificationUseCase) {
        this.pushnotificationUseCase = pushnotificationUseCase;
    }

    async addPushNotification(req, res) {
        try {
            if(!req.body.id_branch){
                return res.status(400).json({message:"Provide branch id"})
            }

            if(!req.files.noti_image){
                return res.status(400).json({message:"Notificaiton image required"})
            }

            const data = {...req.body};
            const files = req.files;
            const result = await this.pushnotificationUseCase.addPushNotification(data, files);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            res.status(201).json({ success: true, message:result.message, data: result.data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async pushnotificationTable(req, res) {
        try {
            const { page = 1, limit = 10} = req.body;

            if (!page || isNaN(page) || parseInt(page) <= 0) {
                return res.status(400).json({ message: "Invalid page number" });
              }
              if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
                return res.status(400).json({ message: "Invalid limit number" });
              }

            const result = await this.pushnotificationUseCase.pushnotificationTable(req.body);

            if(!result.success){
                return res.status(200).json({success:false,message:result.message,data:[]})
            }

            res.status(200).json({ success: true,
                message:result.message,
                data: result.data, 
                totalDocument: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage, });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPushNotoficationById(req, res) {
        try {
            const { id } = req.params;

            const result = await this.pushnotificationUseCase.getPushNotificationById(id);

            if (!result.success) {
                return res.status(404).json({ success: false, message:result.message });
            }
            res.status(200).json({ success: true,message:result.message, data: result.data });
        } catch (error) {
            console.error(error)
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWeddingBirthday(req, res) {
        const { type } = req.params;
        try {
            if(!type){
                return res.status(400).json({message:"Setting type is required"})
            }
            const result = await this.pushnotificationUseCase.getWeddingBirthday(type);

            if (!result) {
                return res.status(404).json({ success: false, message:result.message });
            }
            res.status(200).json({ success: true,message:result.message, data: result.data });
        } catch (error) {
            console.error(error)
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deletepushnotification(req, res) {
        try {
            const { id } = req.params;

            if(!id){
                return res.status(400).json({message:"No id provided"})
            }

            const result = await this.pushnotificationUseCase.deletePushNotification(id);

            if (!result.success) {
                return res.status(404).json({ success: false, message:result.message});
            }
            res.status(200).json({ success: true, message:result.message });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default PushNotificationController;