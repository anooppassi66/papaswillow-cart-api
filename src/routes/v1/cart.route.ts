import { Router } from 'express';
import validate from '../../middleware/validate';
import * as cartController from '../../controller/cart.controller';
import { couponsUserSchema } from '../../validations/cart.validation';
const cartRouter = Router();
/*
 * ** **
 * Cart Crud Operations Route Start
 * ** **
 */
cartRouter.get('/cart', cartController.handleCartByUserId);
cartRouter.post('/cart', cartController.handleCartUserAdd);
cartRouter.put('/cart', cartController.handleCartUserUpdate);
cartRouter.delete('/cart/item/:id', cartController.handleCartUserDelete);
cartRouter.get('/cartprodcuts/list', cartController.handleGetCartProducts);
/*
 * ** **
 * Cart Crud Operations Route End
 * ** **
 */

/*
 * ** **
 * Stripe Operations Route Start
 * ** **
 */
cartRouter.post(
  '/create-checkout-session',
  cartController.handleCheckoutSessionStripeCreate
);
cartRouter.post('/paymenttransaction', cartController.handlePaymentTranAdd);
cartRouter.post(
  '/create-paypal-order',
  cartController.handleCheckoutSessionPaypalCreate
);

/*
 * ** **
 * Stripe Operations Route End
 * ** **
 */

/*
 * ** **
 * Billing Operations Route Start
 * ** **
 */
cartRouter.get('/address', cartController.handleAddressOfUser);
cartRouter.post('/address', cartController.handleBillingInfoAdd);
cartRouter.delete('/address/:id', cartController.handleAddressOfDelete);
cartRouter.post('/checkout', cartController.handleOrderAdd);
/*
 * ** **
 * Stripe Operations Route End
 * ** **
 */

cartRouter.post(
  '/coupon',
  validate(couponsUserSchema),
  cartController.handleCouponsUserAdd
);

/*
 * ** **
 * Order Operations Route Start
 * ** **
 */
cartRouter.get('/orders', cartController.handleOrdersByUser);
cartRouter.get('/ordersinfo/list', cartController.handleOrdersInfo);
cartRouter.get('/ordersinfo/:id', cartController.handleOrdersInfoById);
cartRouter.post('/ordersinfo/update', cartController.handleOrdersInfoUpdate);
cartRouter.get('/ordersdownload', cartController.downloadStockReport);
cartRouter.get('/availablestockdownload', cartController.availableStockReport);
cartRouter.get('/stockproductreport', cartController.handlelistOrderReportData);
cartRouter.get(
  '/categorywiseproductreport',
  cartController.downloadCategoryWiseReport
);
/*
 * ** **
 * Order Operations Route End
 * ** **
 */

/*
 * ** **
 * Payment Gate way Operations Route Start
 * ** **
 */
cartRouter.post('/stripwebhhok', cartController.handleStripeWeb);
cartRouter.post('/paypalwebhhok', cartController.handlePaypalWeb);

/*
 * ** **
 * Payment Gate way Operations Route  End
 * ** **
 */

export default cartRouter;
