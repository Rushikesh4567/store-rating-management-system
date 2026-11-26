import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validate registration details
const validateUser = [
    body('name')
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be 20 to 60 characters'),

    body('email')
        .isEmail()
        .withMessage('Enter a valid email'),

    body('address')
        .notEmpty()
        .isLength({ max: 400 })
        .withMessage('Address is required and must be within 400 characters'),

    body('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be 8 to 16 characters')
        .custom((password) => {

            if (!password) {
                throw new Error('Password is required');
            }
            let hasUppercase = false;
            let hasSpecial = false;

            for (let char of password) {

                if (char >= 'A' && char <= 'Z') {
                    hasUppercase = true;
                }

                if ('!@#$%^&*'.includes(char)) {
                    hasSpecial = true;
                }
            }

            if (!hasUppercase || !hasSpecial) {
                throw new Error(
                    'Password must contain an uppercase letter and a special character'
                );
            }

            return true;
        })
];


const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Enter a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const checkErrors = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

router.post('/register', validateUser, checkErrors, registerUser);

router.post('/login', validateLogin,checkErrors,loginUser);

export default router;
