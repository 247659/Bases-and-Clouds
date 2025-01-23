const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const BUCKET_NAME = "clouds-project-storage";
const TABLE_NAME = "FileProcessingTickets";

const updateTicketStatus = async (ticketId, status) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { ticketId },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
  };
  await dynamoDB.update(params).promise();
};

exports.handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const { ticketId, username, fileName, base64File } = message;

    try {
      const decodedFile = Buffer.from(base64File, "base64");
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${username}/${fileName}`,
        Body: decodedFile,
      };

      // Przesyłanie pliku do S3
      await s3.upload(params).promise();
      console.log(`File uploaded successfully for ticket ${ticketId}`);

      // Aktualizacja statusu ticketu w DynamoDB
      await updateTicketStatus(ticketId, "Processed");
      console.log(`Ticket ${ticketId} updated to 'Processed'`);
    } catch (err) {
      console.error(`Error processing ticket ${ticketId}:`, err.message);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ message: "SQS messages processed successfully" }) };
};
