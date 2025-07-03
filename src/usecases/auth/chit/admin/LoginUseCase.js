class LoginUseCase {
  constructor(userRepository,hashingService,tokenService,layoutRepository,userAccessRepo) {
    this.userRepository = userRepository;
    this.hashingService = hashingService;
    this.tokenService= tokenService;
    this.layoutRepository= layoutRepository;
    this.userAccessRepo=userAccessRepo;
  }

  async findByUsername(username, password) {
    const user = await this.userRepository.findByUser(username);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const validPassword = await this.hashingService.comparePassword(password, user.password);
    if (!validPassword) {
      return { success: false, message: 'Invalid password'};
    }

    if (user.active !== true) {
      return { success: false, message: 'User is deactivated'};
    }

    const menuData = await this.userAccessRepo.getActiveMenuAccess(user.id_role._id)
    const layoutsetting = await this.layoutRepository.getSettingByBranch(user.id_branch || user.access_branch)
    
    let color ='#FF5732'
    if(layoutsetting && layoutsetting.length> 0){
      color = layoutsetting[0].layout_color
    }
    let payload = {
      id_employee: user.id_employee,
      id_client:user.id_client,
      id_project:user.id_project,
      branch:user.access_branch,
      id_branch:user.id_branch,
      layoutcolor:color,
      id_role:{
        _id:user.id_role._id,
        id_role:user.id_role.id_role
      }
    }
    const token = this.tokenService.generateToken(payload);
    return { success: true, message: 'Login successful', token,menuData};
  }

  async findByAdmin(email, password) {
    const Data = await this.userRepository.findByEmail(email);

    if (!Data) {
      return { success: false, message: 'Admin not found' };
    }

    const validPassword = await this.hashingService.comparePassword(password, Data.password);
    if (!validPassword) {
      return { success: false, message: 'Invalid password or Email' };
    }

    if (Data.active !== 1) {
      return { success: false, message: 'Deactivated' };
    }
    let payload = {
      role:Data.is_admin
    }
    const token = this.tokenService.generateToken(payload);
    return { success: true, message: 'Login successful', token};
  }
}

export default LoginUseCase; 