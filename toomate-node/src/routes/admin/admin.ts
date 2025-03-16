import { loginAdmin } from '../../controller/admin/authAdmin.js';
import { Router } from 'express'
import { getAllAdmin } from '../../controller/admin/getAllAdmin.js';
import { getAllUsers } from '../../controller/admin/getAllUsers.js';
import { getAllProducts } from '../../controller/admin/getAllProducts.js';
import { createDefaultBillingPlan } from '../../controller/paymentAndPrice/paymentSetupPaypal/createDefaultBillingPlan.controller.js';

const admin = Router();

admin.route('/login').post(loginAdmin);
admin.route('/getAllAdmin').post(getAllAdmin);  
admin.route('/getAllUsers').post(getAllUsers); 
admin.route('/getAllProducts').post(getAllProducts);
admin.route('/createDefaultBilling').post(createDefaultBillingPlan);
export { admin }