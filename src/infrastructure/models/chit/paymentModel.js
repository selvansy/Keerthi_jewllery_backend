import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
        payment_receipt: {
            type: Number,
            default: 1
        },
        id_transaction: {
            type: String,
            required: true
        },
        id_scheme: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:'Scheme'
        },
        id_scheme_account: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true,
            ref:'SchemeAccount'
        },
     
        id_customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:'Customer'
        },
        id_employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Employee"
        },
        id_branch: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:'Branch'
        },
        date_payment: {
            type: Date,
            required: true
        },
        paid_installments: {
            type: Number,
            required: true,  //installement no
            default:1
        },
        payment_type: {
            type: Number,
            required: true,  // 1- offline,2- online
            default:1
        },
        payment_mode: {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'PaymentMode'
        },
        cash_amount: {
            type: Number,
            default:0
        },
        card_amount: {
            type: Number,
            default:0
        },
        gpay_amount: {
            type: Number,
            default:0
        },
        phone_pay: {
            type: Number,
            default:0
        },
        payment_amount: {
            type: Number,
            required: true,
            default:0
        },
        // gst_amount: {
        //     type: Number,
        //     default:0
        // },
        // fine_amount: {
        //     type: Number,
        //     required: true,
        //     default:0
        // },
        // total_payment: {
        //     type: Number,
        //     required: true,
        //     default:0
        // },
        total_amt: {
            type: Number,
            required: true,
            default:0
        },
        // bonus: {
        //     type: Number,
        //     default:0
        // },
        metal_rate: {
            type: Number,
            default: 0
        },
        metal_weight: {
            type: Number,
            default:0
        },
        payment_status: {
            type: Number,
            required: true,
            default:1   
        },
        remark: {
            type: String,
            default: null
        },
        itr_utr: {
            type: String,
            default: null
        },
        date_add: {
            type: Date,
            required: true
        },
        added_by: {
            type: Number,
            required: true,
            default: 0     // 0 -admin , 1- web app, 2 - mobile app
        },
        active: {
            type: Boolean,
            default:true
        },
        is_deleted:{
            type:Boolean,
            default:false
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            required:false
        },
        paymentModeName:{
            type:String,
            default:null
        },
        digiBonus:{
            type:Number,
            default:0
        },
        creditedBonus:{
            type:Number,
            default:0
        },
        installment:{
            type:Number,
            default:1
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Payments', paymentSchema);