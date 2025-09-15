import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterValidator } from './RegisterValidator';
import { LoginValidator } from './LoginValidator';

export const validateRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const registerData = plainToClass(RegisterValidator, req.body);
    // console.log("registerdata", registerData)
    const errors = await validate(registerData);
    console.log("errors", errors)

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return {
          field: error.property,
          message: Object.values(error.constraints || {})[0]
        };
      });

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
      return;
    }

    // If validation passes, attach the validated data to the request
    req.body = registerData;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown validation error'
    });
  }
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loginData = plainToClass(LoginValidator, req.body);
    const errors = await validate(loginData);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return {
          field: error.property,
          message: Object.values(error.constraints || {})[0]
        };
      });

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
      return;
    }

    // If validation passes, attach the validated data to the request
    req.body = loginData;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown validation error'
    });
  }
};
