const router = require("../router");
const AWS = require("aws-sdk");
const BUCKET_NAME = "clouds-project-storage";
const s3 = new AWS.S3();

const complete = async (req, res) => {
    const { uploadId, fileName, parts } = req.body;

    if (!uploadId || !fileName || !parts) {
        return res.status(400).json({ error: "Missing upload details" });
    }
    console.log("HALO?????")
    try {
        // Przygotowujemy parametry do wywołania completeMultipartUpload
        const completedParts = parts.map((part) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber, // Numer części powinien być zgodny
        }));
        // Wywołanie completeMultipartUpload
        const params = {
            Bucket: BUCKET_NAME,
            Key: `test/${fileName}`,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: completedParts,
            },
        };
        console.log("HALO!!!!!!!!!!!!!!!!!!!!!!!!!!?")
        console.log("Parts sent to AWS:", completedParts);
        // Zakończenie uploadu
        await s3.completeMultipartUpload(params).promise();
        console.log('Multipart upload completed successfully!');

        res.status(200).json({ message: "File upload completed successfully" });
    } catch (err) {
        console.error("Error completing multipart upload:", err.message);
        // Jeśli wystąpi błąd, wywołaj abortMultipartUpload, aby anulować częściowy upload
        await s3.abortMultipartUpload({
            Bucket: BUCKET_NAME,
            Key: `test/${fileName}`,
            UploadId: uploadId,
        }).promise();
        console.error("Multipart upload aborted.");
        res.status(500).json({ error: "Error completing multipart upload" });
    }
};

module.exports = {complete};