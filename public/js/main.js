const socket = io.connect();
const URL_BASE = 'http://localhost:8080';

function clickDesloguear() {
  window.location.replace("/logout");
  return false;
}

if(window.location.href.split('/').pop() == 'index') {
  // Al agregar items recibo los eventos 'listProducts' o 'listMensajes' y actualizo la interface.
  socket.on('listProducts', data => { renderProducts(data) });
  socket.on('listMensajes', data => { renderMensajes(data) });

  async function renderProducts(data) {
    const archivo = await fetch('plantillas/tabla.hbs');
    const archivoData = await archivo.text();
    const template = Handlebars.compile(archivoData);
    const result = template({ productos: data });
    document.getElementById('productos').innerHTML = result;
  }

  async function renderMensajes(data) {
    const archivo = await fetch('plantillas/mensajes.hbs');
    const archivoData = await archivo.text();
    const template = Handlebars.compile(archivoData);
    const result = template({ mensajes: data });
    document.getElementById('mensajes').innerHTML = result;
  }
};


// Agregar un nuevo producto.
function addProduct(e) {
  const inputTitle = document.getElementById('title');
  const inputPrice = document.getElementById('price');
  const inputThumb = document.getElementById('thumbnail');
  if (inputTitle.value == '' || inputPrice.value == '' || inputThumb.value == '') {
    alert('Por favor complete el formulario para agregar un nuevo producto.')
  } else {
    const newProd = {
      "title": inputTitle.value,
      "price": inputPrice.value,
      "thumbnail": inputThumb.value
    };
    agregarProducto(`${URL_BASE}/api/productos`, newProd)
    .then(() => {
      socket.emit('postProduct');
      inputTitle.value = '';
      inputPrice.value = '';
      inputThumb.value = '';
    }).catch(error => {
      console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
  }
  return false;
}

// Actualizar un producto
function updateProduct(e) {
  const inputID = document.getElementById('idUp');
  const inputTitle = document.getElementById('titleUp');
  const inputPrice = document.getElementById('priceUp');
  const inputThumb = document.getElementById('thumbnailUp');
  if (inputID.value == "") {
    alert('Por favor ingresa el ID del producto a actualizar.')
  }  else if (inputTitle.value == "" && inputPrice.value == "" && inputThumb.value == "") {
    alert('Por favor seleccione algun campo para actualizar.')
  } else {
    const newProd = {};
    if (inputTitle.value != "") {
      newProd.title = inputTitle.value;
    }
    if (inputPrice.value != "") {
      newProd.price = inputPrice.value;
    }
    if (inputThumb.value != "") {
      newProd.thumbnail = inputThumb.value;
    }
    actualizarProducto(`${URL_BASE}/api/productos/actualizar/${inputID.value}`, newProd)
    .then(() => {
      socket.emit('updateProduct');
      inputID.value = '';
      inputTitle.value = '';
      inputPrice.value = '';
      inputThumb.value = '';
    }).catch(error => {
      console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
  }
  return false;
}

// Eliminar producto.
function deleteProduct(e) {
  const inputID = document.getElementById('id');
  if (inputID.value == '') {
    alert('Por favor complete el formulario para eliminar el producto.')
  } else {
    eliminarProducto(`${URL_BASE}/api/productos/borrar/${inputID.value}`)
    .then(() => {
      socket.emit('deleteProduct');
      inputID.value = '';
    }).catch(error => {
      console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
  }
  return false;
}

// Agregar un nuevo mensaje.
function addMensaje(e) {
  const inputUsuario = document.getElementById('username');
  const inputTexto = document.getElementById('texto');
  
  if (inputUsuario.value == '' || inputTexto.value == '') {
    alert('Por favor complete el formulario para enviar un mensaje.')
  } else {
    const dt = new Date();
    const fecha = `${
    (dt.getMonth()+1).toString().padStart(2, '0')}/${
    dt.getDate().toString().padStart(2, '0')}/${
    dt.getFullYear().toString().padStart(4, '0')} ${
    dt.getHours().toString().padStart(2, '0')}:${
    dt.getMinutes().toString().padStart(2, '0')}:${
    dt.getSeconds().toString().padStart(2, '0')}`;
    
    const newMensaje = { username: inputUsuario.value, texto: inputTexto.value, fecha };
    agregarMensaje(`${URL_BASE}/api/mensajes`, newMensaje)
    .then(() => {
      socket.emit('postMensaje');
      inputTexto.value = '';
      inputTexto.focus();
    }).catch(error => {
      console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
  }
  return false;
}

// Funcion para hacer el POST de producto
async function agregarProducto(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.status == 401) {
    window.location.replace("/unauthorized");
  }
  return response.json();
}

// Funcion para hacer el PUT de producto
async function actualizarProducto(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.status == 401) {
    window.location.replace("/unauthorized");
  }
  return response.json();
}

// Funcion para hacer el DELETE de producto
async function eliminarProducto(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'DELETE'
  });
  if (response.status == 401) {
    window.location.replace("/unauthorized");
  }
  return response.json();
}

// Funcion para hacer el POST de mensaje
async function agregarMensaje(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.status == 401) {
    window.location.replace("/unauthorized");
  }
  return response.json();
}


async function destroySession() {
  try {
    const res = await fetch(`${URL_BASE}/api/auth/logout`);
    if (res.status == 200) {
      redirectLogin();
    } else {
      alert("Hubo un problema al cerrar sesion.")
    }
  } catch (err) {
    alert(err)
  }
}

function redirectLogin() {
  setTimeout(function() {
    window.location.replace("/login");
  }, 2000);
}