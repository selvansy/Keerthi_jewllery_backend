class TicketRaiseController {
  constructor(ticketRaiseUsecase, validator) {
    this.ticketRaiseUsecase = ticketRaiseUsecase;
    this.validator = validator;
  }

  async addTicket(req, res) {
    try {
      const { error } = this.validator.ticketValidations.validate(req.body);
      if (error) {
        return res.status(400).json(error.details[0].message);
      }
      const ticket_img = req.files?.ticket_img ?? null;
      req.body.id_employee = req.user.id_employee;
      req.body.id_branch = req.user.id_branch;
      const result = await this.ticketRaiseUsecase.addTicket(
        req.body,
        ticket_img
      );
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getTicket(req, res) {
    try {
      const branch = req.user.branch;
      const employeeId = req.user.id_employee;
      const getAllTickets = await this.ticketRaiseUsecase.getTicket(
        req.body,
        branch,
        employeeId
      );
      if (getAllTickets.success) {
        return res.status(200).json({
          message: getAllTickets.message,
          data: getAllTickets.data.tickets,
          totalDocuments: getAllTickets.data.totalTickets,
          totalPages: getAllTickets.data.totalPages,
          currentPage: getAllTickets.data.currentPage,
        });
      }
      return res.status(400).json({ message: getAllTickets.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default TicketRaiseController;
