import type { NextFunction, Request, Response } from 'express';
import type { DeepPartial } from 'utility-types';
import type { IFilterXSSOptions } from 'xss';

// See this for the following types
// https://stackoverflow.com/questions/34508081/how-to-add-typescript-definitions-to-express-req-res
// https://stackoverflow.com/questions/61132262/typescript-deep-partial

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// More strictly typed Express.Request type
export type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  DeepPartial<ReqBody>,
  DeepPartial<QueryString>
>;

// More strictly typed express middleware type
export type ExpressMiddleware<
  ReqBody = Record<string, unknown>,
  Res = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction
) => Promise<void> | void;

// Example usage from Stackoverflow:
// type Req = { email: string; password: string };

// type Res = { message: string };

// export const signupUser: ExpressMiddleware<Req, Res> = async (req, res) => {
//   /* strongly typed `req.body`. yay autocomplete 🎉 */
//   res.json({ message: 'you have signed up' }) // strongly typed response obj
// };

enum DefaultuserStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  delete = 'delete'
}

export interface UserSignUpCredentials {
  userName: string;
  email: string;
  password?: string;
  userStatus: DefaultuserStatus;
  createdBy?: string;
  updateBy?: string;
  id?: any;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  roleId?: any;
}

enum IsDefaultStatus {
  Y = 'Y',
  N = 'N'
}

enum DefaultroleStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  delete = 'delete'
}

export interface RolesCredentials {
  roleName: string;
  description: string;
  isDefault: IsDefaultStatus;
  roleStatus?: DefaultroleStatus;
  createdBy?: string;
  updateBy?: string;
  id?: number;
}

enum FlagStatus {
  Y = 'Y',
  N = 'N'
}

enum DefaultPermissionStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  delete = 'delete'
}

export interface PermissionsCredentials {
  name: string;
  moduleName: string;
  description: string;
  flag: FlagStatus;
  createdBy: string;
  permissionsStatus: DefaultPermissionStatus;
}

/*
 * Locations Start
 */

enum DefaultcountryStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  delete = 'delete'
}

export interface CountriesCredentials {
  countryName: string;
  countryIso: string;
  sortOrder: number;
  isDefault: IsDefaultStatus;
  countryStatus?: DefaultcountryStatus;
  createdBy?: string;
  updateBy?: string;
  id?: number;
}

enum DefaultstateStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  delete = 'delete'
}

export interface StatesCredentials {
  stateName: string;
  stateShortName: string;
  countryId: number;
  isDefault: IsDefaultStatus;
  stateStatus?: DefaultstateStatus;
  createdBy?: string;
  updateBy?: string;
  id?: number;
}

export interface CitiesCredentials {
  cityName: string;
  cityShortName: string;
  countryId: number;
  stateId: number;
  isDefault: IsDefaultStatus;
  cityStatus?: DefaultstateStatus;
  createdBy?: string;
  updateBy?: string;
  id?: number;
}

export interface AssignCredentials {
  roleId: number;
  permissions: string;
  assignStatus?: DefaultstateStatus;
  createdBy?: string;
  updateBy?: string;
  id?: number;
}

export interface couponsUserCredentials {
  couponCode: string;
  couponId: number;
  id?: number;
}

/*
 * Locations End
 */

export type UserLoginCredentials = Omit<UserSignUpCredentials, 'email'>;
export type UserSignupUpdateCredentials = Omit<
  UserSignUpCredentials,
  'password'
>;

export interface EmailRequestBody {
  email: string;
}

export interface ResetPasswordRequestBodyType {
  newPassword: string;
}

export type Sanitized<T> = T extends (...args: unknown[]) => unknown
  ? T // if T is a function, return it as is
  : T extends object
  ? {
      readonly [K in keyof T]: Sanitized<T[K]>;
    }
  : T;

export type SanitizeOptions = IFilterXSSOptions & {
  whiteList?: IFilterXSSOptions['whiteList'];
};
