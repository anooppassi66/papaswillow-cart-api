import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import prismaClient from '../config/prisma';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config/config';
import { randomBytes } from 'crypto';
import {
  type couponsUserCredentials,
  type TypedRequest
} from './../types/types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import paypal from '@paypal/checkout-server-sdk';
import fs from 'fs/promises';
// import csvfs from 'fs';
// import path from 'path';
import * as csv from 'fast-csv';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require('stripe')(
  'sk_test_51MdS7CAxzgCnhWFdVUfmcIWXR6wWyg3FyXdcj6ywuriR8qWOD8QN8XN5I8VAl6RsejDVJloctuVuv73qTAcxCM8B003mKRMRVn'
);
const environment = new paypal.core.SandboxEnvironment(
  'AXda7gfD-awYDG3rCpohTXacjmnvauogZ_o4yOF-_hMQQQeJ0Yf9AmIBYreZmHmt_SjZCQvRslaes4tg', // Replace with your PayPal client ID
  'EC7rC2OHlPAQXhrwA66A7ZxGG4J4-VG9IPLEQlUsE8CHeeY-GgnuMUmcjXONHEJNyZkBvngzSbmWb-Rl' // Replace with your PayPal client secret
);
const client = new paypal.core.PayPalHttpClient(environment);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const { verify } = jwt;

/**
 * Handles Stripe Create Paymnet Init Strip
 * @param req
 * @param res
 * @returns
 */
export const handleCheckoutSessionStripeCreate = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  console.log(req.body, 'req.body');
  const {
    amount,
    Order: { autoOrderId, userId }
  } = req.body;

  console.log({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'papaswillow'
      },
      unit_amount: amount * 100 // amount in cents
    },
    quantity: 1
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'papaswillow'
            },
            unit_amount: amount * 100 // amount in cents
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        metadata: {
          order_id: autoOrderId, // Add custom metadata here
          user_id: userId
        }
      },
      mode: 'payment',
      success_url: `https://papaswillow.amigosmartech.com/orderConfirmation/${autoOrderId}`, // Replace with your success URL
      cancel_url: 'https://papaswillow.amigosmartech.com/checkout?status=failed' // Replace with your cancel URL
    });

    res.json({ id: session.id, orderId: autoOrderId });
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
};

/**
 * Handles Stripe Create Paymnet Init Paypal
 * @param req
 * @param res
 * @returns
 */
export const handleCheckoutSessionPaypalCreate = async (
  req: Request,
  res: Response
) => {
  const { amount } = req.body;
  // Sample order details; replace with actual data from your frontend
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount, // Replace with actual amount
          success_url: `http://localhost:3000/stripe-success?paymentId=123213&status='success'&paymentMethod='stripe`, // Replace with your success URL
          cancel_url: `http://localhost:3000/stripe-failed?paymentId=123123&status='failed'&paymentMethod='stripe` // Replace with your cancel URL
        }
      }
    ]
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ orderID: order.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while creating the PayPal order');
  }
};

/**
 * Handles Payment Transaction Add
 * @param req
 * @param res
 * @returns
 */
export const handlePaymentTranAdd = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // const { userId } = req.params;
  const { paySessionId, orderId, payStatus } = req.body;

  if (!paySessionId || !orderId || !payStatus) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Session Id, Order Id and Status are required!'
    });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const payInfo = await prismaClient.paymentTransactions.create({
          data: {
            paySessionId,
            orderId: parseInt(orderId),
            payStatus,
            createdAt: new Date(),
            createdBy: user.userName
          }
        });

        res.status(httpStatus.CREATED).json({
          status: 200,
          message: 'Payment created',
          data: payInfo
        });
      } catch (err) {
        console.log('Error:', err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );
};

/**
 * Handles Get Carts By User
 * @param req
 * @param res
 * @returns
 */
