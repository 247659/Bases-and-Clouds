<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { ref, onMounted, computed } from 'vue';
import { BContainer, BTable, BButton, BFormFile, BCol, BFormInput, BInputGroupText, BInputGroup, BFormGroup, BRow, BFormSelect, BCard} from 'bootstrap-vue-next'
import { useToast } from 'vue-toastification';

import axios from 'axios';

const file = ref(null)
const filter = ref('')
const selectedFilter = ref('')
const fileList = ref([]);
const API_URL = `https://cjaomdnus8.execute-api.eu-north-1.amazonaws.com/dev/files/`;
const toast = useToast();
const showFiles = ref(false)

defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const fields = [
  { key: "filename", label: "File Name",  class: 'text-center' },
  { key: "lastModified", label: "Last Modified",  class: 'text-center' },
  { key: "size", label: "Size [KB]",  class: 'text-center' },
  { key: "actions", label: "Download",  class: 'text-center' },
  { key: "actions2", label: "See versions", class: "text-center"}
]

const filters = [
    {id: 'newest', text: "Newest files"},
    {id: 'oldest', text: "Oldest files"},
    {id: 'a-z', text: "Name A-Z"},
    {id: 'z-a', text: "Name Z-A"}
]

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

// Funkcja obsługująca zmianę pliku
const handleFileChange = (event) => {
  file.value = event.target.files[0]; // Przypisujemy wybrany plik do file.value
};

// Funkcja przesyłająca plik
const uploadFile = async (username) => {
  if (!file.value) {
    console.error('No file selected');
    toast.error('No file selected')
    return;
  }

  console.log(username);

  const fileName = file.value.name; // Pobieramy nazwę pliku // Dynamiczna ścieżka z nazwą pliku

  // Tworzymy instancję FileReader
  const fileReader = new FileReader();

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
      toast.success('File uploaded successfully!')
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
  showFiles.value = !showFiles.value;
  console.log(showFiles.value)
  const token = getAccessToken();
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}list`, {
      headers: {
        'Content-Type': 'application/json', // Typ MIME pliku`
        Authorization: `${token}`,
      },
    });
    console.log("Przesłane dane!!!!")
    console.log(response);
    fileList.value = response.data.files; // Zapisanie listy plików
    console.log('Files:', fileList.value);
  } catch (error) {
    console.error('Error fetching file list:', error);
  }
};

const downloadFile = async (fileName, id) => {
  const token = getAccessToken();
  if (!token) {
    console.error("No token found in localStorage");
    return;
  }

  console.log("Nazwa pliku " + fileName)
  console.log("Jego wersja " + id)

  try {
    const response = await axios.get(`${API_URL}download_file/${fileName}?versionId=${encodeURIComponent(id)}`, {
      headers: {
      'Content-Type': 'application/json', // Typ MIME pliku`
          Authorization: `${token}`,
    },
    });
    // Konwersja Base64 na binarny ArrayBuffer
    const binaryString = atob(response.data.base64File); // Dekodowanie Base64 na string
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

const sortedFiles = computed(() => {

    let latestFiles = fileList.value.filter(file => file.isLatest);

    if (selectedFilter.value === 'newest') {
        latestFiles = latestFiles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    } else if (selectedFilter.value === 'oldest') {
        latestFiles = latestFiles.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
    } else if (selectedFilter.value === "a-z") {
        latestFiles = latestFiles.sort((a, b) => a.filename.localeCompare(b.filename));
    } else if (selectedFilter.value === "z-a") {
        latestFiles = latestFiles.sort((a, b) => b.filename.localeCompare(a.filename));
    } 

    return latestFiles;
});


const fileVersions = (filename) => {
  return fileList.value.filter(file => file.filename === filename && !file.isLatest);
};

</script>

<template>
    <BContainer>
      <div class="d-flex flex-column justify-content-center align-items-center">
        <h1>Prześlij plik przez API</h1>
        <BFormFile v-model="file" @change="handleFileChange" style="width: 400px;"/>
        <!-- <input type="file" @change="handleFileChange" /> -->
        <BButton @click="uploadFile(user.username)" variant="primary" class="mt-3" size="lg">
            <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket"/> Prześlij plik
        </BButton>
        <BButton @click="getFiles(user.username)" variant="success" class="mt-2" size="lg">
            <font-awesome-icon icon="fa-solid fa-list" /> {{ showFiles ? "Ukryj pliki" : "Wyświetl pliki"}}
        </BButton>
      </div>
      <BRow v-if="showFiles" class="mt-3">
        <BCol lg="4" class="my-1">
                <BFormGroup>
                    <BInputGroup>
                        <BFormInput v-model="filter" type="search" placeholder="Type to Search"/>
                        <BInputGroupText>
                            <BButton :disabled="!filter" @click="filter = ''">Clear</BButton>
                        </BInputGroupText>
                    </BInputGroup>
                </BFormGroup>
            </BCol>
            <BCol lg="4" class="my-1">
                <BFormGroup>
                    <BFormSelect v-model="selectedFilter" :options="[{ value: '', text: 'Filtr By...' }, ...filters.map(filtr => ({ value: filtr.id, text: filtr.text }))]" />
                </BFormGroup>
            </BCol>
      </BRow>
      <BTable v-if="showFiles" :items="sortedFiles" :fields="fields" :filter="filter" striped hover class="mt-3">
        <template #cell(filename)="data">
          {{ data.item.filename }}
        </template>
        <template #cell(lastModified)="data">
            {{ new Date(data.item.lastModified).toLocaleString('pl-PL') }}
        </template>
        <template #cell(size)="data">
          {{ data.item.size }}
        </template>
        <template #cell(actions)="data">
            <BButton variant="primary" @click="downloadFile(data.item.filename, data.item.versionId)">
                <font-awesome-icon icon="fa-solid fa-download" />
            </BButton>
        </template>
        <template #cell(actions2)="data">
            <BButton variant="primary"  @click="data.toggleDetails">
                {{ data.detailsShowing ? 'Hide' : 'Show' }} versions
            </BButton>
        </template>
        <template #row-details="data">
            <BCard>
                <p class="font-weight-bold"> Versions for file: <strong>{{ data.item.filename }}</strong></p>
                <BTable :items="fileVersions(data.item.filename)" :fields="[
                    { key: 'lastModified', label: 'Last Modified', class: 'text-center'},
                    { key: 'size', label: 'Size [KB]', class: 'text-center'},
                    { key: 'actions', label: 'Download', class: 'text-center'}
                    ]" striped bordered hover small>
                    <template #cell(lastModified)="version">
                        {{ new Date(version.item.lastModified).toLocaleString('pl-PL') }}
                    </template>
                    <template #cell(size)="version">
                        {{ version.item.size }}
                    </template>
                    <template #cell(actions)="version">
                        <BButton variant="primary" @click="downloadFile(version.item.filename, version.item.versionId)">
                            <font-awesome-icon icon="fa-solid fa-download" />
                        </BButton>
                    </template>
                </BTable>
            </BCard>
        </template>
      </BTable>
    </BContainer>
  </template>
  
  <style scoped>
        .color {
            color: blueviolet;
        }

        .custom-table {
  background-color: #343a40; /* Dark background */
  color: #f8f9fa; /* Light text color */
}

.custom-table th {
  background-color: #007bff; /* Blue header */
}

.custom-table tbody tr:hover {
  background-color: #495057; /* Darker background on hover */
}

  </style>
  