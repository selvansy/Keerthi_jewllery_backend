import mongoose, { isValidObjectId } from "mongoose";

class TicketRaiseUseCase {
  constructor(ticketRaiseRepository, s3Service, s3rRepo) {
    this.ticketRaiseRepository = ticketRaiseRepository;
    this.s3Service = s3Service;
    this.s3Respo = s3rRepo;
  }

  async s3Helper(id_branch) {
    try {
      const s3settings = await this.s3Respo.getSettingByBranch(id_branch);

      if (!s3settings) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings[0].s3key,
        s3secret: s3settings[0].s3secret,
        s3bucket_name: s3settings[0].s3bucket_name,
        s3display_url: s3settings[0].s3display_url,
        region: s3settings[0].region,
      };

      return configuration;
    } catch (error) {
      console.error(error);
    }
  }

  async addTicket(data, ticket_img) {
    try {
      const ticketNumber = `TKT-${new Date()
        .toLocaleString("en-GB")
        .replace(
          /(\d{2})\/(\d{2})\/20(\d{2}), (\d{2}):(\d{2}):(\d{2}).*/,
          "$2$1$3$4$5$6"
        )}${Math.floor(100 + Math.random() * 900)}`;

      data.id_ticketNo = ticketNumber;
      if (ticket_img) {
        const s3configs = await this.s3Helper(data.id_branch);
        const uploadPromises = ticket_img.map(async (image, index) => {
          if (!image.buffer || !image.mimetype || !image.originalname) {
            console.warn(`Skipping invalid image at index ${index}:`, image);
            return null;
          }

          return this.s3Service.uploadToS3(image, "Ticket_Raise", s3configs);
        });
        const uploadedImages = (await Promise.all(uploadPromises)).filter(
          Boolean
        );
        data.attachment = uploadedImages;
      }
      const createTicket = await this.ticketRaiseRepository.addTicket(data);

      if (createTicket) {
        return {
          success: true,
          message: "Ticket submitted successfully.",
          id_ticketNo: ticketNumber,
        };
      }

      return {
        success: false,
        message: "Failed to submit the ticket. Please try again.",
      };
    } catch (error) {
      console.error("Error in ticket raising:", error);

      return {
        success: false,
        message:
          error.message ||
          "An unexpected error occurred while submitting the ticket. Please try again later.",
      };
    }
  }

  async getTicket(query, branch, employeeId) {
    try {
      const { page, limit, from_date, to_date, id_branch, search } = query;
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter = {};

      if (branch !== "0" && isValidObjectId(branch)) {
        if (isValidObjectId(employeeId)) {
          filter.id_employee = new mongoose.Types.ObjectId(employeeId);
        }
      }

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }
        filter.createdAt = { $gte: startDate, $lte: endDate };
      }

      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ id_ticketNo: { $regex: searchRegex } }];
      }

      const tickets = await this.ticketRaiseRepository.getTickets(
        filter,
        skip,
        pageSize
      );

      if (tickets.length === 0) {
        return { success: false, message: "No tickets found" };
      }

      const totalTickets = await this.ticketRaiseRepository.countTickets(
        filter
      );

      return {
        success: true,
        message: "Tickets retrieved successfully",
        data: {
          tickets,
          totalTickets,
          totalPages: Math.ceil(totalTickets / pageSize),
          currentPage: pageNum,
        },
      };
    } catch (err) {
      console.error("Error in getTicket:", err);
      return {
        success: false,
        message: "An error occurred while retrieving tickets",
        error: err.message,
      };
    }
  }
}

export default TicketRaiseUseCase;
