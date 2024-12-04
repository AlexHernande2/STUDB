document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value;

    fetch('https://stback-zg4f.onrender.com/validate-verification-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: codigo })  // El cuerpo debería contener 'code'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la validación del código');
        }
        return response.json();  // Parsear la respuesta JSON
    })
    .then(data => {
        if (data.success) {
            alert('Código verificado correctamente');
            // Redirigir a la siguiente página o proceso
            window.location.href = 'datos.html';
        } else {
            alert('Código incorrecto: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al verificar el código.');
    });
});
