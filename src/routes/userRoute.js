module.exports = (server) => {
    const userController = require('../controllers/userController');
    const jwtMiddleware = require('../middlewares/jwtMiddleware');

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: CRUD of users
 */


server.post('/users/register', userController.userRegister);
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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example: { message: 'User registered successfully' }
 *       400:
 *         description: the email format is not correct
 *         content:
 *           application/json:
 *             example: { message: 'Bad request: email format is not correct' }
 *       403:
 *         description: the email already exist 
 *         content:
 *           application/json:
 *             example: { message: 'email already used for another acount' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 *              
 */


server.post('/users/login', userController.loginRegister);
/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login as an existing user
 *     description: Endpoint to login as an existing user.
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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             example: { token: 'JWT_TOKEN_HERE' }
 *       401:
 *         description: incorrect password 
 *         content:
 *           application/json:
 *             example: { message: 'Bad request: incorrect email or password' }
 *       404:
 *         description: email not found
 *         content:
 *           application/json:
 *             example: { message: 'incorrect email or password' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */



server.put('/users', jwtMiddleware.verifyToken, userController.userModify);
/**
 * @openapi
 * /users:
 *   put:
 *     summary: Modify user information
 *     description: Endpoint to modify user information.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *                  type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User information modified successfully
 *         content:
 *           application/json:
 *             example: { message: 'User information modified successfully' }
 *       403:
 *         description: missing or expired token
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token' }
 *       404:
 *         description: email not found
 *         content:
 *           application/json:
 *             example: { message: 'User not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */


server.delete('/users', jwtMiddleware.verifyToken, userController.deleteUser);
/**
 * @openapi
 * /users:
 *   delete:
 *     summary: Delete a user account
 *     description: Endpoint to delete a user account.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             example: { message: 'User account deleted successfully' }
 *       403:
 *         description: missing or expired token
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token' }
 *       404:
 *         description: email not found
 *         content:
 *           application/json:
 *             example: { message: 'User not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */

}