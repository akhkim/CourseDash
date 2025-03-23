import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const form = new FormData();
form.append('file', fs.createReadStream('mat235syllabus.pdf'));

axios.post('http://localhost:8000/process_syllabus', form, {
    headers: {
        ...form.getHeaders()
    }
})
.then(response => {
    console.log('Response:', response.data);
})
.catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
}); 