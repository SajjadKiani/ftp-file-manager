import {WebSocketServer} from 'ws';
import fs from 'fs';

// Create a new WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Event: When a client connects to the server
wss.on('connection', (ws) => {
  console.log('A new client connected.');

  // show file directory to client
  fs.readdir('files', (err, files) => {
    
    if (err) {
        console.log('Error reading directory:', err);
        return;
    }

    // send file name, size and date modified date list to client
    files.forEach((file) => {
        fs.stat(`files/${file}`, (err, stats) => {
            if (err) {
                console.log(`Error reading file '${file}':`, err);
                return;
            }
    
            ws.send(JSON.stringify( {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                type: stats.isFile() ? 'file' : 'directory',
            }))
        });
    });

  });




  // Event: When a message is received from a client
  ws.on('message', (message) => {
    message = message.toString();
    console.log('Received message:', message);

    // Check if the message is a command to upload a file
    if (typeof message === 'string' && message.startsWith('upload:')) {
      const fileName = message.split(':')[1];
      const fileStream = fs.createWriteStream(`files/${fileName}`);

      // Event: When a chunk of data is received from the client
      ws.on('message', (chunk) => {
        fileStream.write(chunk);
      });

      // Event: When the file upload is completed
      ws.on('close', () => {
        fileStream.end();
        console.log(`File '${fileName}' uploaded successfully.`);
        ws.send('uploadComplete')
      });
    }

    // // Check if the message is a command to download a file
    if (typeof message === 'string' && message.startsWith('download:')) {
      const fileName = message.split(':')[1];
      const filePath = `files/${fileName}`;

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);

        // Event: When the file is opened for reading
        fileStream.on('open', () => {
          fileStream.pipe(ws);
        });

        // Event: When the file read stream is finished
        fileStream.on('end', () => {
          ws.send('downloadComplete');
        });

        // Event: When an error occurs while reading the file
        fileStream.on('error', (error) => {
          console.log(`Error reading file '${fileName}':`, error);
        });
      } else {
        ws.send('File not found');
      }
    }
  });

  // Event: When a client disconnects from the server
  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on port 8080.');
