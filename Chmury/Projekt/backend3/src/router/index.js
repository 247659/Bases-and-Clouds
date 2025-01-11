const express = require('express');
const router = express.Router();
const {getList} = require('../controller/getFilesList');
const {downloadFile} = require('../controller/downloadFile');
const {uploadFile} = require('src/controller/uploadFile');

router.put('/:fileName', uploadFile);
router.get('/download_file/:fileName', downloadFile);
router.get('/list', getList)

module.exports = router