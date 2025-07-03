class AdminUseCase { 
  constructor(adminRepository,hashingService,tokenService) {
    this.adminRepository = adminRepository;
    this.hashingService= hashingService;
    this.tokenService=tokenService;
  }

  async findAdmin(email, password) {
    const data = await this.adminRepository.findByEmail(email);

    if (!data) {
      return { success: false, message: 'Admin not found' };
    }

    const validPassword = await this.hashingService.comparePassword(password, data.password);
    if (!validPassword) {
      return { success: false, message: 'Invalid password or email' };
    }

    if (!data.active) {
      return { success: false, message: 'Admin is deactivated' };
    }

    const payload = {
      is_super: data.is_super,
      id_admin:data._id
    };
    const token = this.tokenService.generateToken(payload);

    return { success: true, message: 'Login successful', token };
  }

  async addAdmin(data) {
    const result = await this.adminRepository.findByEmail(data.email);

    if (result !== null) {
      return { success: false, message: 'Email already exists' };
    }

    const hashedPassword = await this.hashingService.hashPassword(data.password, 12);
    data.password = hashedPassword;

    const newAdmin = await this.adminRepository.addNewAdmin(data);

    if (!newAdmin) {
      return { success: false, message: 'Failed to create admin' };
    }

    return { success: true, message: 'Admin created successfully' };
  }

  async changeActiveState(id) {
    const existingAdmin = await this.adminRepository.findById(id);

    if (!existingAdmin) {
      return { success: false, message: 'Admin not found' };
    }

    const updatedAdmin = await this.adminRepository.updateStatus(id,existingAdmin);

    if (!updatedAdmin) {
      return { success: false, message: 'Failed to update admin status' };
    }

    let message= updatedAdmin.active ? 'Activated admin successfully': 'Deactivated admin successfully'

    return { success: true, message: message, data: updatedAdmin };
  }

  async deleteAdmin(id) {
    const existingAdmin = await this.adminRepository.findById(id);

    if (!existingAdmin) {
      return { success: false, message: 'Admin not found' };
    }

    if(existingAdmin.id_deleted){
       return {success:false,message:'Already deleted'}
    }

    const updatedAdmin = await this.adminRepository.deleteAdmin(id);

    if (!updatedAdmin) {
      return { success: false, message: 'Failed to delete' };
    }

    let message= 'Admin deleted successfully'

    return { success: true, message: message, data: updatedAdmin };
  }
}

export default AdminUseCase;