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

server.get('/groups', jwtMiddleware.verifyToken, groupController.getAllUsersInGroup);
/**
 * @openapi
 * /groups:
 *   post:
 *     summary: list members of a group
 *     description: Endpoint to list members of a group. Only the members can see each other.
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: listing all members
 *         content:
 *           application/json:
 *             example: { members of the group }
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



server.put('/groups/admin', jwtMiddleware.verifyToken, groupController.updateNameGroup);
/**
 * @openapi
 * /users:
 *   put:
 *     summary: Modify groupe name
 *     description: Endpoint to modify group name only by the admin of the group.
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
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Group name modified successfully
 *         content:
 *           application/json:
 *             example: { message: 'Group name modified successfully, the new name is given' }
 */


server.post('/groups/admin', jwtMiddleware.verifyToken, groupController.inviteToGroup);
/**
 * @openapi
 * /users:
 *   post:
 *     summary: Invite member to a group
 *     description: Endpoint to invite member to a group only by the admin.
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
 *             required:
 *               - email
 *     responses:
 *       201:
 *         description: User invited
 *         content:
 *           application/json:
 *             example: { message: 'User invited, the email of the user is given' }
 */
}
