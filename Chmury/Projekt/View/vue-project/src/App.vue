<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { ref, onMounted } from 'vue';

import axios from 'axios';

const file = ref(null);
const fileList = ref([]);
const API_URL = `https://cjaomdnus8.execute-api.eu-north-1.amazonaws.com/dev/files/`;

// Funkcja obsługująca zmianę pliku
const handleFileChange = (event) => {
  file.value = event.target.files[0]; // Przypisujemy wybrany plik do file.value
};

// Funkcja przesyłająca plik
const uploadFile = async (username) => {
  if (!file.value) {
    console.error('No file selected');
    return;
  }

  console.log(username);

  const fileName = file.value.name; // Pobieramy nazwę pliku // Dynamiczna ścieżka z nazwą pliku

  // Tworzymy instancję FileReader
  const fileReader = new FileReader();

  const getAccessToken = () => {
    // Iteruj przez wszystkie klucze w localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i); // Pobierz nazwę klucza

      // Sprawdź, czy klucz pasuje do wzorca
      if (key.startsWith("CognitoIdentityServiceProvider") && key.endsWith("accessToken")) {
        // Jeśli znajdziesz klucz, zwróć wartość
        return localStorage.getItem(key);
      }
    }

    // Jeśli nie znajdziesz tokena, zwróć null
    return null;
  };

  const token = getAccessToken();
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }
  console.log(token);


  // Funkcja wykonująca się po zakończeniu odczytu pliku
  fileReader.onload = async function(event) {
    // Zawartość pliku w formacie Base64 (usuwa prefiks data URL)
    const base64File = event.target.result.split(',')[1];

    console.log("file", file.value)
    try {
      // Wysyłanie pliku jako surowych danych (Blob/File)
      const response = await axios.put(`${API_URL}${fileName}`, {
        base64File: base64File,// Zawartość pliku w Base64
      }, {
        headers: {
          'Content-Type': 'application/json', // Typ MIME pliku`
          Authorization: `${token}`,
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

const getFiles = async (username) => {
  try {
    const response = await axios.get(`${API_URL}list?username=${encodeURIComponent(username)}`);
    console.log(response);
    fileList.value = response.data.files; // Zapisanie listy plików
    console.log('Files:', fileList.value);
  } catch (error) {
    console.error('Error fetching file list:', error);
  }
};

const downloadFile = async (fileName, username) => {

  try {
    console.log('Downloading file:', fileName);
    const response = await axios.get(`${API_URL}download_file/${fileName}?username=${encodeURIComponent(username)}`,{
      username : username,
    });
    console.log('response ' + response.data.base64File);
    // Konwersja Base64 na binarny ArrayBuffer
    const binaryString = atob(response.data.base64File); // Dekodowanie Base64 na string
    console.log(binaryString);
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
          <button class="fileButton" @click="uploadFile( user.username )">Prześlij plik</button>
          <button class="getButton" @click="getFiles(user.username)">Wyświetl pliki</button>
        </div>

        <div class="fileListContainer">
          <div v-if="fileList.length > 0" class="fileList">
            <h1>Lista plików:</h1>
            <ul>
              <li v-for="(fileName, index) in fileList" :key="fileName">
                <button :id="'fileButtonDownload-' + index" @click="downloadFile(fileName, user.username)">Pobierz</button>
                <label :for="'fileButtonDownload-' + index"><p>{{ fileName }}</p></label>
              </li>
            </ul>
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
  margin-top: 32px;
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

.fileContainer h1 {
  margin: 0 auto;
}

.fileBox h1 {
  font-size: 40px;
}

.fileBox {
  text-align: center;
  margin: 0 auto;
  width: 40%;
}

.fileButton,
.getButton {
  margin-top: 30px;
  margin-right: 10px;
}

.fileChange {
  margin-top: 16px;
}

.fileList {
  margin-top: 20px;
}

.fileList ul {
  list-style-type: none;
  padding: 0;
}

.fileList li:first-child {
  margin-top: 30px;
}

.fileList li {
  display: flex;
  margin-top: 20px;
  margin-left: 30px;
  align-items: center;
  font-size: 18px;
}

.fileList p:hover {
  font-size: 19px;
}

.fileList p {
  margin-left: 24px;
  text-align: left;
}

.fileListContainer {
  margin: 0 auto;
  width: 70%;
  text-align: left;
}
</style>