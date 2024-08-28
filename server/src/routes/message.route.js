const router = require('express').Router();

const messageController = require('../controllers/message.controller');

router.get('/message-history', messageController.getMessageHistory);
router.get('/get-messages/:username', messageController.getMessage);
router.post('/send-message', messageController.sendMessage);

module.exports = router;