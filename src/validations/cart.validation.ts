import Joi from 'joi';
import type { couponsUserCredentials, RolesCredentials } from '../types/types';

export const rolesSchema = {
  body: Joi.object<RolesCredentials>().keys({
    roleName: Joi.string().required(),
    description: Joi.string().required(),
    isDefault: Joi.string().required(),
    roleStatus: Joi.string().required()
  })
};

export const couponsUserSchema = {
  body: Joi.object<couponsUserCredentials>().keys({
    couponCode: Joi.string().required()
  })
};
