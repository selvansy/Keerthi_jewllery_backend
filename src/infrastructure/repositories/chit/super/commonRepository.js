import cityModel from "../../../models/chit/cityModel.js";
import stateModel from "../../../models/chit/stateModel.js";
import countryModel from "../../../models/chit/countryModel.js";
import metalModel from "../../../models/chit/metalModel.js";
import purityModel from "../../../models/chit/purityModel.js";
import relationshipModel from "../../../models/chit/relationshipModel.js";
import paymentModeModel from "../../../models/chit/paymentModeModel.js";
import paymentStatusModel from "../../../models/chit/paymentStatusModel.js";
import schemeStatusModel from "../../../models/chit/schemeStatusModel.js";
import installmentTypeModel from "../../../models/chit/installmentTypeModel.js";
import metalPurityModel from "../../../models/chit/purityModel.js";
import mongoose from "mongoose";

class CommonRepository {
  async getAllCities() {
    try {
      return await cityModel.find({});
    } catch (error) {
      console.error("Error fetching cities:", error);
      return null;
    }
  }

  async getAllStates() {
    try {
      return await stateModel.find({});
    } catch (error) {
      console.error("Error fetching states:", error);
      return null;
    }
  }

  async getAllCountries() {
    try {
      return await countryModel.find({});
    } catch (error) {
      console.error("Error fetching countries:", error);
      return null;
    }
  }

  async getAllMetals() {
    try {
      return await metalModel.find({});
    } catch (error) {
      console.error("Error fetching metals:", error);
      return null;
    }
  }

  async getAllPurities() {
    try {
      return await purityModel.find({});
    } catch (error) {
      console.error("Error fetching purities:", error);
      return null;
    }
  }

  async getAllRelationships() {
    try {
      return await relationshipModel.find({});
    } catch (error) {
      console.error("Error fetching relationships:", error);
      return null;
    }
  }

  async getAllPaymentModes() {
    try {
      return await paymentModeModel.find({});
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      return null;
    }
  }

  async getAllPaymentStatuses() {
    try {
      return await paymentStatusModel.find({});
    } catch (error) {
      console.error("Error fetching payment statuses:", error);
      return null;
    }
  }

  // async getAllSchemeStatuses() {
  //   try {
  //     return await schemeStatusModel.find({is_deleted:false,active:true});
  //   } catch (error) {
  //     console.error("Error fetching scheme statuses:", error);
  //     return null;
  //   }
  // }

  async getAllInstallmentTypes() {
    try {
      return await installmentTypeModel.find({});
    } catch (error) {
      console.error("Error fetching installment types:", error);
      return null;
    }
  }

  async getAllMetalPurities() {
    try {
      return await metalPurityModel.find({});
    } catch (error) {
      console.error("Error fetching metal purities:", error);
      return null;
    }
  }

  async getCity(id) {
    try {
      let data =  await cityModel.find({id_state:id});

      if(data.length === 0){
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error getCity:", error);
      return null;
    }
  }

  async getStates(id) {
    try {
      let data =  await stateModel.find({id_country:id})
      .sort({state_name:1})

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getStates:", error);
    }
  }

  async getCountry() {
    try {
      let data =  await countryModel.find().sort({country_name:-1})

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getcountry:", error);
    }
  }

  async getAllMetal() {
    try {
      let data =  await metalModel.find().sort({id_metal:1});

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getAllMetal:", error);
    }
  }

  async getAllPurity() {
    try {
      let data =  await purityModel.find().sort({id_pruity:1});

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getAllPurity:", error);
    }
  }

  async getAllRelationships() {
    try {
      let data =  await relationshipModel.find({is_deleted:false}).select('-createdAt -updatedAt')

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getAllPurity:", error);
    }
  }

  async getAllPaymentMode() {
    try {
      let data =  await paymentModeModel.find({is_deleted:false}).select('-createdAt -updatedAt')

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getAllPurity:", error);
    }
  }

  async getAllPaymentStatus() {
    try {
      let data =  await paymentStatusModel.find().select('-createdAt -updatedAt').sort({id_status:-1})

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error PaymentStatus:", error);
    }
  }

  async getAllSchemeStatus() {
    try {
      let data =  await schemeStatusModel.find({is_deleted:false,active:true}).select('-createdAt -updatedAt')
      // .sort({id_status:-1})

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error PaymentStatus:", error);
    }
  }

  async getAllInstallmentType() {
    try {
      let data =  await installmentTypeModel.find().select('-createdAt -updatedAt')
      .sort({sortOrder:1})

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error PaymentStatus:", error);
    }
  }

  async getPurityByMetal(id) {
    try {
      let data =  await purityModel.find({id_metal:id}).sort({id_pruity:1});

      if(data.length === 0){
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getAllPurity:", error);
    }
  }
}

export default CommonRepository;