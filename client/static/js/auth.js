document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();

    const username = e.target.username.value
    const password = e.target.password.value

    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established.');

        // send authentication message to the server
        socket.send('auth:' + username + ':' + password);

    });

    socket.addEventListener('message', (event) => {

        const message = event.data;

        if (message === 'authenticated') {
            // send list message to the server
            socket.send(JSON.stringify({
                type: 'list',
            }));

            // redirect
            window.location.href = '/'
        } else if (message === 'authenticationFailed') {
            document.getElementById('error').textContent = 'wrong username or password.'
        }
    })
}