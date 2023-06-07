toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
  console.log('WebSocket connection established.');

  // send authentication message to the server
  socket.send('auth:' + 'admin' + ':' + 'admin');

  // send list message to the server
  socket.send('list');

});


socket.addEventListener('message', (event) => {

  const message = event.data;

  // Handle the received message from the server
  console.log('Received message:', message);

  // check if the message is a files list
  if (typeof message === 'string' && message.startsWith('{')) {
    const file = JSON.parse(message);

    // display the files list
    const filesList = document.getElementById('file-container');

    var counter = filesList.rows.length;
    counter += 1

    const fileElement = document.createElement('tr');
    fileElement.innerHTML = `
      <td>${counter}</td>
      <td> ${file.type === 'file' ? '<i class="bi bi-file-earmark-fill text-primary"></i>' : '<i class="bi bi-folder-fill text-warning"></i>'}
          ${file.name}</td>
      <td>${changeSize(file.size)}</td>
      <td>${changeTime(file.modified)}</td>
      <td>  <button class="btn text-primary" data-file="${file.name}"><i class="bi bi-download"></i></button></td>`;

    filesList.appendChild(fileElement);
  } else if (typeof message === 'string' && message.startsWith('downloadComplete')) {
    // display a success message
    toastr.success('File downloaded successfully.');
  } else if (typeof message === 'string' && message.startsWith('uploadComplete')) {
    // display a success message
    toastr.success('File uploaded successfully.');
  }
});

socket.addEventListener('close', () => {
  console.log('WebSocket connection closed.');
});

// add event listener for file-container for download button
document.getElementById('file-container').addEventListener('click', (event) => {
  const target = event.target;

  // check if the target is a download button
  if (target.classList.contains('btn')) {
    const fileName = target.getAttribute('data-file');
    socket.send(`download:${fileName}`);

    // get file content from the server
    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'object') {
        const fileContent = event.data;

        // create a link element to download the file
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(new Blob([fileContent])));
        link.setAttribute('download', fileName);
        link.click();

        console.log(link)
      }
    })

  }
});

// add event listener for upload button
document.getElementById('btn-upload').addEventListener('click', (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  // check if a file is selected
  if (file) {
    socket.send(`upload:${file.name}`);

    // read the file content and send it to the server
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.addEventListener('load', () => {
      socket.send(fileReader.result);
    });
  }
});


function changeSize(fileSize) {
  const kb = 1024;
  const mb = kb * 1024;

  if (fileSize >= mb) {
    return `${(fileSize / mb).toFixed(2)} MB`;
  }
  if (fileSize >= kb) {
    return `${(fileSize / kb).toFixed(2)} KB`;
  }
  return `${fileSize} B`;
  
}


function changeTime(timestamp) {

  // Convert timestamp to Date object
  const date = new Date(timestamp);

  // Get the current time in milliseconds
  const now = Date.now();

  // Calculate the time difference in milliseconds
  const timeDifference = now - date;

  // Calculate the time difference in seconds, minutes, hours, and days
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Construct the "time ago" message
  let timeAgo;
  if (days > 0) {
    timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }

  return timeAgo;
}