export const handleCartByUserId = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const cartInfo = await prismaClient.cart.findFirst({
          where: {
            userId: payload.userID
          },
          select: {
            id: true,
            items: {
              select: {
                id: true,
                quantity: true,
                productAttrId: true,
                Product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    images: true,
                    price: true,
                    salePrice: true,
                    content: true,
                    attributesData: {
                      select: {
                        id: true,
                        attributePrice: true,
                        attributeSalePrice: true,
                        attributeContent: true,
                        isDefault: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Filter the attributesData after fetching it
        const filteredCartInfo = cartInfo?.items.map((item) => ({
          ...item,
          Product: {
            ...item.Product,
            attributesData: item.Product.attributesData.filter(
              (attr) => attr.id === item.productAttrId
            )
          }
        }));

        if (!filteredCartInfo) {
          return res.status(httpStatus.OK).json({ status: 200, data: [] });
        }
        return res.json({ status: 200, data: { items: filteredCartInfo } });
      } catch (err) {
        console.error('Error fetching Cart:', err);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'An error occurred while fetching the Cart'
        });
      }
    }
  );
};

/**
 * Handles Carts Add User
 * @param req
 * @param res
 * @returns
 */
export const handleCartUserAdd = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // const { userId } = req.params;
  const { name, quantity, variant } = req.body;

  if (!name || !quantity) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Name and Quantity are required!'
    });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const product = await prismaClient.product.findFirst({
          where: { name }
        });
        if (!product) {
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ status: 400, error: 'Product Info Not Found' });
        }
        let matchingProduct;
        if (variant) {
          const productWithAttribute =
            await prismaClient.productWithAttribute.findMany({
              where: {
                productId: product.id
              }
            });

          const matchesVariant = (
            attributeContent: string | null,
            variant: Record<string, string>
          ) => {
            if (!attributeContent) {
              return false; // Return false if attributeContent is null
            }

            const parsedContent = JSON.parse(attributeContent);

            return Object.entries(variant).every(([key, value]) =>
              parsedContent.some(
                (attr: any) =>
                  attr.attributeName === key &&
                  attr.attributeValueName === value
              )
            );
          };

          matchingProduct = productWithAttribute.find((item) =>
            matchesVariant(item.attributeContent, variant)
          );
        } else {
          const productWithAttribute =
            await prismaClient.productWithAttribute.findFirst({
              where: {
                productId: product.id,
                isDefault: 'Y'
              },
              select: {
                id: true
              }
            });
          console.log(productWithAttribute?.id, 'productWithAttribute');
          if (productWithAttribute?.id) {
            matchingProduct = productWithAttribute;
          }
        }

        let cart = await prismaClient.cart.findFirst({
          where: { userId: payload.userID }
        });

        if (!cart) {
          cart = await prismaClient.cart.create({
            data: { userId: payload.userID }
          });
        }

        const cartItemInfo = await prismaClient.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: product.id,
            productAttrId: matchingProduct?.id ?? 0
          }
        });

        if (cartItemInfo) {
          try {
            const updatecartItem = await prismaClient.cartItem.update({
              where: {
                id: cartItemInfo.id,
                cartId: cart.id,
                productId: product.id
              },
              data: {
                quantity: cartItemInfo.quantity + quantity,
                unitPrice: 0
              }
            });
            console.log(updatecartItem, 'updatecartItem');
          } catch (err) {
            console.log(err, 'errerrerrerr');
            res.status(httpStatus.INTERNAL_SERVER_ERROR);
          }
        } else {
          const cartItem = await prismaClient.cartItem.create({
            data: {
              cartId: cart?.id,
              productId: product.id,
              productAttrId: matchingProduct?.id ?? 0,
              quantity,
              unitPrice: 0
            }
          });
          console.log(cartItem, 'cartItem');
        }

        const cartInfo = await prismaClient.cart.findFirst({
          where: {
            userId: payload.userID
          },
          select: {
            id: true,
            items: {
              select: {
                id: true,
                quantity: true,
                productAttrId: true,
                Product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    images: true,
                    price: true,
                    salePrice: true,
                    content: true,
                    attributesData: {
                      select: {
                        id: true,
                        attributePrice: true,
                        attributeSalePrice: true,
                        attributeContent: true,
                        isDefault: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Filter the attributesData after fetching it
        const filteredCartInfo = cartInfo?.items.map((item) => ({
          ...item,
          Product: {
            ...item.Product,
            attributesData: item.Product.attributesData.filter(
              (attr) => attr.id === item.productAttrId
            )
          }
        }));

        if (!filteredCartInfo) {
          return res.status(httpStatus.CREATED).json({ status: 200, data: [] });
        } else {
          res.status(httpStatus.CREATED).json({
            status: 200,
            message: 'item Updated',
            data: filteredCartInfo
          });
        }
      } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );
};

/**
 * Handles Carts Add User
 * @param req
 * @param res
 * @returns
 */
export const handleCartUserUpdate = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // const { userId } = req.params;
  const { cartId, name, quantity } = req.body;

  if (!cartId || !name || !quantity) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Name and Quantity are required!'
    });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const product = await prismaClient.product.findFirst({
          where: { name }
        });
        if (!product) {
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ status: 400, error: 'Product Info Not Found' });
        }

        let cart = await prismaClient.cart.findFirst({
          where: { userId: payload.userID }
        });

        if (!cart) {
          cart = await prismaClient.cart.create({
            data: { userId: payload.userID }
          });
        }

        const cartItemInfo = await prismaClient.cartItem.findFirst({
          where: {
            id: cartId
          }
        });

        if (cartItemInfo) {
          try {
            const updatecartItem = await prismaClient.cartItem.update({
              where: {
                id: cartItemInfo.id,
                cartId: cart.id,
                productId: product.id
              },
              data: {
                quantity: cartItemInfo.quantity + quantity,
                unitPrice: 0
              }
            });

            const cartItemsData = await prismaClient.cartItem.findMany({
              where: {
                cartId: cart.id
              },
              select: {
                id: true,
                quantity: true,
                productAttrId: true,
                Product: {
                  select: {
                    name: true,
                    image: true,
                    images: true,
                    price: true,
                    salePrice: true,
                    content: true,
                    attributesData: {
                      select: {
                        id: true,
                        attributePrice: true,
                        attributeSalePrice: true,
                        attributeContent: true,
                        isDefault: true
                      }
                    }
                  }
                }
              }
            });
            console.log(cartItemsData, updatecartItem);

            // Filter the attributesData after fetching it
            const filteredCartInfo = cartItemsData.map((item) => ({
              ...item,
              Product: {
                ...item.Product,
                attributesData: item.Product.attributesData.filter(
                  (attr) => attr.id === item.productAttrId
                )
              }
            }));

            console.log(filteredCartInfo, 'filteredCartInfo');

            if (filteredCartInfo) {
              return res.status(httpStatus.CREATED).json({
                status: 200,
                message: 'item Updated',
                data: filteredCartInfo
              });
            }

            // if (updatecartItem) {
            //   res.status(httpStatus.CREATED).json({
            //     status: 200,
            //     message: 'item Updated',
            //     data: cartItemsData
            //   });
            // }
          } catch (err) {
            console.log(err, 'errerrerrerr');
            res.status(httpStatus.INTERNAL_SERVER_ERROR);
          }
        }
      } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );
};

/**
 * Handles Carts Item Delete
 * @param req
 * @param res
 * @returns
 */
export const handleCartUserDelete = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Product is required!'
    });
  }

  if (id) {
    const cart = await prismaClient.cartItem.findFirst({
      where: { id: parseInt(id) }
    });

    if (!cart) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ status: 400, error: 'Cart item not found' });
    }

    verify(
      token,
      config.jwt.refresh_token.secret,
      // eslint-disable-next-line n/handle-callback-err
      async (_err: unknown, _payload: JwtPayload) => {
        try {
          const cartItem = await prismaClient.cartItem.delete({
            where: { id: parseInt(id) }
          });
          console.log(cartItem);

          // Fetch the remaining items in the cart
          const remainingCartItems = await prismaClient.cartItem.findMany({
            where: {
              cartId: cart.cartId
            },
            include: {
              Product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  images: true,
                  price: true,
                  content: true,
                  salePrice: true
                }
              }
            }
          });
          res.status(httpStatus.CREATED).json({
            status: 200,
            message: 'item deleted',
            data: remainingCartItems
          });
        } catch (err) {
          res.status(httpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    );
  }
};

/**
 * Handles Get Cart Products
 * @param req
 * @param res
 * @returns
 */
