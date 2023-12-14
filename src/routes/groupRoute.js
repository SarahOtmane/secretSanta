module.exports = (server) => {
    const groupController = require('../controllers/groupController');
    const jwtMiddleware = require('../middlewares/jwtMiddleware');


    server.post('/groups', jwtMiddleware.verifyToken, groupController.createAGroup);
}