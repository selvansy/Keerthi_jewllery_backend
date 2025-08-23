import organisationModel from "../../models/chit/organisationModel.js";

class OrganisationRepository{

    async findOne() {
        try {
          const data = await organisationModel.aggregate([
            { $match: {} },
            { $limit: 1 },
            {
              $lookup: {
                from: "cities",
                localField: "id_city",
                foreignField: "_id",
                as: "id_city"
              }
            },
            { $unwind: { path: "$id_city", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "states",
                localField: "id_state",
                foreignField: "_id",
                as: "id_state"
              }
            },
            { $unwind: { path: "$id_state", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "countries",
                localField: "id_country",
                foreignField: "_id",
                as: "id_country"
              }
            },
            { $unwind: { path: "$id_country", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                company_name: 1,
                mobile: 1,
                pincode: 1,
                short_code: 1,
                address: 1,
                email: 1,
                website: 1,
                whatsapp_no: 1,
                toll_free: 1,
                active: 1,
                is_deleted: 1,
                logo: 1,
                small_logo: 1,
                favicon: 1,
                login: 1,
                background: 1,
                bottom_logo: 1,
                secondary_color: 1,
                primary_color: 1,
                color: 1,
                background_color: 1,
                latitude: 1,
                longitude: 1,
                mapUrl: 1,
                createdAt: 1,
                updatedAt: 1,
                pathurl: {
                  $literal: "https://aupay-img.s3.eu-north-1.amazonaws.com/keerthijewellery/webadmin/assets/organisation/"
                },
                id_city: "$id_city._id",
                id_state: "$id_state._id",
                id_country: "$id_country._id",
                cityName: "$id_city.city_name",
                stateName: "$id_state.state_name",
                countryName: "$id_country.country_name"
              }
            }
          ]);
      
          if (!data || data.length === 0) {
            return null;
          }
      
          return data[0];
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
      
      

    async insertOne(data){
        try {
            const newData = await organisationModel.create(data)

            if(!newData){
                return null;
            }

            return newData;
        } catch (error) {
            console.error(error)
        }
    }
    
    async updateOne(id,data){
        try {
            const updatedData = await organisationModel.updateOne(
                {_id:id},
                {$set:data}
            )

            if(updatedData.matchedCount === 0){
                return null;
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }
}

export default OrganisationRepository;