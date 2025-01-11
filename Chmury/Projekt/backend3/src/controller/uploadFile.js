const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-north-1' });
const s3 = new AWS.S3();

const BUCKET_NAME = 'clouds-project-storage';

// Upload pliku do S3
const uploadFile = async (req, res) => {
    const { fileName } = req.params;
    const { base64File }= req.body;
    const username = req.query.username; 
  
    console.log(fileName);
    console.log(base64File);
    console.log(username);
  
    if (!fileName || !base64File) {
      return res.status(400).json({ error: 'No file name or file content provided' });
    }
  
    try {
      console.log('Print1')
      const decodedFile = Buffer.from(base64File, 'base64');
      console.log('decodedFile' + decodedFile)
  
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${username}/${fileName}`,
        Body: decodedFile,
      };
      console.log('Print3')
      await s3.upload(params).promise();
      res.status(200).send('File uploaded successfully');
    } catch (err) {
      console.error('Error uploading file:', err.message);
      res.status(500).json({ error: `Error: ${err.message}` });
    }
  };

  module.exports = {uploadFile}