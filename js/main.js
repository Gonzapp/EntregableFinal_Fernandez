// Configuración Basica
const carrito = JSON.parse(localStorage.getItem('carrito')) || []
const mesas = JSON.parse(localStorage.getItem('mesas')) || {}
let mesa = null
let productos = []

let total = carrito.reduce((acc, item) => item && item.precio && item.cantidad ? acc + item.precio * item.cantidad : acc, 0)

const h2 = document.getElementById('numeroMesa')
const pedidoPrev = document.getElementById('pedidoPrev')
const infomov = document.getElementById('info-mov')
const botonesMesas = document.querySelectorAll('.mesa-boton')
const buscador = document.getElementById('buscadorProductos')
const contenedorProductos = document.getElementById('contenedorProductos')
const resumenPedido = document.getElementById('resumenPedido')
const resumenContenido = document.getElementById('resumenContenido')
const btnVaciarPedido = document.getElementById('btnVaciarPedido')


// Asignacion de mesas
for (let i = 0; i < botonesMesas.length; i++) {
    const boton = botonesMesas[i]
    boton.onclick = () => {
        const mesaSeleccionada = boton.getAttribute('data-mesa')
        inicializarMesa(mesaSeleccionada)
        botonesMesas.forEach(btn => btn.classList.remove('mesa-activa'))
        boton.classList.add('mesa-activa')
    }
}

function inicializarMesa(mesaSeleccionada) {
    try {
        // Guarda el carrito actual y total en la mesa anterior
        if (mesa && carrito.length > 0) {
            mesas[mesa] = { pedidos: [...carrito], total }
            localStorage.setItem('mesas', JSON.stringify(mesas))
        }

        mesa = mesaSeleccionada
        localStorage.setItem('mesa', mesa)
        h2.textContent = 'Mesa Numero: ' + mesa

        carrito.length = 0
        total = 0
        if (mesas[mesa]) {
            mesas[mesa].pedidos.forEach(item => carrito.push(item))
            total = mesas[mesa].total
        }

        localStorage.setItem('carrito', JSON.stringify(carrito))

        mostrarPedido()
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al inicializar la mesa. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'OK'
        })

    }
}

fetch("./db/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los datos')
        }
        return response.json()
    })
    .then(data => {
        productos = data 
        mostrarProductos() 
    // Renderizar los productos al cargar la página
    })
    .catch(error => {
        error
        const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            title: "Hubo un problema con la carga de productos",
            icon: "error"
        });
    })


// Para filtrar productos por el nombre
function mostrarProductos(filtro = '') {
    
    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(filtro.toLowerCase())
    )

    contenedorProductos.innerHTML = productosFiltrados.map(producto =>
        `<div class="itemBox">
            <p>${producto.nombre} - $${producto.precio}</p>
            <button class="btn btn-primary agregar-producto" data-id="${producto.id}">Agregar</button>
        </div>`
    ).join('')

    document.querySelectorAll('.agregar-producto').forEach(button => {
        button.onclick = () => {
            if (mesa > 0) {
                const idProducto = Number(button.getAttribute('data-id'))
                const productoSeleccionado = productos.find(p => p.id === idProducto)
                const Toast = Swal.mixin({
                    toast: true,
                    position: "bottom-end",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer
                        toast.onmouseleave = Swal.resumeTimer
                    }
                })
                Toast.fire({
                    icon: "success",
                    title: "Producto agregado"
                })
                agregarAlCarrito(productoSeleccionado)
            } else {
                Swal.fire({
                    title: "Atencion!",
                    text: "Primero debes seleccionar una mesa para continuar.",
                    imageUrl: "../img/alertMesa.png",
                    imageHeight: 243,
                    imageWidth: 700,
                    imageAlt: "Mesas a seleccionar"
                })
            }

        }
    })
}


function agregarAlCarrito(producto) {
    const itemExistente = carrito.find(item => item.id === producto.id)
    if (itemExistente) {
        itemExistente.cantidad += 1
    } else {
        const nuevoItem = { ...producto, cantidad: 1 }
        carrito.push(nuevoItem)
    }

    total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

    localStorage.setItem('carrito', JSON.stringify(carrito))
    if (mesa) {
        mesas[mesa] = { pedidos: [...carrito], total }
        localStorage.setItem('mesas', JSON.stringify(mesas))
    }

    mostrarPedido()
}

//

