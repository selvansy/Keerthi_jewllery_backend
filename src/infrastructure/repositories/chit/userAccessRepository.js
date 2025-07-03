import accessModel from '../../models/chit/accessModel.js';

class UserAccessRepository{
    async getUserAccess(roleId){
        try {
            const accessData = await accessModel.find({id_role:roleId});
  
            if(!accessData){
                return null
            }

            return accessData;
        } catch (error) {
            console.error(error)
        }
    }

    async findOne(roleId,submenuId){
        try {
            const accessData = await accessModel.findOne({id_role:roleId,id_submenu:submenuId});
  
            if(!accessData){
                return null
            }

            return accessData;
        } catch (error) {
            console.error(error)
        }
    }

    async getActiveMenuAccess(roleId) {
      try {
          const resData = await accessModel.aggregate([
              {
                  $match: {
                      id_role: roleId,
                      view_permit: true
                  }
              },
              {
                  $lookup: {
                      from: "submenusettings",
                      localField: "id_submenu",
                      foreignField: "_id",
                      as: "submenuDetails"
                  }
              },
              {
                  $unwind: {
                      path: "$submenuDetails",
                      preserveNullAndEmptyArrays: false
                  }
              },
              {
                  $lookup: {
                      from: "menus",
                      localField: "submenuDetails.id_menu",
                      foreignField: "_id",
                      as: "menuDetails"
                  }
              },
              {
                  $unwind: {
                      path: "$menuDetails",
                      preserveNullAndEmptyArrays: false
                  }
              },
              {
                  $match: {
                      "submenuDetails.active": true,
                      "submenuDetails.visible": true,
                      "menuDetails.is_deleted": false,
                      "menuDetails.active": true
                  }
              },
              {
                  $project: {
                      _id: 0,
                      id_menu: "$menuDetails._id",
                      menu_name: "$menuDetails.menu_name",
                      menu_icon: "$menuDetails.menu_icon",
                      menu_path: "$menuDetails.menu_path",
                      component_name: "$menuDetails.component_name",
                      display_order: "$menuDetails.display_order",
                      id_submenu: "$submenuDetails._id",
                      submenu_name: "$submenuDetails.submenu_name",
                      pathurl: "$submenuDetails.pathurl",
                      submenu_display_order: "$submenuDetails.display_order",
                      view_permit: 1,
                      add_permit: 1,
                      edit_permit: 1,
                      delete_permit: 1
                  }
              },
              {
                  $group: {
                      _id: "$id_menu",
                      menu_name: { $first: "$menu_name" },
                      menu_icon: { $first: "$menu_icon" },
                      menu_path: { $first: "$menu_path" },
                      component_name: { $first: "$component_name" },
                      display_order: { $first: "$display_order" },
                      menu_list: {
                          $push: {
                              id_submenu: "$id_submenu",
                              submenu_name: "$submenu_name",
                              pathurl: "$pathurl",
                              view_permit: "$view_permit",
                              add_permit: "$add_permit",
                              edit_permit: "$edit_permit",
                              delete_permit: "$delete_permit",
                              submenu_display_order: "$submenu_display_order"
                          }
                      }
                  }
              },
              {
                  $addFields: {
                      menu_list: { $sortArray: { input: "$menu_list", sortBy: { submenu_display_order: 1 } } }
                  }
              },
              {
                  $sort: { display_order: 1 }
              }
          ]);
  
          if (resData.length === 0) {
              return null;
          }
  
          return resData;
      } catch (error) {
          console.error(error);
      }
  }
  

      async updateAccess(id,data){
        try {
            const updatedData = await accessModel.updateOne(
                {_id:id},
                {$set:data}
            );

            if(updatedData.matchedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
      }

      async addAccess(data){
        try {
            const updatedData = await accessModel.create(data);

            if(!updatedData){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
      }
}

export default UserAccessRepository;