import { Router } from 'express';
import { handleUserPaidAndPersonalInfo } from '../../controller/_private/handleUserPaidAndPersonalInfo.controller.js';
import { getChatHistory } from '../../controller/_private/getChatHistory.controller.js';
import { updateChatHistory } from '../../controller/_private/updateChatHistory.controller.js';
import { getChatConversationHistory } from '../../controller/_private/getChatConversationHistory.controller.js';
import { changeChatName } from '../../controller/_private/changeChatName.controller.js';
import { deleteChat } from '../../controller/_private/deleteChat.controller.js';
import { bookmarkChat } from '../../controller/_private/bookmarkChat.controller.js';
import { getPresignedUrl } from '../../controller/_private/getPresignedUrl.controller.js';
import { getPresignedDeleteUrl } from '../../controller/_private/getPresignedUrlDelete.controller.js';
import { getProductFromId } from '../../controller/_private/getProductsFromId.controller.js';
import { changeChatMemoryStatus } from '../../controller/_private/changeChatMemoryStatus.controller.js';
import { getChatMemoryStatus } from '../../controller/_private/getChatMemoryStatus.controller.js';
import { TooltipGeneration } from '../../controller/_private/TooltipGeneration.controller.js';
import { addToUsertoolInventory } from '../../controller/_private/addToUserToolInventory.controller.js';
import { deleteFromUsertoolInventory } from '../../controller/_private/deleteFromUsertoolInventory.controller.js';
import { getUserToolInventory } from '../../controller/_private/getUserToolInventory.controller.js';
import { paymentProcessor } from '../../controller/paymentAndPrice/payment.controller.js';
import { editToUserToolInventory } from '../../controller/_private/editToUserToolInventory.controller.js';
import { getCurrPrice } from '../../controller/paymentAndPrice/getCurrPrice.controller.js';
import { couponCodeValidator } from '../../controller/paymentAndPrice/couponCodeValidator.controller.js';
import { paymentConfirmationAndUpdate } from '../../controller/paymentAndPrice/paymentConfirmationAndUpdate.controller.js';
import { paymentRefundRequest } from '../../controller/paymentAndPrice/refund/paymentRefund.controller.js';
import { getSubscriptionLogs } from '../../controller/paymentAndPrice/getPaymentLogs.controller.js';
import { getSubscriptionDetails } from '../../controller/paymentAndPrice/getPaymentLogInfo.controller.js';
import { requestSubscriptionPause } from '../../controller/paymentAndPrice/requestSubscriptionPause.controller.js';

import { resumePlanAccess } from '../../controller/paymentAndPrice/resumePlanAccess.controller.js';
import { removeSubscriptionPause } from '../../controller/paymentAndPrice/removeSubscriptionPause.controller.js';
import { isEligibleForRefund } from '../../controller/paymentAndPrice/refund/isEligibleForRefund.controller.js';
import { getRefundLogs } from '../../controller/paymentAndPrice/refund/getRefundLogs.controller.js';
import { revokeOverDuePlan } from '../../controller/_private/revokeOverDuePlan.controller.js';
import { getSearchData } from '../../controller/temp.js';
import { getBunnginsProductDetails } from '../../controller/_private/getBunningsProductDetails.js';
const paidDashbaord = Router();

paidDashbaord.route('/getUserPaidAndPersonalInfo').post(handleUserPaidAndPersonalInfo);
paidDashbaord.route('/getChatHistory').post(getChatHistory);
paidDashbaord.route('/updateChatHistory').post(updateChatHistory);
paidDashbaord.route('/getChatConversationHistory').post(getChatConversationHistory);
paidDashbaord.route('/changeChatName').post(changeChatName);
paidDashbaord.route('/deleteChat').post(deleteChat);
paidDashbaord.route('/bookmarkChat').post(bookmarkChat);
paidDashbaord.route('/get-s3-presigned-url').post(getPresignedUrl);
paidDashbaord.route('/get-s3-presigned-delete-url').post(getPresignedDeleteUrl);
paidDashbaord.route('/getProductFromId').post(getProductFromId);
paidDashbaord.route('/changeMemoryStatus').post(changeChatMemoryStatus);
paidDashbaord.route('/getChatMemoryStatus').post(getChatMemoryStatus);
paidDashbaord.route('/getToolTip').post(TooltipGeneration);
paidDashbaord.route('/createNewToolItem').post(addToUsertoolInventory);
paidDashbaord.route('/deleteToolItem').post(deleteFromUsertoolInventory);
paidDashbaord.route('/getUserToolItem').post(getUserToolInventory);
paidDashbaord.route('/editToolItem').post(editToUserToolInventory);
// payment
paidDashbaord.route('/payment').post(paymentProcessor.handlePayment);
paidDashbaord.route('/getCurrPrice').get(getCurrPrice);
paidDashbaord.route('/getCouponCodeValidation').post(couponCodeValidator);
paidDashbaord.route('/paymentConfirmationAndUpdate').post(paymentConfirmationAndUpdate);
paidDashbaord.route('/getSubscriptionLogs').post(getSubscriptionLogs);
paidDashbaord.route('/getSubscriptionDetails').post(getSubscriptionDetails);
// this api is for user to request to pause their subscription
paidDashbaord.route('/requestSubscriptionPause').post(requestSubscriptionPause);
paidDashbaord.route('/removeSubscriptionPauseRequest').post(removeSubscriptionPause);
paidDashbaord.route('/resumeSubscription').post(resumePlanAccess);
// this api handles the reverting the overdue plan
paidDashbaord.route('/revokeOverDuePlan').post(revokeOverDuePlan);
// refund 
paidDashbaord.route('/refundRequest').post(paymentRefundRequest);
paidDashbaord.route('/getRefundEligibilityStatus').post(isEligibleForRefund);
paidDashbaord.route('/getRefundLogs').post(getRefundLogs);
// bunning products
paidDashbaord.route('/getBunningsProductFromItemMap').post(getBunnginsProductDetails)

paidDashbaord.route('/search').post(getSearchData);
export { paidDashbaord };