export const handleGetCartProducts = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  const productIds = req.query['productIds'];

  if (!productIds) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'productIds is required!'
    });
  }

  // Assuming you have a string of comma-separated IDs
  const idsInput = productIds;

  // Ensure the input is a string
  let idsString;

  if (typeof idsInput === 'string') {
    idsString = idsInput;
  } else if (Array.isArray(idsInput) && typeof idsInput[0] === 'string') {
    idsString = idsInput.join(',');
  } else {
    throw new Error('Invalid input type');
  }

  // Convert the string to an array of numbers
  const idsArray = idsString.split(',').map((id) => Number(id));

  // Define the fields you want to select
  const selectedFields = {
    id: true,
    name: true,
    image: true,
    images: true,
    price: true,
    salePrice: true,
    content: true,
    saleType: true
  };
  // Use the array in the Prisma query
  const productItems = await prismaClient.product.findMany({
    where: {
      id: {
        in: idsArray
      }
    },
    select: selectedFields
  });
  if (!productItems) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: 400, error: 'productItems item not found' });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, payload);
      // const user = await prismaClient.user.findUnique({
      //   where: {
      //     id: payload.userID
      //   }
      // });

      // if (!user) {
      //   return res
      //     .status(httpStatus.NOT_FOUND)
      //     .json({ error: 'User Info Not Found' });
      // }

      try {
        return res.json({ status: 200, data: productItems });
      } catch (err) {
        console.error('Error fetching Products:', err);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'An error occurred while fetching the Products'
        });
      }
    }
  );
};

/**
 * Handles Add Coupons
 * @param req
 * @param res
 * @returns
 */
export const handleCouponsUserAdd = async (
  req: TypedRequest<couponsUserCredentials>,
  res: Response
) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Coupon is are required!'
    });
  }

  const couponInfo = await prismaClient.coupons.findFirst({
    where: {
      couponCode
    }
  });

  if (!couponInfo) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: 400, error: 'Coupon is not exists or invalid' });
  }

  if (couponInfo.isNeverExpired === 'N') {
    console.log(couponInfo, 'couponInfo');

    // coupon dates
    const couponStartDate = new Date(couponInfo.couponStartDate);
    const couponEndDate = new Date(couponInfo.couponEndDate);

    // Get the current date
    const currentDate = new Date();

    // Check if the current date is within the range
    if (currentDate >= couponStartDate && currentDate <= couponEndDate) {
      console.log('The coupon is valid');
    } else {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ status: 400, error: 'The coupon is not valid' });
    }
  }

  const checkCouponExist = await prismaClient.couponsUserAdd.findFirst({
    where: {
      couponId: couponInfo.id
    }
  });

  if (checkCouponExist) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: 400, error: 'Coupon is already assign to logged user' });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, payload);
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'Logged User Info Not Found' });
      }

      try {
        const couponInfoTofrontEnd = await prismaClient.coupons.findFirst({
          where: {
            couponCode
          },
          select: {
            couponCode: true,
            couponType: true,
            couponOptions: true,
            couponValue: true
          }
        });

        res.status(httpStatus.CREATED).json({
          status: 200,
          message: 'Coupon Assign to Logged User',
          data: couponInfoTofrontEnd
        });
      } catch (err) {
        console.log(err, 'err');
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );
};

/**
 * Handles Billing Add
 * @param req
 * @param res
 * @returns
 */
export const handleBillingInfoAdd = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // const { userId } = req.params;
  const {
    firstName,
    lastName,
    address,
    city,
    state,
    zipCode,
    country,
    phoneNumber
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !address ||
    !city ||
    !state ||
    !zipCode ||
    !country ||
    !phoneNumber
  ) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message:
        'Name, Address, City, State, Zipcode , Phone number and country are required!'
    });
  }

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const billingInfo = await prismaClient.billingInfo.create({
          data: {
            userId: payload.userID,
            firstName,
            lastName,
            address,
            city,
            state,
            zipCode,
            country,
            phoneNumber,
            shippingAddress: address
          }
        });
        const addressData = await prismaClient.billingInfo.findMany({
          where: {
            userId: payload.userID
          }
        });

        res.status(httpStatus.CREATED).json({
          status: 200,
          message: 'Billing Info created',
          data: billingInfo,
          userAdresses: addressData
        });
      } catch (err) {
        console.log('Error:', err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );
};

/**
 * Handles Order Add
 * @param req
 * @param res
 * @returns
 */

