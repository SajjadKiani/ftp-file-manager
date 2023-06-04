# FTP File Management System

The FTP File Management System is a web-based application that allows users to manage files on an FTP server. It provides the following features:

- Download files from the FTP server to your local machine.
- Upload files from your local machine to the FTP server.
- View a list of files available on the FTP server.

## Prerequisites

To run the FTP File Management System, ensure that you have the following:

- Node.js installed on your machine.
- An FTP server with valid credentials to connect and perform file management operations.

## Installation

1. Clone the repository to your local machine:

   ```shell
   git clone https://github.com/SajjadKiani/ftp-file-manager.git
   ```

2. Navigate to the project directory:

   ```shell
   cd ftp-file-manager
   ```

3. Install the dependencies:

   ```shell
   npm install
   ```

## Usage

1. Start the FTP File Management System:

   ```shell
   npm start
   ```

2. start the Client side FTP:

    ```shell
    npm run serve
    ```


3. Open a web browser and navigate to `http://localhost:3000`.

4. The application will display the available files on the FTP server.

5. To download a file, click on the download button next to the desired file. The file will be downloaded to your local machine.

6. To upload a file, click on the "Upload File" button and select a file from your local machine. The file will be uploaded to the FTP server.

7. The file list will automatically update to reflect any changes on the FTP server.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please create a GitHub issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [WebSocket](https://github.com/websockets/ws) - websocket protocol in js.
- [Express.js](https://expressjs.com/) - Web framework used for building the application.
- [Bootstrap](https://getbootstrap.com/) - CSS framework used for styling the user interface.

Feel free to customize this README file according to your specific project structure and requirements.