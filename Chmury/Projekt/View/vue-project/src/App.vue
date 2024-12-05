<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { ref } from 'vue';

const file = ref(null);

const handleFileChange = (event) => {
  file.value = event.target.files[0];
};

const uploadFileToApi = async () => {
  if (!file.value) {
    alert('Nie wybrano pliku!');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const response = await fetch(
      'http://localhost:5173/',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      alert(`Plik przesłany: ${data.message}`);
    } else {
      alert('Błąd przesyłania pliku!');
      console.error('Błąd odpowiedzi:', await response.text());
    }
  } catch (error) {
    console.error('Błąd przesyłania pliku:', error);
    alert('Błąd przesyłania pliku!');
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
          <button @click="uploadFileToApi">Prześlij plik</button>
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
