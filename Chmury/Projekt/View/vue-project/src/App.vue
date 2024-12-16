<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { ref, onMounted } from 'vue';

import axios from 'axios';

const file = ref(null);

// Funkcja obsługująca zmianę pliku
const handleFileChange = (event) => {
  file.value = event.target.files[0]; // Przypisujemy wybrany plik do file.value
};

// Funkcja przesyłająca plik
const uploadFile = async () => {
  if (!file.value) {
    console.error('No file selected');
    return;
  }

  const fileName = file.value.name; // Pobieramy nazwę pliku
  const apiUrl = `https://cjaomdnus8.execute-api.eu-north-1.amazonaws.com/dev/${fileName}`; // Dynamiczna ścieżka z nazwą pliku

  // Tworzymy instancję FileReader
  const fileReader = new FileReader();

  // Funkcja wykonująca się po zakończeniu odczytu pliku
  fileReader.onload = async function(event) {
    // Zawartość pliku w formacie Base64 (usuwa prefiks data URL)
    const base64File = event.target.result.split(',')[1];

    console.log('File content:', file.value);
    try {
      // Wysyłanie pliku jako surowych danych (Blob/File)
      const response = await axios.put(apiUrl, base64File, {
        headers: {
          'Content-Type': file.value.type || 'application/octet-stream', // Typ MIME pliku`
        },
      });

      console.log('File uploaded successfully:', response.data);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err.response) {
        console.error('Response error:', err.response.data);
      }
    }
  };
  fileReader.readAsDataURL(file.value);
};
</script>

<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <div class="hello">
        <h1>Hello {{ user.username }}!</h1>
        <button @click="signOut">Sign Out</button>
      </div>
      <div class="fileContainer">
        <div class="fileBox">
          <div class="fileSend">
            <h1>Prześlij plik przez API</h1>
            <input class="fileChange" type="file" @change="handleFileChange" />
            <button class="fileButton" @click="uploadFile">Prześlij plik</button>
          </div>
        </div>
      </div>
    </template>
  </authenticator>
</template>

<style scoped>
.hello {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: 50px;
  margin-top: 20px;
  display: flex;
}

.hello > button {
  margin-left: 50px;
}

.fileContainer {
  position: absolute;
  left: 0;
  top: 35%;
  width: 100%;
}

.fileBox {
  text-align: center;
  margin: 0 auto;
  width: 30%;
}

.fileButton {
  margin-top: 12px;
}

.fileChange {
  margin-top: 16px;
}

</style>


<!--    import json-->
<!--    import boto3-->
<!--    import base64-->

<!--    s3 = boto3.client('s3')-->

<!--    def lambda_handler(event, context):-->
<!--    print('Received event:', json.dumps(event, indent=2))-->

<!--    # Obsługa żądania preflight (OPTIONS)-->
<!--    if event.get('httpMethod') == 'OPTIONS':-->
<!--    print("Jestem tu")-->
<!--    return {-->
<!--    "statusCode": 200,-->
<!--    "headers": {-->
<!--    "Access-Control-Allow-Origin": "*",-->
<!--    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",-->
<!--    "Access-Control-Allow-Headers": "Content-Type, Authorization",-->
<!--    },-->
<!--    "body": "hello from Lambda!"-->
<!--    }-->

<!--    # Wyciąganie nazwy pliku z proxy (część ścieżki)-->
<!--    file_name = event.get('pathParameters', {}).get('proxy', None)-->

<!--    if not file_name:-->
<!--    return {-->
<!--    "statusCode": 400,-->
<!--    "headers": {-->
<!--    "Access-Control-Allow-Origin": "*",-->
<!--    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",-->
<!--    "Access-Control-Allow-Headers": "Content-Type, Authorization",-->
<!--    },-->
<!--    "body": json.dumps({ "error": "No file name provided in path" })-->
<!--    }-->

<!--    # Sprawdzenie, czy body jest obecne i nie jest puste-->
<!--    if not event.get('body'):-->
<!--    return {-->
<!--    "statusCode": 400,-->
<!--    "headers": {-->
<!--    "Access-Control-Allow-Origin": "*",-->
<!--    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",-->
<!--    "Access-Control-Allow-Headers": "Content-Type, Authorization",-->
<!--    },-->
<!--    "body": json.dumps({ "error": "No file content provided" })-->
<!--    }-->

<!--    try:-->
<!--    # Dekodowanie danych z Base64-->
<!--    file_content = base64.b64decode(event['body'])  # Dekodowanie Base64 do binarnej postaci-->
<!--    bucket_name = 'clouds-project-storage'  # Nazwa zasobnika S3-->

<!--    # Parametry do zapisania pliku w S3-->
<!--    upload_params = {-->
<!--    "Bucket": bucket_name,-->
<!--    "Key": f"photos/{file_name}",  # Nazwa pliku w S3-->
<!--    "Body": file_content,  # Treść pliku-->
<!--    "ContentType": 'application/octet-stream'  # Typ MIME-->
<!--    }-->

<!--    # Zapisanie pliku w S3-->
<!--    s3.put_object(**upload_params)-->

<!--    # Zwrócenie odpowiedzi w przypadku sukcesu-->
<!--    return {-->
<!--    "statusCode": 200,-->
<!--    "headers": {-->
<!--    "Access-Control-Allow-Origin": "*",-->
<!--    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",-->
<!--    "Access-Control-Allow-Headers": "Content-Type, Authorization",-->
<!--    },-->
<!--    "body": json.dumps({ "message": "File uploaded successfully" })-->
<!--    }-->
<!--    except Exception as e:-->
<!--    print('Error:', str(e))-->
<!--    # Obsługa błędów-->
<!--    return {-->
<!--    "statusCode": 500,-->
<!--    "headers": {-->
<!--    "Access-Control-Allow-Origin": "*",-->
<!--    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",-->
<!--    "Access-Control-Allow-Headers": "Content-Type, Authorization",-->
<!--    },-->
<!--    "body": json.dumps({ "error": str(e) })-->
<!--    }-->
