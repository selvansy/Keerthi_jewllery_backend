class OfferController {
  constructor(offerUseCase, offerValidator) {
    this.offerUseCase = offerUseCase;
    this.offerValidator = offerValidator;
  }

  async addoffer(req, res) {
    try {
      const offerData = req.body;
      const createdBy = req.user.id_employee;
      // offerData.offer_image = req.files.offer_image;
      const { error } = await this.offerValidator.offerValidations.validate(
        offerData
      );

      if (error) {
        return res.status(400).json(error.details[0].message);
      }
      req.body.created_by=createdBy
      const createOffer = await this.offerUseCase.addOffer(
        req.body,
        req.files
      );

      if (createOffer.success) {
        return res.status(200).json({ message: createOffer.message });
      } else {
        return res.status(400).json({ message: createOffer.message });
      }
    } catch (err) {
      console.error(err);
      
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async editOffer(req, res) {
    try {
      const offerData = req.body;
      const offerId = req.params.id;
      const createdBy = req.user.id_employee;
     
      /// empty array using for avoid the validation error while type 0 1 2 but no image changes
      const { error } = await this.offerValidator.offerValidations.validate(
        offerData
      );

      if (error) {
        return res.status(400).json(error.details[0].message);
      }
      req.body.created_by=createdBy
      const editOffer = await this.offerUseCase.editOffer(
        req.body,
        offerId,
        req.files
      );
      if (editOffer.success) {
        return res.status(200).json({ message: editOffer.message });
      } else {
        return res.status(400).json({ message: editOffer.message });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteOffer(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "offer id is required" });
      }

      const deleteOffer = await this.offerUseCase.deleteOffer(id);
      if (deleteOffer.success) {
        return res.status(200).json({ message: deleteOffer.message });
      } else {
        return res.status(400).json({ message: deleteOffer.message });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Offer Id is required" });
      }

      const changeStatus = await this.offerUseCase.changeStatus(id);

      if (changeStatus.success) {
        return res.status(200).json({ message: changeStatus.message });
      } else {
        return res.status(400).json({ message: changeStatus.message });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOfferById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "offer id is required" });
      }

      const offerById = await this.offerUseCase.offerById(id);
      if (offerById.success) {
        return res
          .status(200)
          .json({ message: offerById.message, data: offerById.data });
      } else {
        return res.status(400).json({ message: offerById.message });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOfferByBranchId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Branch id is required" });
      }

      const branchOffers = await this.offerUseCase.getOfferByBranch(id);

      if (branchOffers.success) {
        return res
          .status(200)
          .json({ message: branchOffers.message, data: branchOffers.data });
      } else {
        return res.status(400).json({ message: branchOffers.message });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllOffers(req, res) {
    try {
      const allOffers = await this.offerUseCase.getAllOffers(req.body);
      
      if (!allOffers.success) {
        return res.status(400).json({ message: allOffers.message });
      }

      res.status(200).json({ message: allOffers.message, data: allOffers.data ,
        totalDocuments:allOffers.totalOffers,
        totalPages:allOffers.totalPages,
        currentPage:allOffers.currentPage
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default OfferController;
