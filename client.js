import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const app = express();
const port = 3000;

// Get the directory name using the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'client')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
