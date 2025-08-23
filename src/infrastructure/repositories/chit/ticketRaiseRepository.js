import TicketRaiseModel from "../../models/chit/ticketRaiseModel.js";

class TicketRaiseRepository {
  async findByTicketNumber(ticketNo) {
    try {
      return TicketRaiseModel.find({ id_ticketNo: ticketNo });
    } catch (err) {
      return null;
    }
  }

  async addTicket(data) {
    try {
      return TicketRaiseModel.create(data);
    } catch (error) {
      return null;
    }
  }

  async getTickets(filter, skip, limit) {
    try {
        return await TicketRaiseModel.aggregate([
            { $match: filter }, 
            { $sort: { createdAt: -1 } }, 
            { $skip: skip }, 
            { $limit: limit },
            {
                $lookup: {
                    from: "s3bucketsettings",
                    localField: "id_branch",
                    foreignField: "id_branch",
                    as: "s3Details",
                },
            },
            { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    pathUrl: {
                        $concat: [
                            { $ifNull: ["$s3Details.s3display_url", ""] },
                            "keerthijewellery/webadmin/assets/Ticket_Raise"
                        ]
                    }
                }
            },
            { $project: { s3Details: 0 } } // Remove s3Details field
        ]).exec();
    } catch (err) {
        console.error(err);
        throw new Error("Database error occurred while getting tickets");
    }
}


  async countTickets(filter) {
    return await TicketRaiseModel.countDocuments(filter);
  }
}

export default TicketRaiseRepository;