// eslint-disable-next-line @typescript-eslint/space-before-function-paren
function generateUniqueId(): string {
  return randomBytes(6)
    .toString('base64')
    .replace(/\+/g, '0')
    .replace(/\//g, '0')
    .substring(0, 12);
}
export const handleOrderAdd = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  const { address, payment, itemOrder } = req.body;

  if (!address || !payment) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Billing Address and Payment Info are required'
    });
  }

  try {
    const payload = verify(
      token,
      config.jwt.refresh_token.secret
    ) as JwtPayload;

    const user = await prismaClient.user.findUnique({
      where: {
        id: payload.userID
      }
    });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'User Info Not Found' });
    }

    const cart = await prismaClient.cart.findFirst({
      where: { userId: payload.userID },
      include: { items: true }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Cart is empty'
      });
    }
    
    // Check in stockRecord Table if stock exists for each item and its not a role admin
    // const stockCheckPromises = cart.items.map(async (item: any) => {
    //   const stockRecord = await prismaClient.stockRecord.findFirst({
    //     where: {
    //       productId: item.productId,
    //       productAttrId: item.productAttrId
    //     }
    //   });

    //   if (!stockRecord) {
    //     throw new Error(
    //       `Stock not found for product: ${item.productId} and attribute: ${item.productAttrId}`
    //     );
    //   }
    // });


    const stockCheckPromises = cart.items.map(async (item: any) => {      
      const stockRecord = await prismaClient.stockRecord.findFirst({
        where: {
          productId: item.productId,
          productAttrId: item.productAttrId
        },
        select: {
          received: true,
          issued: true,
          returned: true
        }
      });
    
      if (!stockRecord) {
        throw new Error(
          // `Stock not found for product: ${item.productId} and attribute: ${item.productAttrId}`
          `Stock not found for product with variants`
        );
      }
    
      const availableStock = stockRecord.received - stockRecord.issued + stockRecord.returned;
    
      if (availableStock < item.quantity) {
        throw new Error(
          // `Insufficient stock for product: ${item.productId} and attribute: ${item.productAttrId}`

          `Insufficient stock for product with variants`
        );
      }
    });
    

    // Await all stock check promises
    try {
      await Promise.all(stockCheckPromises);
    } catch (err: any) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: err.message
      });
    }

    let couponInfo: any;
    if (itemOrder.couponCode) {
      couponInfo = await prismaClient.coupons.findFirst({
        where: { couponCode: itemOrder.couponCode }
      });

      if (!couponInfo) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: 'Coupon Code is invalid or expired'
        });
      }
    }

    const productInfoPromises = cart.items.map(async (item: any) => {
      // Fetch product details
      const product = await prismaClient.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          salePrice: true,
          content: true,
          storeId: true,
        },
      });
    
      if (!product) return { ...item, product: null, stockRecord: null, stockDetails: null };
    
      // Fetch stock record for the product and productAttr
      const stockRecord = await prismaClient.stockRecord.findFirst({
        where: { productId: item.productId, productAttrId: item.productAttrId },
        select: {
          id: true,
          received: true,
          issued: true,
          returned: true
        },
      });
    
      let stockDetails = null;
      
      // If stock record exists, fetch stock details
      if (stockRecord) {
        stockDetails = await prismaClient.stockDetail.findFirst({
          where: { stockRecordId: stockRecord.id },
          select: {
            id: true,
            vendorName: true,
            variationName: true,
            amount: true,
            attributePrice: true,
            attributeSalePrice: true,
            received:true,
            issued: true
          },
        });
      }
    
      return {
        ...item,
        product,
        stockRecord,
        stockDetails,
      };
    });
    
    // console.log(productInfoPromises,'productInfoPromises');

    const detailedItems = await Promise.all(productInfoPromises);
    const totalAmount = detailedItems.reduce((total: number, item: any) => {
      const itemTotal =
        item.quantity * (item.stockDetails.attributeSalePrice ?? item.stockDetails.attributePrice ?? item.stockDetails.amount);
      return total + itemTotal + (itemOrder.tax ?? 0);
    }, 0);

    const order = await prismaClient.itemOrder.create({
      data: {
        userId: payload.userID,
        billingInfoId: address.billingInfoId,
        paymentInfoId: 1,
        couponId: couponInfo?.id ?? 0,
        couponCode: couponInfo?.couponCode ?? '',
        couponOptions: couponInfo?.couponOptions ?? '',
        couponType: couponInfo?.couponType ?? '',
        couponValue: couponInfo?.couponValue ?? '',
        totalAmount,
        autoOrderId: generateUniqueId(),
        orderStatus: user.roleId === 1 ? 'processed' : 'pending',
        itemStatus: user.roleId === 1 ? 'processed' : 'pending',
        deliveryCharges: parseFloat(itemOrder.deliveryCharges) ?? 0, // Changed fallback to 0
        createdBy: user.userName,
        paymentMethod: payment.paymentMethod
      }
    });

    const orderInsertPromises = detailedItems.map(async (item: any) => {
      // Debit Stock from Stock Table and insert new record in Stock detail table
      // if (user.roleId === 1) { // i didnt understand the condition 
      {
        const stockRecord = await prismaClient.stockRecord.findFirst({
          where: {
            productId: item.productId,
            productAttrId: item.productAttrId
          }
        });

        if (stockRecord) {
          // Update the found stock record using its id
          const stockUpdateParent = await prismaClient.stockRecord.update({
            where: {
              id: stockRecord.id // Use the unique id to perform the update
            },
            data: {
              issued: stockRecord.issued + item.quantity, // Use stockRecord's issued value
              updateAt: new Date(),
              updateBy: user.userName
            }
          });

          // Insert into StockDetail Table
          const stockDetailedData = await prismaClient.stockDetail.findFirst({
            where: {
              stockRecordId: stockUpdateParent.id
            }
          });

          console.log(stockDetailedData, 'stockDetailedData-orderData');

          await prismaClient.stockDetail.create({
            data: {
              stockRecordId: stockUpdateParent.id,
              vendorName: stockDetailedData?.vendorName ?? '-',
              variationName: stockDetailedData?.variationName ?? '-',
              productId: item.productId,
              storeId: stockUpdateParent.storeId ?? 0,
              productAttrId: item.productAttrId,
              financialYear: stockUpdateParent.financialYear ?? '-',
              issued: item.quantity,
              issuedDate: new Date(),
              amount: stockDetailedData?.amount ?? 0,
              attributePrice: stockDetailedData?.attributePrice ?? 0,
              attributeSalePrice: stockDetailedData?.attributeSalePrice ?? 0,
              createdAt: new Date(),
              createdBy: user.userName,
              inventoryId: stockDetailedData?.inventoryId ?? 0
            }
          });
        }
      }
      
      // Debit Stock from Stock Table and insert new record in Stock detail table
      const orderDetail = await prismaClient.orderDetails.create({
        data: {
          userId: payload.userID,
          orderId: order.id,
          cartId: cart.id,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image || 'No image',
          productAttrId: item.productAttrId,
          productPrice: item.stockDetails.attributePrice ?? item.stockDetails.amount,
          storeId: item.product.storeId,
          financialYear: '2024-2025',
          productSalePrice: item.stockDetails.attributeSalePrice ?? item.stockDetails.amount,
          quantity: item.quantity,
          unitPrice: item.stockDetails.attributePrice ?? item.stockDetails.amount,
          orderDetailStatus: user.roleId === 1 ? 'processed' : 'pending',
          itemDetailStatus: user.roleId === 1 ? 'processed' : 'pending',
          totalPrice:item.quantity * (item.stockDetails.attributeSalePrice ?? item.stockDetails.attributePrice ?? item.stockDetails.amount) + (itemOrder.deliveryCharges ?? 0) + (itemOrder.tax ?? 0),
          createdBy: user.userName
        }
      });
      return orderDetail;
    });

    const orderDetails = await Promise.all(orderInsertPromises);
    if (orderDetails) {
      const deleteCartItemPromises = detailedItems.map(async (item: any) => {
        const deleteDetail = await prismaClient.cartItem.deleteMany({
          where: { cartId: item.cartId, productId: item.productId }
        });
        return deleteDetail;
      });
      if (deleteCartItemPromises) {
        // const assignCouponsUser = await prismaClient.couponsUserAdd.create({
        //   data: {
        //     couponId: couponInfo?.id ?? 0,
        //     couponCode: couponInfo?.couponCode ?? '',
        //     userId: payload.userID,
        //     createdAt: new Date(),
        //     createdBy: user?.userName
        //   }
        // });
        // console.log(assignCouponsUser, 'assignCouponsUser');
      }
    }
    res.status(httpStatus.CREATED).json({
      status: 200,
      message: 'Order created',
      data: order,
      totalAmount,
      orderInfo: orderDetails
    });
  } catch (err) {
    console.log('Error', err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

/**
 * Handles Get Users Address
 * @param req
 * @param res
 * @returns
 */
export const handleAddressOfUser = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, payload);
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const userAddressInfo = await prismaClient.billingInfo.findMany({
          where: {
            userId: payload.userID
          }
        });
        if (!userAddressInfo) {
          return res
            .status(httpStatus.NOT_FOUND)
            .json({ error: 'User Adresses Info Not Found' });
        }
        return res.json({ status: 200, data: userAddressInfo });
      } catch (err) {
        console.error('Error fetching Cart:', err);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'An error occurred while fetching the Cart'
        });
      }
    }
  );
};

