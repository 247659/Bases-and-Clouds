const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid"); // Do generowania unikalnych ticketów
const verifier = require("../middleware/verifier");
const path = require("node:path");
const BUCKET_NAME = "clouds-project-storage"; // Nazwa Twojego bucketu
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "FileProcessingTickets"; // Nazwa tabeli DynamoDB

// Funkcja do zapisywania statusu ticketu w DynamoDB
const saveTicketStatus = async (ticketId, status) => {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            ticketId: ticketId,
            status: status,
            timestamp: Date.now(), // Przechowujemy czas zapisania
        },
    };
    await dynamoDB.put(params).promise();
};

// Funkcja do aktualizacji statusu ticketu
const updateTicketStatus = async (ticketId, status) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            ticketId: ticketId,
        },
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

// Funkcja do uploadu pliku
const uploadFile = async (req, res) => {
    const { fileName } = req.params;
    const { base64File } = req.body;
    const token = req.headers.authorization || req.headers.Authorization;

    if (!token) {
        return res.status(401).json({ error: "Authorization token is missing" });
    }

    if (!fileName || !base64File) {
        return res
            .status(400)
            .json({ error: "No file name or file content provided" });
    }

    try {
        // Weryfikacja tokena Cognito
        const payload = await verifier.verify(token);
        console.log("Token verified:", payload);

        // Przesyłanie pliku
        const decodedFile = Buffer.from(base64File, "base64");
        console.log("Decoded file length:", decodedFile.length);

        const params = {
            Bucket: BUCKET_NAME,
            Key: `${payload.username}/${fileName}`,
            Body: decodedFile,
        };


        const fileExtension = path.extname(fileName).toLowerCase();
        console.log(fileExtension);

        if(fileExtension === ".zip"){
            const ticketId = uuidv4(); // Generujemy unikalny ticket
            await saveTicketStatus(ticketId, "Processing");

            setTimeout( async () => {
                await s3.upload(params).promise();
                console.log(`File uploaded successfully for user: ${payload.username}`);
                await updateTicketStatus(ticketId, "Processed");
                console.log(`Ticket ${ticketId} updated to 'Processed'`);
            },  30 * 1000); // 5 minut (czas ustalony na podstawie wymagań)

            res.status(200).json({ message: "File is being processed", ticketId: ticketId });
        } else {
            await s3.upload(params).promise();
            console.log(`File uploaded successfully for user: ${payload.username}`);

            res.status(200).json({ message: "File is being processed" });
        }

    } catch (err) {
        if (err.message === "Invalid signature") {
            console.error("Error:", err.message);
            res.status(401).json({ error: `Error: ${err.message}` });
        } else {
            console.error("Error:", err.message);
            res.status(err.name === "TokenExpiredError" ? 401 : 500).json({ error: `Error: ${err.message}` });
        }
    }
};

module.exports = { uploadFile };