function mostrarPedido() {
    if (total <= 0) {
        pedidoPrev.innerHTML = ``
        pedidoPrev.classList.remove('pedido-hidden')
    } else {
        pedidoPrev.classList.add('pedido-hidden')
        pedidoPrev.innerHTML = `
            <h3>Pedido:</h3>
            <ul class="prev-pedido-item">${carrito.map(item => `
            <li>
                <button class="btn-delete btn btn-danger" data-id="${item.id}">x</button>
                 x${item.cantidad} - ${item.nombre} - $${item.precio * item.cantidad}
                <button class="btn-restar btn btn-danger" data-id="${item.id}">-</button>
                <button class="btn-sumar btn btn-success" data-id="${item.id}">+</button>
            </li>`).join('')}</ul>
            <p class="pedido-total">Total: $${total}</p>
            <div class="btns-pedido">
            <button id="btnVaciarPedido" class="btn btn-warning btnx">Vaciar Pedido</button>
            <button id="botonCarrito" class="btn btn-success btnx">Carrito</button>
            </div>`

        document.getElementById('botonCarrito').onclick = () => {
            localStorage.setItem('mesa', mesa)

            if (mesa && carrito.length > 0) {
                const swalWithBootstrapButtons = Swal.mixin({
                    customClass: {
                        confirmButton: "btn btn-success",
                        cancelButton: "btn btn-danger"
                    },
                    buttonsStyling: false
                })
                
                swalWithBootstrapButtons.fire({
                    title: "Finalizar mesa?",
                    text: "Ya les has ofrecido poste?",
                    showCancelButton: true,
                    confirmButtonText: "Continuar",
                    cancelButtonText: "No, Volver",
                    reverseButtons: true
                }).then((result) => {

                    if (result.isConfirmed) {
                        window.location.href = 'carrito.html'
                    } else (
                        result.dismiss === Swal.DismissReason.cancel
                    )
                })

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "El carrito está vacío."
                })
            }
        }
    }

    // Establece los eventos para los botones de sumar, restar y eliminar
    document.querySelectorAll('.btn-sumar').forEach(button => {
        button.onclick = () => {
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer
                    toast.onmouseleave = Swal.resumeTimer
                }
            })
            Toast.fire({
                icon: "success",
                title: "Producto agregado"
            })
            const idProducto = Number(button.getAttribute('data-id'))
            modificarCantidadProducto(idProducto, 1)
        }
    })

    document.querySelectorAll('.btn-restar').forEach(button => {
        button.onclick = () => {
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer
                    toast.onmouseleave = Swal.resumeTimer
                }
            })
            Toast.fire({
                title: "Producto quitado",
                icon: "success"
            })
            const idProducto = Number(button.getAttribute('data-id'))
            modificarCantidadProducto(idProducto, -1)
        }
    })

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.onclick = () => {
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer
                    toast.onmouseleave = Swal.resumeTimer
                }
            })
            Toast.fire({
                title: "Producto Eliminado",
                icon: "success"
            })
            const idProducto = Number(button.getAttribute('data-id'))
            borrarItem(idProducto)
        }
    })

    // Evento para vaciar el pedido
    const btnVaciarPedido = document.getElementById('btnVaciarPedido')
    if (btnVaciarPedido) {
        btnVaciarPedido.onclick = vaciarPedido
    }
}

function borrarItem(idProducto) {
    const item = carrito.find(p => p.id === idProducto)
    if (item) {
        item.cantidad = 0
        if (item.cantidad <= 0) {
            carrito.splice(carrito.indexOf(item), 1)
        }

        // Recalcula el total y actualiza el localStorage
        total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
        localStorage.setItem('carrito', JSON.stringify(carrito))
        if (mesa) {
            mesas[mesa] = { pedidos: [...carrito], total }
            localStorage.setItem('mesas', JSON.stringify(mesas))
        }

        mostrarPedido()
    }
// Actualiza la interfaz
    mostrarPedido() 
}


// Función para vaciar el pedido
function vaciarPedido() {

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
        title: "Quieres borrar el pedido de esta mesa?",
        text: "Los productos seran eliminado..",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, borrrar!",
        cancelButtonText: "No, cancelar!",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            swalWithBootstrapButtons.fire({
                title: "Pedido Eliminado",
                text: "La mesa fue restablecida.",
                icon: "success"
            })

            carrito.length = 0 
            total = 0 
            localStorage.removeItem('carrito')

            // Si la mesa tiene un pedido, se actualizar
            if (mesa && mesas[mesa]) {
                mesas[mesa].pedidos = []
                mesas[mesa].total = 0
                localStorage.setItem('mesas', JSON.stringify(mesas))
            }

            mostrarPedido() 
        } else if ( 
            result.dismiss === Swal.DismissReason.cancel
        ) {

            swalWithBootstrapButtons.fire({
                title: "Accion Cancelada",
                text: "Los productos siguen en el pedido :)",
                icon: "error"
            })
        }
    })
}

function modificarCantidadProducto(idProducto, cantidad) {
    const item = carrito.find(p => p.id === idProducto)
    if (item) {
        item.cantidad += cantidad
        if (item.cantidad <= 0) {
            carrito.splice(carrito.indexOf(item), 1)
        }

        total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
        localStorage.setItem('carrito', JSON.stringify(carrito))
        if (mesa) {
            mesas[mesa] = { pedidos: [...carrito], total }
            localStorage.setItem('mesas', JSON.stringify(mesas))
        }

        mostrarPedido()
    }
}


function finalizarPedido() {
    if (mesa && carrito.length > 0) {
        mesas[mesa] = { pedidos: [...carrito], total }
        localStorage.setItem('mesas', JSON.stringify(mesas))

        // Vaciar carrito y total
        carrito.length = 0
        total = 0
        localStorage.removeItem('carrito')

        mostrarPedido()
    }
}

buscador.oninput = () => {
    mostrarProductos(buscador.value)
}

// Muestra los productos inmediatamente al cargar la página
mostrarProductos()