/**
 * Handles Address Delete
 * @param req
 * @param res
 * @returns
 */
export const handleAddressOfDelete = async (req: Request, res: Response) => {
  const addressId: number = req.params['id'] ? parseInt(req.params['id']) : 0;
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  // evaluate jwt

  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, payload);
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const billingInfo = await prismaClient.billingInfo.findUnique({
          where: {
            id: addressId
          }
        });
        if (!billingInfo) {
          return res
            .status(httpStatus.NOT_FOUND)
            .json({ error: 'Address Not Found' });
        }

        const billingDeleteItem = await prismaClient.billingInfo.delete({
          where: { id: addressId }
        });
        console.log(billingDeleteItem);

        // Fetch the remaining items in the address
        const remainingAddressItems = await prismaClient.billingInfo.findMany({
          where: {
            userId: payload.userID
          }
        });
        res.status(httpStatus.CREATED).json({
          status: 200,
          message: 'item deleted',
          data: remainingAddressItems
        });
      } catch (err) {
        console.error('Error fetching page:', err);
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'An error occurred while fetching page' });
      }
    }
  );
};

/**
 * Handles Get Orders By User
 * @param req
 * @param res
 * @returns
 */
export const handleOrdersByUser = async (req: Request, res: Response) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  verify(
    token,
    config.jwt.refresh_token.secret,
    // eslint-disable-next-line n/handle-callback-err
    async (err: unknown, payload: JwtPayload) => {
      console.log(err, 'err');
      const user = await prismaClient.user.findUnique({
        where: {
          id: payload.userID
        }
      });

      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'User Info Not Found' });
      }

      try {
        const ordersInfo = await prismaClient.itemOrder.findMany({
          where: {
            userId: payload.userID
          },
          select: {
            id: true,
            userId: true,
            billingInfoId: true,
            paymentInfoId: true,
            totalAmount: true,
            couponCode: true,
            createdAt: true,
            createdBy: true,
            couponOptions: true,
            couponType: true,
            couponValue: true,
            orderStatus: true,
            itemStatus: true,
            autoOrderId: true,
            deliveryCharges: true,
            OrderDetails: true
          }
        });
        if (!ordersInfo) {
          return res.status(httpStatus.OK).json({ status: 200, data: [] });
        }
        return res
          .status(httpStatus.OK)
          .json({ status: 200, data: ordersInfo });
      } catch (err) {
        console.error('Error fetching Orders:', err);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'An error occurred while fetching the Orders'
        });
      }
    }
  );
};

/**
 * Handles Get All Orders
 * @param req
 * @param res
 * @returns
 */
export const handleOrdersInfo = async (req: Request, res: Response) => {
  try {
    const pageNumber: number = req.query['page']
      ? parseInt(req.query['page'] as string, 10)
      : 0;
    const perPage: number = req.query['per_page']
      ? parseInt(req.query['per_page'] as string, 10)
      : 0;

    if (!pageNumber || !perPage) {
      console.error('Missing required fields:', {
        perPage,
        pageNumber
      });
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Missing required fields' });
    }

    const orderCount = await prismaClient.itemOrder.count();
    if (orderCount === 0) {
      const emptyOutput = {
        page: pageNumber,
        per_page: perPage,
        total: orderCount,
        total_pages: Math.ceil(orderCount / perPage),
        data: []
      };
      return res
        .status(httpStatus.OK)
        .json({ message: 'Orders List', data: emptyOutput });
    }

    const ordersData = await prismaClient.itemOrder.findMany({
      skip: perPage * (pageNumber - 1),
      take: perPage,
      select: {
        id: true,
        userId: true,
        billingInfoId: true,
        paymentInfoId: true,
        totalAmount: true,
        couponCode: true,
        createdAt: true,
        createdBy: true,
        couponOptions: true,
        couponType: true,
        couponValue: true,
        orderStatus: true,
        autoOrderId: true,
        deliveryCharges: true,
        OrderDetails: true
      }
    });

    const formatOutput = {
      page: pageNumber,
      per_page: perPage,
      total: orderCount,
      total_pages: Math.ceil(orderCount / perPage),
      data: ordersData
    };
    return res
      .status(httpStatus.OK)
      .json({ message: 'Orders List', data: formatOutput });
  } catch (error) {
    console.error('Error fetching Orders list:', error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'An error occurred while fetching Orders list' });
  }
};

/**
 * Handles Get Orders By User
 * @param req
 * @param res
 * @returns
 */
