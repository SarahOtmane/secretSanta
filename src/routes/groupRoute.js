module.exports = (server) => {
    const groupController = require('../controllers/groupController');
    const jwtMiddleware = require('../middlewares/jwtMiddleware');

/**
 * @openapi
 * tags:
 *   name: Groups
 *   description: CRUD of groups
 */


server.post('/groups/create', jwtMiddleware.verifyToken, groupController.createAGroup);
/**
 * @openapi
 * /groups/create:
 *   post:
 *     summary: Create a new group
 *     description: Endpoint to create a new group.
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *               - id
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             example: { message: 'Group created successfully and its name is ${name}' }
 */


server.post('/groups/login', jwtMiddleware.verifyToken, groupController.connectToAGroup);
/**
 * @openapi
 * /groups/login:
 *   post:
 *     summary: login to a group
 *     description: Endpoint to login to a group.
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               id:
 *                 type: string
 *             required:
 *               - name
 *               - id
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             example: { message: 'Group created successfully and its name is ${name}' }
 */


server.delete('/groups/admin', jwtMiddleware.verifyToken, groupController.deleteGroup);
/**
 * @openapi
 * /groups/admin:
 *   post:
 *     summary: delete a group
 *     description: Endpoint to delete a group.
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Group deleted successfully
 *         content:
 *           application/json:
 *             example: { message: 'Group deleted successfully' }
 */

}