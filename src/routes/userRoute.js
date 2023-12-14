module.exports = (server) => {
    const userController = require('../controllers/userController');

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: CRUD of users
 */

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Endpoint to register a new user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example: { message: 'User registered successfully' }
 */



    server.post('/users/register', userController.userRegister);
    server.post('/users/login', userController.loginRegister);
    server.put('/users', jwtMiddleware.verifyToken, userController.userModify);
    server.delete('/users', jwtMiddleware.verifyToken, userController.deleteUser);
}