const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-north-1' });
const s3 = new AWS.S3();

const BUCKET_NAME = 'clouds-project-storage';

const downloadFile = async (req, res) => {
    const { fileName } = req.params;
    const username = req.query.username;

    console.log(fileName)
    console.log(username)
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${username}/${fileName}`,
    };
  
    try {
      // Pobieranie pliku z S3
      const data = await s3.getObject(params).promise();
      
      const base64File = data.Body.toString('base64');

      // Ustawienie nagłówków odpowiedzi
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
      // Wysłanie pliku w base64
      res.json({ base64File });// `data.Body` zawiera dane pliku w formie binarnej
    } catch (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Error downloading file' });
    }
  };


  module.exports = { downloadFile }