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
  const apiUrl = `https://tnvswpmu22.execute-api.eu-north-1.amazonaws.com/Stage1/test2/${fileName}`; // Dynamiczna ścieżka z nazwą pliku

  try {
    // Wysyłanie pliku jako surowych danych (Blob/File)
    const response = await axios.put(apiUrl, file.value, {
      headers: {
        'Content-Type': file.value.type || 'application/octet-stream', // Typ MIME pliku
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
</script>

<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <div class="hello">
        <h1>Hello {{ user.username }}!</h1>
        <button @click="signOut">Sign Out</button>
      </div>
      <div class="fileBox">
        <div class="fileSend">
          <h1>Prześlij plik przez API</h1>
          <input type="file" @change="handleFileChange" />
          <button @click="uploadFile">Prześlij plik</button>
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

.fileBox {
  text-align: center;
  margin: 0 auto;
}
</style>