export const handleOrdersInfoById = async (req: Request, res: Response) => {
  const orderId: number = req.params['id'] ? parseInt(req.params['id']) : 0;
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const token: string | undefined = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);
  // evaluate jwt
  try {
    const orderData = await prismaClient.itemOrder.findUnique({
      where: {
        id: orderId
      },
      select: {
        id: true,
        userId: true,
        billingInfoId: true,
        paymentInfoId: true,
        totalAmount: true,
        couponCode: true,
        createdAt: true,
        createdBy: true,
        couponOptions: true,
        couponType: true,
        couponValue: true,
        orderStatus: true,
        itemStatus: true,
        autoOrderId: true,
        deliveryCharges: true,
        paymentMethod: true,
        processed_date: true,
        shipped_date: true,
        delivered_date: true,
        cancelled_date: true,
        OrderDetails: true,
        addressInfo: true
      }
    });
    if (!orderData) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'Orders Info Not Found' });
    }
    return res.json({
      status: 200,
      message: 'Order and Order Details Data',
      data: orderData
    });
  } catch (err) {
    console.error('Error while fetching Orders:', err);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'An error occurred while fetching Orders' });
  }
};

/**
 * Handles Order Update
 * @param req
 * @param res
 * @returns
 */
export const handleOrdersInfoUpdate = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    const token: string | undefined = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

    const { orderId, orderDetailId, orderStatus, orderDetailStatus } = req.body;

    if (!orderId) {
      console.error('Missing required fields:', {
        orderId
      });
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Missing required fields' });
    }

    // Check if the Order exists in the database
    const itemOrderInfo = await prismaClient.itemOrder.findUnique({
      where: { id: orderId }
    });

    if (!itemOrderInfo) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'Order not found' });
    }

    verify(
      token,
      config.jwt.refresh_token.secret,
      // eslint-disable-next-line n/handle-callback-err
      async (err: unknown, payload: JwtPayload) => {
        console.log(err, 'err');
        const user = await prismaClient.user.findUnique({
          where: {
            id: payload.userID
          }
        });

        if (!user) {
          return res
            .status(httpStatus.NOT_FOUND)
            .json({ error: 'User Info Not Found' });
        }

        if (orderId && !orderDetailId) {
          // Update the Orders data in the database

          let updateData: any = {
            itemStatus: orderStatus
          };

          // Conditional updates based on orderStatus
          if (orderStatus === 'shipped') {
            updateData = {
              ...updateData,
              shipped_date: new Date()
            };
          } else if (orderStatus === 'delivered') {
            updateData = {
              ...updateData,
              delivered_date: new Date()
            };
          } else if (orderStatus === 'cancelled') {
            updateData = {
              ...updateData,
              cancelled_date: new Date()
            };
          }
          console.log(updateData, 'updateData');
          const updateItemOrder = await prismaClient.itemOrder.update({
            where: { id: orderId },
            data: updateData
          });

          console.log(updateItemOrder, 'updateItemOrder');
          const itemOrderDetailInfo = await prismaClient.orderDetails.findMany({
            where: { orderId }
          });

          const orderInfoPromises = itemOrderDetailInfo.map(
            async (item: any) => {
              const orderItem = await prismaClient.orderDetails.update({
                where: {
                  id: item.id
                },
                data: {
                  itemDetailStatus: orderStatus
                }
              });

              return {
                ...item,
                orderItem
              };
            }
          );
          const detailedItems = await Promise.all(orderInfoPromises);
          return res.status(httpStatus.OK).json({
            status: 200,
            message: 'Order updated successfully',
            data: detailedItems
          });
        }

        if (orderId && orderDetailId) {
          // Update the Orders data in the database
          const updateItemOrder = await prismaClient.orderDetails.update({
            where: { id: orderDetailId },
            data: {
              orderDetailStatus
            }
          });
          return res.status(httpStatus.OK).json({
            status: 200,
            message: 'Order updated successfully',
            data: updateItemOrder
          });
        }
      }
    );
  } catch (error) {
    console.error('Error updating Order:', error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'An error occurred while updating the Order' });
  }
};

/**
 * Handles Stripe Payment Gateway webhook
 * @param req
 * @param res
 * @returns
 */

// Function to read and append to a file
async function readAndAppendFile(filePath: string, contentToAppend: string) {
  try {
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log('File content before appending:\n', fileContent);

    // Append new content to the file
    await fs.appendFile(filePath, `\n${contentToAppend}`);

    console.log('Content appended successfully!');
  } catch (error) {
    console.error('Error reading or appending to file:', error);
  }
}

