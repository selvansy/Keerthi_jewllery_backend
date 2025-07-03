import StaffUserModel from '../../../infrastructure/models/chit/staffUserModel.js';

class MongoUserRepository {
  async findByUser(username) {
    const userRecord = await StaffUserModel.findOne({ username }).populate('id_role');
    if (!userRecord) return null;
    
    return {
      id_employee: userRecord.id_employee,
      username: userRecord.username,
      password: userRecord.password,
      active: userRecord.active,
      id_role: userRecord.id_role,
      id_project: userRecord.id_project,
      id_client: userRecord.id_client,
      access_branch: userRecord.access_branch,
      id_branch:userRecord.id_branch
    };
  }
}

export default MongoUserRepository;