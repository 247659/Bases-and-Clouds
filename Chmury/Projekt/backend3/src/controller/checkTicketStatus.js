const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "FileProcessingTickets";

const checkTicketStatus = async (req, res) => {
    const { ticketId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        Key: {
            ticketId: ticketId,
        },
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) {
            res.status(200).json({ status: data.Item.status });
        } else {
            res.status(404).json({ error: "Ticket not found" });
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: `Error: ${err.message}` });
    }
};

module.exports = { checkTicketStatus };
