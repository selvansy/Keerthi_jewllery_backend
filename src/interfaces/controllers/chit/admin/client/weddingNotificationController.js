class WeddingBirthDayController {
  constructor(weddingUsecse, s3Repo, s3Service) {
    this.weddingUsecse = weddingUsecse;
    this.s3Repo = s3Repo;
    this.s3Service = s3Service;
  }

  async addWeddingBirthday(req, res) {
    try {
      const { title, description, id_branch } = req.body;

      if (!id_branch) {
        return res
          .status(400)
          .json({ success: false, message: "Branch ID is required." });
      }

      if (!title || title.trim().length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Title is required and cannot be empty.",
          });
      }

      if (!description || description.trim().length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Description is required and cannot be empty.",
          });
      }

      if (!req.files || !req.files.image) {
        return res
          .status(400)
          .json({ success: false, message: "Notification image is required." });
      }

      const data = { title, description, id_branch };
      const files = req.files;

      const result = await this.weddingUsecse.addWeddingBirthday(data, files);

      if (!result.success) {
        return res
          .status(400)
          .json({ success: false, message: result.message });
      }

      res
        .status(201)
        .json({ success: true, message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async findById(req, res) {
    const { id } = req.params;
    try {
      const result = await this.weddingUsecse.findById(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res
        .status(201)
        .json({ success: true, message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async dataTable(req, res) {
    try {
      const result = await this.weddingUsecse.dataTable();

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res
        .status(200)
        .json({ success: true, message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default WeddingBirthDayController;