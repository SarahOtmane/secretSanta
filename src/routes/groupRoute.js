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
 * /groups/admin:
 *   put:
 *     summary: Modify groupe name
 *     description: Endpoint to modify group name only by the admin of the group.
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
 *     responses:
 *       201:
 *         description: Group name modified successfully
 *         content:
 *           application/json:
 *             example: { message: 'Group name modified successfully, the new name is given' }
 */


server.post('/groups/invitation', jwtMiddleware.verifyToken, groupController.inviteToGroup);
/**
 * @openapi
 * /groups/invitation:
 *   post:
 *     summary: Invite member to a group
 *     description: Endpoint to invite member to a group only by the admin.
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


server.post('/groups/invitation/accept', jwtMiddleware.verifyToken, groupController.acceptInvitation);
/**
 * @openapi
 * /groups/invitation/accept:
 *   post:
 *     summary: Accept an invitation to join a group
 *     description: Endpoint to Accept an invitation to join a group.
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
 *               authorizationInvit:
 *                 type: string
 *             required:
 *               - authorizationInvit
 *     responses:
 *       201:
 *         description: User accept the invitation to join the group
 *         content:
 *           application/json:
 *             example: { message: 'User joined the group' }
 */

server.post('/groups/invitation/refuse', jwtMiddleware.verifyToken, groupController.refuseInvitation);
/**
 * @openapi
 * /groups/invitation/refuse:
 *   post:
 *     summary: Deny an invitation to join a group
 *     description: Endpoint to deny an invitation to join a group.
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
 *               authorizationInvit:
 *                 type: string
 *             required:
 *               - authorizationInvit
 *     responses:
 *       201:
 *         description: User denied the invitation to join the group
 *         content:
 *           application/json:
 *             example: { message: 'user denied the invitation' }
 */



}



