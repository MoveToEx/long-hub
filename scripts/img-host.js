import express from 'express';
import cors from 'cors'; 

const app = express();
const port = 3042;

app.use(cors());
app.use(express.static(process.cwd() + '/upload/'));

app.listen(port, () => {
    console.log('running @ port', port);
});