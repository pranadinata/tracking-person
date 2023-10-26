const router = require('express').Router();

router.get('/fetch', async (req, res) => {
    client.fetchMessages().then((contact) => {
        res.json(contact);
    }).catch((err) => {
        res.send({status: 'error', message: 'Not found'});
    });
});

module.exports = router;
