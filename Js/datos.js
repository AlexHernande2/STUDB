document.getElementById('newItemForm').addEventListener('submit', addItem);
const userEmail = localStorage.getItem('userEmail');

// Cargar el JSON desde la URL
fetch('https://raw.githubusercontent.com/juanmontes55/Sistemas-distribuidos/refs/heads/main/correos.json')
    .then(response => response.json())
    .then(data => {
        // Buscar el nombre correspondiente al correo
        const user = data.find(user => user.email === userEmail);
        const titulo = document.getElementById('bienvenido');

        if (user) {
            // Actualizar el título de bienvenida con el nombre
            titulo.innerText = `¡Bienvenido ${user.nombre}!`;
        } else {
            // Si no se encuentra el usuario, mostrar un mensaje de error
            titulo.innerText = '¡Bienvenido!'; // O manejarlo de otra manera
        }
    })
    .catch(error => {
        console.error('Error al cargar el JSON:', error);
        const titulo = document.getElementById('bienvenido');
        titulo.innerText = '¡Bienvenido!'; // Manejo de error
    });


// Función para manejar la carga de archivos
async function handleUpload(itemId) {
    console.log('ID del item:', itemId); // Verifica el valor de itemId

    if (!itemId) {
        console.error('Error: El itemId es inválido o está vacío.');
        alert('No se puede cargar el archivo porque el ID del item no es válido.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc, .docx, .pdf';

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) {
            alert('No se seleccionó ningún archivo.');
            return;
        }

        const confirmUpload = confirm(`¿Desea cargar el archivo "${file.name}"?`);
        if (!confirmUpload) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Preparando para enviar el archivo...');
            console.log('Ruta de la API:', `https://stback-zg4f.onrender.com/items/${itemId}/upload`);
            console.log('Archivo seleccionado:', file);

            const response = await fetch(`https://stback-zg4f.onrender.com/items/${itemId}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error desconocido');
            }

            const data = await response.json();
            console.log('Datos del servidor:', data);

            // Actualiza la tabla directamente con el dato recibido
            if (data.ruta) {
                const row = document.querySelector(`tr[data-id="${itemId}"]`);
                if (row) {
                    const rutaCell = row.querySelector('td:last-child');
                    rutaCell.innerHTML = `<a href="${data.ruta}" target="_blank" class="text-primary">Link</a>`;
                }
            }
            

            alert('Archivo cargado y enlace almacenado.');
        } catch (error) {
            console.error('Error al cargar el archivo:', error.message);
            alert(`Ocurrió un error: ${error.message}`);
        }
    };
    input.click();
}


// Función para agregar un nuevo item a la tabla y subirlo a MongoDB
function addItem(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    const itemAsunto = document.getElementById('itemAsunto').value;
    const ruta = ''; // Valor inicial o ruta por defecto

    // Verificar si el correo está presente
    if (!userEmail) {
        alert('No se encontró el correo del usuario. Por favor, inicia sesión nuevamente.');
        return;
    }

    // Crear el objeto con los datos del nuevo item
    const newItem = {
        asunto: itemAsunto,
        correo: userEmail,
        ruta: ruta
    };

    // Enviar los datos al servidor
    fetch('https://stback-zg4f.onrender.com/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
    })
    .then(response => response.json())
    .then(data => {
        // Agregar el nuevo item a la tabla si se guarda correctamente
        const tableBody = document.getElementById('tableBody');
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', data.id);

        newRow.innerHTML =  `
        <th scope="row">${data.id}</th>
        <td>${data.asunto}</td>
        <td>${data.estado}</td>
        <td class="text-center">
            <button type="button" class="btn btn-success w-50" id="addBtn-${data.id}" onclick="handleUpload(${data.id})">Agregar</button>
        </td>
        <td class="text-center">
            ${data.ruta ? `<a href="${data.ruta}" target="_blank" class="text-primary">Link</a>` : "No disponible"}
        </td>
    `;
        tableBody.appendChild(newRow);

        // Asignar el evento onclick al botón "Agregar" recién agregado
        const newButton = document.getElementById(`addBtn-${data.id}`);
        newButton.onclick = () => handleUpload(data.id);

        // Limpiar el formulario y cerrar el modal
        document.getElementById('newItemForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newItemModal'));
        modal.hide();
    })
    .catch(error => console.error('Error al guardar el item en MongoDB:', error));
}

// Cargar datos desde MongoDB al cargar la página
fetch(`https://stback-zg4f.onrender.com/items?correo=${encodeURIComponent(userEmail)}`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
})
.then(response => {
    console.log('Estado de la respuesta:', response.status);
    console.log('Encabezados de la respuesta:', response.headers);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Datos recibidos del servidor:', data);
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Limpiar filas existentes

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No se encontraron items para este correo.</td></tr>';
        return;
    }

    data.forEach(item => {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', item.id);

        newRow.innerHTML = `
        <th scope="row">${item.id}</th>
        <td>${item.asunto}</td>
        <td>${item.estado}</td>
        <td class="text-center">
            <button type="button" class="btn btn-success w-50" id="addBtn-${item.id}" onclick="handleUpload(${item.id})">Agregar</button>
        </td>
        <td class="text-center">
            ${item.ruta ? `<a href="${item.ruta}" target="_blank" class="text-primary">Link</a>` : "No disponible"}
        </td>
    `;
        tableBody.appendChild(newRow);
    });
})
.catch(error => console.error('Error al cargar los datos desde MongoDB:', error));



