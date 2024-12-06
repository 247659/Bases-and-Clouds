const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    // Wyciąganie nazwy pliku z proxy (część ścieżki)
    console.log('Received body:', event.body);

    const fileName = event.pathParameters.proxy; // Zmienna proxy+ w URL API Gateway

    // Sprawdzenie, czy body jest obecne i nie jest puste
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No file content provided' }),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",  // Możesz ustawić konkretny adres URL, np. "https://www.example.com"
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        };
    }

    try {
        // Dekodowanie danych z base64 (upewniamy się, że body jest poprawnie zakodowane)
        const fileContent = Buffer.from(event.body, 'base64'); // Przekształcamy base64 do binarnego

        // Parametry S3
        const bucketName = 'clouds-project-storage'; // Nazwa Twojego zasobnika S3

        // Parametry do zapisania pliku w S3
        const uploadParams = {
            Bucket: bucketName,
            Key: `photos/${fileName}`, // Nazwa pliku w S3
            Body: fileContent, // Zawartość pliku
            ContentType: 'application/octet-stream' // Typ pliku
        };

        // Zapisanie pliku do S3
        await s3.putObject(uploadParams).promise();

        // Zwracamy odpowiedź w przypadku sukcesu
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully' }),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",  // Możesz ustawić konkretny adres URL, np. "https://www.example.com"
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        };
    } catch (error) {
        // Obsługa błędów
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",  // Możesz ustawić konkretny adres URL, np. "https://www.example.com"
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        };
    }
};

