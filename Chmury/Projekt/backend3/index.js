const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    // Wyciąganie nazwy pliku z proxy (część ścieżki)
    console.log('Received event:', JSON.stringify(event, null, 2));

    const fileName = event.pathParameters?.proxy; // Zmienna proxy w URL API Gateway

    // Sprawdzenie, czy body jest obecne i nie jest puste
    if (!event.body) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*", // W przypadku produkcji podaj konkretny adres
                "Access-Control-Allow-Methods": "OPTIONS,PUT"
            },
            body: JSON.stringify({ error: 'No file content provided' })
        };
    }

    try {
        // Dekodowanie danych z Base64
        const fileContent = Buffer.from(event.body, 'base64'); // Zamiana Base64 na binarny
        const bucketName = 'clouds-project-storage'; // Nazwa zasobnika S3

        // Parametry do zapisania pliku w S3
        const uploadParams = {
            Bucket: bucketName,
            Key: `photos/${fileName}`, // Nazwa pliku w S3
            Body: fileContent, // Treść pliku
            ContentType: 'application/octet-stream' // Typ MIME
        };

        // Zapisanie pliku w S3
        await s3.putObject(uploadParams).promise();

        // Zwrócenie odpowiedzi w przypadku sukcesu
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*", // W przypadku produkcji podaj konkretny adres
                "Access-Control-Allow-Methods": "OPTIONS,PUT"
            },
            body: JSON.stringify({ message: 'File uploaded successfully' })
        };
    } catch (error) {
        console.error('Error:', error.message);
        // Obsługa błędów
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*", // W przypadku produkcji podaj konkretny adres
                "Access-Control-Allow-Methods": "OPTIONS,PUT"
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};