export const handleStripeWeb = async (req: Request, res: Response) => {
  const filePath = 'logs/stripe.log'; // Path to your file
  const contentToAppend = JSON.stringify(req.body);
  await readAndAppendFile(filePath, contentToAppend);

  //  console.log(req.body, 'shafi-body');

  // const metadata = req.body.data.object.metadata;
  // const type = req.body.type;
  // const paymentId = req.body.data.object.id;

  const { metadata, type, paymentId } = req.body;

  const orderData = await prismaClient.itemOrder.findFirst({
    where: {
      autoOrderId: metadata.order_id
    },
    select: {
      id: true,
      userId: true,
      billingInfoId: true,
      paymentInfoId: true,
      totalAmount: true,
      couponCode: true,
      createdAt: true,
      createdBy: true,
      couponOptions: true,
      couponType: true,
      couponValue: true,
      orderStatus: true,
      autoOrderId: true,
      deliveryCharges: true,
      OrderDetails: true
    }
  });

  if (orderData) {
    // Add record in Payment Transaction
    const payInfo = await prismaClient.paymentTransactions.create({
      data: {
        paySessionId: paymentId,
        orderId: orderData.id,
        payContent: JSON.stringify(req.body),
        payStatus: 'active',
        createdAt: new Date(),
        createdBy: metadata.user_id
      }
    });

    if (payInfo) {
      // Update the Orders data in the database
      const updateItemOrder = await prismaClient.itemOrder.update({
        where: { id: orderData.id },
        data: {
          orderStatus:
            type === 'payment_intent.succeeded' ? 'processed' : 'cancelled',
          itemStatus:
            type === 'payment_intent.succeeded' ? 'processed' : 'cancelled',
          processed_date:
            type === 'payment_intent.succeeded' ? new Date() : null,
          cancelled_date:
            type !== 'payment_intent.succeeded' ? new Date() : null,
          paymentInfoId: payInfo.id
        }
      });

      console.log(updateItemOrder, 'updateItemOrder');

      const itemOrderDetailInfo = await prismaClient.orderDetails.findMany({
        where: { orderId: orderData.id }
      });

      const orderInfoPromises = itemOrderDetailInfo.map(async (item: any) => {
        const orderItem = await prismaClient.orderDetails.update({
          where: {
            id: item.id
          },
          data: {
            orderDetailStatus:
              type === 'payment_intent.succeeded' ? 'processed' : 'cancelled',
            itemDetailStatus:
              type === 'payment_intent.succeeded' ? 'processed' : 'cancelled'
          }
        });

        // First, find the existing stock record
        const stockRecord = await prismaClient.stockRecord.findFirst({
          where: {
            productId: item.productId,
            storeId: item.storeId,
            financialYear: item.financialYear,
            productAttrId: item.productAttrId
          }
        });

        if (stockRecord) {
          // Determine update data based on the event type
          const updateData =
            type === 'payment_intent.succeeded'
              ? {
                  issued: stockRecord.issued + item.quantity, // Use stockRecord's issued field
                  updateAt: new Date(),
                  updateBy: metadata.user_id
                }
              : {
                  returned: item.quantity,
                  updateAt: new Date(),
                  updateBy: metadata.user_id
                };

          // Update the stock record
          const stockUpdateParent = await prismaClient.stockRecord.update({
            where: {
              productId_storeId_financialYear_productAttrId: {
                productId: item.productId,
                storeId: item.storeId,
                financialYear: item.financialYear,
                productAttrId: item.productAttrId
              }
            },
            data: updateData
          });

          // Insert into StockDetail Table if the stock record was successfully updated
          if (stockUpdateParent) {
            const stockDetailedData = await prismaClient.stockDetail.findFirst({
              where: {
                stockRecordId: stockUpdateParent.id
              }
            });

            console.log(stockDetailedData, 'stockDetailedData-orderData');

            const stockDetailData =
              type === 'payment_intent.succeeded'
                ? {
                    issued: item.quantity,
                    issuedDate: new Date()
                  }
                : {
                    returned: item.quantity,
                    returnedDate: new Date()
                  };

            await prismaClient.stockDetail.create({
              data: {
                stockRecordId: stockUpdateParent.id,
                vendorName: stockDetailedData?.vendorName ?? '-',
                variationName: stockDetailedData?.variationName ?? '-',
                productId: item.productId,
                storeId: item.storeId,
                productAttrId: item.productAttrId,
                financialYear: item.financialYear,
                ...stockDetailData, // Conditionally update issued or returned fields
                amount: 0,
                attributePrice: 0,
                attributeSalePrice: 0,
                createdAt: new Date(),
                createdBy: metadata.user_id,
                inventoryId: stockDetailedData?.inventoryId ?? 0
              }
            });
          }
        }

        return {
          ...item,
          orderItem
        };
      });

      const detailedItems = await Promise.all(orderInfoPromises);
      return res.status(httpStatus.OK).json({
        status: 200,
        message: 'Order Updated',
        data: detailedItems
      });
    }
  }
};

export const handlePaypalWeb = async (req: Request, res: Response) => {
  // Call the function with the path to your file and content to append
  const filePath = 'logs/paypal.log'; // Path to your file
  const contentToAppend = JSON.stringify(req.body);

  await readAndAppendFile(filePath, contentToAppend);

  res.status(httpStatus.CREATED).json({
    status: 200,
    message: 'successfully processed',
    data: []
  });
};

// Helper function to format date with ordinal
const formatDateWithOrdinal = (date: any) => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  let suffix = 'th';
  if (day % 10 === 1 && day !== 11) {
    suffix = 'st';
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd';
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd';
  }

  return `${day}${suffix} ${month} ${year}`;
};

// Download available stock-wise product report
export const availableStockReport = async (_req: Request, res: Response) => {
  try {
    // 1. Fetch product and stock data using Prisma ORM where available stock > 0
    const stockData = await prismaClient.stockRecord.findMany({
      where: {
        // Calculate available stock: received - issued + returned > 0
        AND: [
          {
            received: {
              gt: 0
            }
          },
          {
            issued: {
              lt: prismaClient.stockRecord.fields.received
            }
          }
        ]
      },
      include: {
        stockDetails: true,
        product: {
          select: {
            id: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            storeName: true
          }
        }
      }
    });

    // 2. Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="available_stock_product_report.csv"'
    );

    // 3. Create a CSV stream
    const csvStream = csv.format({ headers: true });

    // 4. Pipe the CSV stream to the response
    csvStream.pipe(res);

    // 5. Write stock data to the CSV stream
    stockData.forEach((stock) => {
      const availableStock = stock.received - stock.issued + stock.returned;

      // Only write products with available stock
      if (availableStock > 0) {
        csvStream.write({
          Id: stock.id,
          'FINANCIAL YEAR': stock.financialYear,
          'INVOICE NO': stock.invoiceNumber,
          'INVOICE DATE': formatDateWithOrdinal(stock.invoiceDate),
          'NAME/VARIANT': `${stock.product.name} - ${
            stock.stockDetails[0]?.variationName ?? '-'
          }`,
          RECEIVED: stock.received ?? 0,
          ISSUED: stock.issued ?? 0,
          RETURNED: stock.returned ?? 0,
          AVAILABLE_STOCK: availableStock,
          PRICE: stock.stockDetails[0]?.amount ?? 0
        });
      }
    });

    // 6. End the stream after writing
    csvStream.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
};


