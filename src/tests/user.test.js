const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const chai = require('chai');
const expect = chai.expect;
const bodyParser = require('body-parser');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const userController = require('../controllers/userController');
const User = require('../models/userModel');

const app = express();
app.use(bodyParser.json());

jest.mock('mongoose');

describe('User Controller Tests', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/apiSecretSanta', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    it('should register a new user', async () => {
        jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(null));
        
        jest.spyOn(jwtMiddleware, 'verifyEmail').mockReturnValue(true);
        
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
        
        const req = {
            body: {
                email: 'test@example.com',
                password: 'testpassword',
            },
        };
      
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
  
        await userController.userRegister(req, res);
      
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'User créé: test@example.com' });
      
        const createdUser = await User.findOne({ email: 'test@example.com' });
        expect(createdUser).toBeTruthy();
    });

    it('should return an error if the email format is incorrect', async () => {
        jest.spyOn(jwtMiddleware, 'verifyEmail').mockReturnValue(false);
        
        const req = {
            body: {
                email: 'invalidemail',
                password: 'testpassword',
            },
        };
      
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
  
        await userController.userRegister(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Le format de l\'email n\'a pas été respecté' });
    });

    it('should return an error if the email is already used', async () => {
        jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve({}));
        
        const req = {
            body: {
                email: 'existingemail@example.com',
                password: 'testpassword',
            },
        };
      
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
      
        await userController.userRegister(req, res);
      
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Accès interdit: l\'email à déjà été utilisé' });
    });

    it('should return a server error for unexpected issues', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));
        
        const req = {
            body: {
                email: 'test@example.com',
                password: 'testpassword',
            },
        };
      
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
      
        await userController.userRegister(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur lors du traitement des données' });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });
});
