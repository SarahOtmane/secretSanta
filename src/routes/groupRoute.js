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
 *       403:
 *         description: missing or expired token
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
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
 *         description: Loged to the group with success and the token is given
 *         content:
 *           application/json:
 *             example: { message: 'Loged to the group with success and the token is given' }
 *       403:
 *         description: missing or expired token
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 * 
 */

server.get('/groups', jwtMiddleware.verifyToken, groupController.getAllUsersInGroup);
/**
 * @openapi
 * /groups:
 *   get:
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
 *       403:
 *         description: missing or expired token / User is not a member of a group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not a member of a group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */


server.post('/groups/admin/senta', jwtMiddleware.verifyToken, groupController.assignPerson);
/**
 * @openapi
 * /groups/admin/senta:
 *   post:
 *     summary: Algorithm to randomly assign a group member to each participant
 *     description: Endpoint to randomly assign a group member to each participant
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Each member of the group is assigned to another one
 *         content:
 *           application/json:
 *             example: { message: 'Each member of the group is assigned to another one' }
 *       401:
 *         description: some memebers didn't answer to the invit yet / there's less then 2 members in the group
 *         content:
 *           application/json:
 *             example: { message: 'some memebers did not answer to the invit yet / thereis less then 2 members in the group' }
 *       403:
 *         description: missing or expired token / User is not the admin of a group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not the admin of a group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */


server.get('/groups/admin', jwtMiddleware.verifyToken, groupController.listAllMembersWithAssignement);
/**
 * @openapi
 * /groups/admin:
 *   get:
 *     summary: List of all user with their assigner
 *     description: Endpoint to list of all user with their assigner.
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: List of all user with their assigner
 *         content:
 *           application/json:
 *             example: { message: 'the user {a@gmail.com} is assigned tp {a@gmail.com}' }
 *       403:
 *         description: missing or expired token / User is not the admin of a group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not the admin of a group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */

server.delete('/groups/admin', jwtMiddleware.verifyToken, groupController.deleteGroup);
/**
 * @openapi
 * /groups/admin:
 *   delete:
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
 *       403:
 *         description: missing or expired token / User is not the admin of a group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not the admin of a group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
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
 *       400:
 *         description: the user already accepted the invit or he didn't answer yet but the invit didn't expire
 *         content:
 *           application/json:
 *             example: { message: 'the user already accepted the invit or he did not answer yet but the invit did not expire' }
 *       403:
 *         description: missing or expired token / User is not the admin of the group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not the admin of the group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */


server.post('/groups/admin/invitation', jwtMiddleware.verifyToken, groupController.inviteToGroup);
/**
 * @openapi
 * /groups/admin/invitation:
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
 *       400:
 *         description: the user already accepted the invit / user already invited and the invit didn't expire
 *         content:
 *           application/json:
 *             example: { message: 'the user already accepted the invit / user already invited and the invit did not expire ' }
 *       403:
 *         description: missing or expired token / User is not the admin of the group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User is not the admin of the group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
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
 *       401:
 *         description: the user answer to the invit
 *         content:
 *           application/json:
 *             example: { message: 'the user answer to the invit' }
 *       403:
 *         description: missing or expired token / User wasn't invited
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User wasnot invited' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
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
 *       401:
 *         description: the user answer to the invit
 *         content:
 *           application/json:
 *             example: { message: 'the user answer to the invit' }
 *       403:
 *         description: missing or expired token / User wasn't invited
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User wasnot invited' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */



server.get('/groups/assigned', jwtMiddleware.verifyToken, groupController.getUserAssigned);
/**
 * @openapi
 * /groups/assigned:
 *   get:
 *     summary: See the name og the member who's assigned to him
 *     description: Endpoint to  See the name og the member who's assigned to him.
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
 *       403:
 *         description: missing or expired token / User isn't a member of the group
 *         content:
 *           application/json:
 *             example: { message: 'missing or expired token / User isnot a member of the group' }
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             example: { message: 'Group not found' }
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             example: { message: 'Server error' } 
 */

}



