class ConfigurationController {
    constructor(configurationUseCase) {
      this.configurationUseCase = configurationUseCase;
    }
  
    async configurationTable(req, res) {
      try {
        const { page = 1, limit = 10, project_type, search } = req.body;
  
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit); 
  
        if (isNaN(pageInt) || pageInt <= 0) {
          return res.status(400).json({ message: 'Invalid page number' });
        }
  
        if (isNaN(limitInt) || limitInt <= 0) {
          return res.status(400).json({ message: 'Invalid limit number' });
        }
  
        const result = await this.configurationUseCase.getConfigurations({
          pageInt,
          limitInt,
          project_type,
          search,
        });
  
        if(!result.success){
          return res.status(200).json({message:result.message,data:[]})
        }

        res.status(200).json({
          message: 'Configure retrieved successfully',
          data:result.data,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  
  export default ConfigurationController;
  