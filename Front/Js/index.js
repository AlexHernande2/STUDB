
document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que se recargue la página

    const email = document.getElementById('email').value;

    // Verificamos si el email está vacío
    if (!email) {
        alert('Por favor, ingresa tu correo electrónico.');
        return;
    }

    //

    // Guardar el correo en el almacenamiento local
    localStorage.setItem('userEmail', email);
    //

    // Enviar el correo al backend para generar y enviar el código https://stback-zg4f.onrender.com
    fetch('https://stback-zg4f.onrender.com/send-verification-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }) // Enviar el email en el cuerpo de la solicitud
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Código de verificación enviado al correo!');
             // Redirigir al usuario a la página de validación de código
             window.location.href = 'Html/Ingreso.html'; 
        } else {
            alert('Error al enviar el código: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al enviar el correo:', error);
        alert('Hubo un problema al enviar el correo.');
    });
});
