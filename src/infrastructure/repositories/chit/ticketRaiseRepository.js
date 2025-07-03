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
        console.log("filter",filter)
        return await TicketRaiseModel.aggregate([
            { $match: filter }, // Apply filters
            { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
            { $skip: skip }, // Apply pagination
            { $limit: limit }, // Limit results
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
                            "aupay/webadmin/assets/Ticket_Raise"
                        ]
                    }
                }
            },
            { $project: { s3Details: 0 } } // Remove s3Details field
        ]).exec();
    } catch (err) {
        console.log(err);
        throw new Error("Database error occurred while getting tickets");
    }
}


  async countTickets(filter) {
    return await TicketRaiseModel.countDocuments(filter);
  }
}

export default TicketRaiseRepository;
