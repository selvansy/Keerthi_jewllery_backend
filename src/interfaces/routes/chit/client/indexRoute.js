import express from 'express';

import branchRoutes from './branchRoutes.js';
import classificationRoutes from './classificationRoutes.js';
import schemeRoutes from './schemeRoutes.js';
import staffRoutes from './staffRoutes.js';
import schemetypeRoutes from './schemeTypeRoutes.js';
import metalRoutes from './metalRoutes.js';
import paymentModeRoutes from './paymentModeRoutes.js'
import menuRoutes from './menuSettingRoutes.js';
import submenuRoutes from './subMenuSettingRoutes.js';
import giftitemRoutes from './giftItemRoutes.js';
import giftvendorRoutes from './giftVendorRoutes.js'
import offerRoutes from './offerRoutes.js'
import newArrivalsRouter from './newArrivalsRouter.js'
import category from './categoryRoutes.js'
import productRoutes from './productsRoutes.js'
import giftInwardsRoutes from './giftInwardsRoutes.js';
import giftIssuesRoutes from './giftIssuesRoutes.js';
import metalRateRoutes from './metalRateRoutes.js';
import shcemeAccountRoutes from './schemeAccountRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import purityRoutes from './purityRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import customerRoutes from './customerRoutes.js'
import accessRoutes from './userAccessRoutes.js'
import commonRoutes from './commonRoutes.js'
import useRoleRoutes from './userRoleRoutes.js';
import dashboardRoutes from './dashboardRoutes.js'
import pushNotificationRoutes from './pushNotificationRoutes.js'
import whatsappMessageRoutes from './whatsappMessageRoutes.js'
import WeddingBirthDayRoutes from './weddingRoutes.js'
import reportRoutes from './reportRoutes.js'
import orderlistRoutes from "./orderItemRoutes.js";
import orderVendorRoutes from './orderVendorRoutes.js';
import walletRoutes from "./walletRoutes.js";
import organisationRoutes from './organisationRoutes.js'
import campaigntypeRoutes from './campaignRoutes.js'
import departmentRoutes from './departmentRoutes.js'
import notificationConfigRoutes from './notificationConfigRoutes.js'
import notifyRoutes from './notifyRoutes.js'
import topupRoutes from "./topupRoutes.js"
import ticketRaise from "./ticketRaiseRoutes.js"
import contentRoutes from "./contentRoutes.js"
import faqRoutes from "./faqRoutes.js";
import wishlistRoutes from './wishlistRoutes.js'
import SaveNotificationRoutes from './saveNotificationRoutes.js'

const router = express.Router();

router.use('/dashboard', dashboardRoutes)

router.use('/branch', branchRoutes);
router.use('/classification', classificationRoutes);
router.use('/scheme', schemeRoutes);
router.use('/staff', staffRoutes);
router.use('/schemetype', schemetypeRoutes);
router.use('/metal', metalRoutes);
router.use('/paymentmode', paymentModeRoutes);
router.use('/menusetting', menuRoutes);
router.use('/submenusetting', submenuRoutes);
router.use('/giftitem', giftitemRoutes);
router.use('/giftvendor', giftvendorRoutes)
router.use('/offer', offerRoutes)
router.use('/newarrivals', newArrivalsRouter)
router.use('/category', category)
router.use('/product', productRoutes)
router.use('/giftvendor', giftvendorRoutes);
router.use('/giftinwards', giftInwardsRoutes);
router.use('/giftissues', giftIssuesRoutes);
router.use('/metalrate', metalRateRoutes);
router.use('/schemeaccount', shcemeAccountRoutes);
router.use('/employee', employeeRoutes);
router.use('/purity', purityRoutes);
router.use('/payment', paymentRoutes);
router.use('/customer', customerRoutes);
router.use('/useraccess', accessRoutes);
router.use('/common', commonRoutes)
router.use('/userrole', useRoleRoutes);
router.use('/pushnotificaiton', pushNotificationRoutes)
router.use('/whatsappmessage', whatsappMessageRoutes)
router.use('/wedding', WeddingBirthDayRoutes)
router.use('/reports', reportRoutes)
router.use('/ordervendor', orderVendorRoutes)
router.use('/ordreitem', orderlistRoutes);
router.use('/wallet', walletRoutes)
router.use('/organisation', organisationRoutes)
router.use('/campaigntype', campaigntypeRoutes)
router.use('/department', departmentRoutes)
router.use('/notification-config', notificationConfigRoutes)
router.use('/notify', notifyRoutes)
router.use('/topup', topupRoutes)
router.use('/ticketraise', ticketRaise)
router.use('/content', contentRoutes)
router.use('/faq', faqRoutes);
router.use('/wishlist',wishlistRoutes)
router.use('/notification',SaveNotificationRoutes);

export default router; 