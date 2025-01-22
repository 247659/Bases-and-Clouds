const { CognitoJwtVerifier } = require("aws-jwt-verify");
const AWS = require("aws-sdk");

const BUCKET_NAME = "clouds-project-storage"; // Podmień na właściwą nazwę bucketu
const s3 = new AWS.S3();

// Konfiguracja CognitoJwtVerifier
const verifier = CognitoJwtVerifier.create({
    userPoolId: "eu-north-1_regp2NIhU", // Podaj ID swojej grupy użytkowników Cognito
    tokenUse: "access",      // Sprawdzamy access token
    clientId: ["69t98uivj2p9b9i9dn7q8obfqb", "pis58beaainieqgqccc2me8pe"] // Podaj ID aplikacji klienta
});

const uploadFile = async (req, res) => {
    const { fileName } = req.params;
    const { base64File } = req.body;
    const token = req.headers.authorization || req.headers.Authorization;

    console.log("fileName:", fileName);
    console.log("token:", token);

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

        const decodedFile = Buffer.from(base64File, "base64");
        console.log("Decoded file length:", decodedFile.length);

        const params = {
            Bucket: BUCKET_NAME,
            Key: `${payload.username}/${fileName}`,
            Body: decodedFile,
        };

        await s3.upload(params).promise();
        res.status(200).send("File uploaded successfully");
    } catch (err) {
        console.error("Error:", err.message);
        res
            .status(err.name === "TokenExpiredError" ? 401 : 500)
            .json({ error: `Error: ${err.message}` });
    }
};

module.exports = { uploadFile };
