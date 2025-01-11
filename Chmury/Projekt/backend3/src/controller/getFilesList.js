const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-north-1' });
const s3 = new AWS.S3();

const BUCKET_NAME = 'clouds-project-storage';

const getList = async (req, res) => {
    const username = req.query.username;
  
    console.log(username)
  
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: `${username}/`,
      };
  
      const data = await s3.listObjectsV2(params).promise();
      console.log('S3 Object Keys:', data.Contents.map(item => item.Key));
      
      // Filtrujemy pliki i usuwamy prefiks folderu
      const files = data.Contents
        .filter((obj) => obj.Key !== username)  // Pomijamy sam folder
        .map((obj) => obj.Key.split('/').pop()); // Usuwamy prefix folderu dynamicznie
  
      console.log('Po przekształceniu:', files);
  
      res.status(200).json({ files });
    } catch (err) {
      console.error('Error listing files:', err.message);
      res.status(500).json({ error: `Error: ${err.message}` });
    }
  };

  module.exports = {getList}