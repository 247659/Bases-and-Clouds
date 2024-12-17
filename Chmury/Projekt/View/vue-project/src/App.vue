<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { ref, onMounted } from 'vue';

import axios from 'axios';

const file = ref(null);
const fileList = ref([]);
const API_URL = `https://cjaomdnus8.execute-api.eu-north-1.amazonaws.com/dev`;

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

  const fileName = file.value.name; // Pobieramy nazwę pliku // Dynamiczna ścieżka z nazwą pliku

  // Tworzymy instancję FileReader
  const fileReader = new FileReader();

  // Funkcja wykonująca się po zakończeniu odczytu pliku
  fileReader.onload = async function(event) {
    // Zawartość pliku w formacie Base64 (usuwa prefiks data URL)
    const base64File = event.target.result.split(',')[1];

    console.log('File content:', file.value);
    try {
      // Wysyłanie pliku jako surowych danych (Blob/File)
      const response = await axios.put(`${API_URL}/${fileName}`, base64File, {
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

const getFiles = async () => {
  try {
    const response = await axios.get(`${API_URL}/getList`);
    console.log(response);
    fileList.value = response.data.files; // Zapisanie listy plików
    console.log('Files:', fileList.value);
  } catch (error) {
    console.error('Error fetching file list:', error);
  }
};

const downloadFile = async (fileName) => {

  try {
    const response = await axios.get(`${API_URL}/download_file/${fileName}`);

    // Konwersja Base64 na binarny ArrayBuffer
    const binaryString = atob(response.data); // Dekodowanie Base64 na string
    const binaryArray = new Uint8Array(binaryString.length);

    // Przekształcenie stringa na array of bytes
    for (let i = 0; i < binaryString.length; i++) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }

    // Tworzenie Blob z danych binarnych
    const blob = new Blob([binaryArray], { type: 'application/octet-stream' });

    // Tworzenie linku do pobrania pliku
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);


    console.log('File downloaded successfully:', fileName);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
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
          <h1>Prześlij plik przez API</h1>
          <input class="fileChange" type="file" @change="handleFileChange" />
          <button class="fileButton" @click="uploadFile">Prześlij plik</button>
          <button class="getButton" @click="getFiles">Wyświetl pliki</button>
        </div>

        <div v-if="fileList.length > 0" class="fileList">
          <h2>Lista plików:</h2>
          <ul>
            <li v-for="fileName in fileList" :key="fileName">
              {{ fileName }}
              <button @click="downloadFile(fileName)">Pobierz</button>
            </li>
          </ul>
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
  top: 20%;
  width: 100%;
}

.fileBox {
  text-align: center;
  margin: 0 auto;
  width: 40%;
}

.fileButton,
.getButton {
  margin-top: 12px;
  margin-right: 10px;
}

.fileChange {
  margin-top: 16px;
}

.fileList {
  text-align: center;
  margin-top: 20px;
}

.fileList ul {
  list-style-type: none;
  padding: 0;
}

.fileList li {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>