// Download stock-wise product report
export const downloadStockReport = async (_req: Request, res: Response) => {
  try {
    // 1. Fetch product and stock data using Prisma ORM
    const stockData = await prismaClient.stockRecord.findMany({
      include: {
        stockDetails: true,
        product: {
          select: {
            id: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            storeName: true
          }
        }
      }
    });

    // 2. Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="stock_product_report.csv"'
    );

    // 3. Create a CSV stream
    const csvStream = csv.format({ headers: true });

    // 4. Pipe the CSV stream to the response
    csvStream.pipe(res);

    // 5. Write stock data to the CSV stream
    stockData.forEach((stock) => {
      const availableStock = stock.received - stock.issued + stock.returned;
      csvStream.write({
        Id: stock.id,
        'FINANCIAL YEAR': stock.financialYear,
        'INVOICE NO': stock.invoiceNumber,
        'INVOICE DATE': formatDateWithOrdinal(stock.invoiceDate),
        'NAME/VARIANT': `${stock.product.name} - ${
          stock.stockDetails[0]?.variationName ?? '-'
        }`,
        RECEIVED: stock.received ?? 0,
        ISSUED: stock.issued ?? 0,
        RETURNED: stock.returned ?? 0,
        AVAILABLE_STOCK: availableStock,
        PRICE: stock.stockDetails[0]?.amount ?? 0
      });
    });

    // 6. End the stream after writing
    csvStream.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
};

export const handlelistOrderReportData = async (
  _req: Request,
  res: Response
) => {
  try {
    // Fetch product and stock data using Prisma ORM
    const stockData = await prismaClient.stockRecord.findMany({
      include: {
        stockDetails: true,
        product: {
          select: {
            id: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            storeName: true
          }
        }
      }
    });

    // Return data in JSON format

    return res.status(httpStatus.OK).json({
      status: 200,
      message: 'Stock and Product Information',
      data: stockData
    });
  } catch (error) {
    console.error('Error listing data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report data'
    });
  }
};

export const handleCategoryWiseData = async (_req: Request, res: Response) => {
  try {
    const productReport = await prismaClient.productCategories.findMany({
      where: { parentId: 0 }, // Fetch only root categories (Level 1)
      select: {
        id: true,
        categoryName: true, // Selecting only required columns
        categoryDisplayName: true,
        subCategories: {
          select: {
            id: true,
            categoryName: true,
            categoryDisplayName: true,
            subCategories: {
              select: {
                id: true,
                categoryName: true,
                categoryDisplayName: true,
                products: {
                  select: {
                    productCat: {
                      select: {
                        id: true,
                        name: true,
                        status: true
                      }
                    }
                  }
                }
              }
            },
            products: {
              select: {
                productCat: {
                  select: {
                    id: true,
                    name: true,
                    status: true
                  }
                }
              }
            }
          }
        },
        products: {
          select: {
            productCat: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      status: 200,
      message: 'Category-wise Product Information',
      data: productReport
    });
  } catch (error) {
    console.error('Error fetching category-wise product data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report data'
    });
  }
};

export const downloadCategoryWiseReport = async (
  _req: Request,
  res: Response
) => {
  try {
    const categoryData = await prismaClient.productCategories.findMany({
      where: {
        categoryStatus: 'active',
        menuDisplay: 'Y',
        parentId: 0
      },
      select: {
        id: true,
        categoryName: true,
        categoryDisplayName: true,
        subCategories: {
          where: {
            categoryStatus: 'active',
            menuDisplay: 'Y'
          },
          select: {
            id: true,
            categoryName: true,
            categoryDisplayName: true,
            subCategories: {
              where: {
                categoryStatus: 'active',
                menuDisplay: 'Y'
              },
              select: {
                id: true,
                categoryName: true,
                categoryDisplayName: true,
                products: {
                  where: {
                    status: 'active', // ✅ Ensure only active product-category relations
                    productCat: {
                      status: 'active' // ✅ Ensure only active products
                    }
                  },
                  select: {
                    productCat: {
                      select: {
                        id: true,
                        name: true, // ✅ Ensure correct field name
                        status: true
                      }
                    }
                  }
                }
              }
            },
            products: {
              where: {
                status: 'active', // ✅ Ensure only active product-category relations
                productCat: {
                  status: 'active' // ✅ Ensure only active products
                }
              },
              select: {
                productCat: {
                  select: {
                    id: true,
                    name: true, // ✅ Ensure correct field name
                    status: true
                  }
                }
              }
            }
          }
        },
        products: {
          where: {
            status: 'active', // ✅ Ensure only active product-category relations
            productCat: {
              status: 'active' // ✅ Ensure only active products
            }
          },
          select: {
            productCat: {
              select: {
                id: true,
                name: true, // ✅ Ensure correct field name
                status: true
              }
            }
          }
        }
      }
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="category_wise_product_report.csv"'
    );

    // Create a CSV stream
    const csvStream = csv.format({ headers: true });

    // Pipe the CSV stream to the response
    csvStream.pipe(res);

    // Write category-wise products to the CSV stream

    categoryData.forEach((category) => {
      csvStream.write({
        Category: category.categoryName,
        SubCategory: '-',
        Product: '-',
        Status: '-'
      });

      // Track products to avoid duplicates
      const uniqueProducts = new Map();

      category.subCategories.forEach((subCategory) => {
        csvStream.write({
          Category: '-',
          SubCategory: subCategory.categoryName,
          Product: '-',
          Status: '-'
        });

        subCategory.subCategories.forEach((subSubCategory) => {
          subSubCategory.products.forEach(({ productCat }) => {
            if (productCat && !uniqueProducts.has(productCat.id)) {
              uniqueProducts.set(productCat.id, true);
              csvStream.write({
                Category: '-',
                SubCategory: subCategory.categoryName, // Ensure correct subcategory reference
                Product: productCat.name,
                Status: productCat.status
              });
            }
          });
        });

        subCategory.products.forEach(({ productCat }) => {
          if (productCat && !uniqueProducts.has(productCat.id)) {
            uniqueProducts.set(productCat.id, true);
            csvStream.write({
              Category: '-',
              SubCategory: subCategory.categoryName,
              Product: productCat.name,
              Status: productCat.status
            });
          }
        });
      });

      // Ensure products under the main category are written only if they are NOT in subcategories
      category.products.forEach(({ productCat }) => {
        if (productCat && !uniqueProducts.has(productCat.id)) {
          uniqueProducts.set(productCat.id, true);
          csvStream.write({
            Category: category.categoryName,
            SubCategory: '-',
            Product: productCat.name,
            Status: productCat.status
          });
        }
      });
    });

    // End the stream after writing
    csvStream.end();
  } catch (error) {
    console.error('Error generating category-wise report:', error);
    res.status(500).send('Error generating report');
  }
};
