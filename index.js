import {WebSocketServer} from 'ws';
import fs from 'fs';

// Create a new WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Event: When a client connects to the server
wss.on('connection', (ws) => {
  console.log('A new client!' );

  // Event: When a message is received from a client
  ws.on('message', (message) => {
    const data = message.toString();
    console.log('Received message:', data);

    if (data.startsWith('auth')) {
      const username = data.split(':')[1];
      const password = data.split(':')[2];

      const isAuth = authenticateUser(username, password);

      if (isAuth) {
        ws.isAuth = true;
        ws.username = username;
        ws.send('authenticated');
      } else {
        ws.send('authenticationFailed');
      }
    }

    else if (ws.isAuth && data.startsWith('list')) {

      // if directory does not exist, create it
      if (!fs.existsSync('files'))
        fs.mkdirSync('files');

      // read directory
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
    }

    // Check if the message is a command to upload a file
    else if (ws.isAuth && data.startsWith('upload')) {
      const fileName = data.split(':')[1];
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

    // Check if the message is a command to download a file
    else if (ws.isAuth && data.startsWith('download') ) {
      const fileName = data.split(':')[1];
      const filePath = `files/${fileName}`;

      // Check if the file exists
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        // Read the file as binary data
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }
          
          // Send the file as binary data over WebSocket
          ws.send(data, { binary: true }, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            } else {
              console.log('File sent successfully');
              ws.send('downloadComplete')
            }
          });
        });
      } else {
        ws.send('File not found');
      }
    }

    else if (!ws.isAuth) {
      ws.send('authenticationFailed');
    } else {
      ws.send('Unknown command');
    }
  });

  // Event: When a client disconnects from the server
  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on port 8080.');


function authenticateUser(username, password) {
  return username === 'admin' && password === 'admin';
}
