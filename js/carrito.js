const btnRestaC = document.getElementById('btn-restaC')
const btnSumaC = document.getElementById('btn-sumaC')
const numComensales = document.getElementById('cantidadC')
const btnvolver = document.getElementById('btnvolver')
const btnFinal = document.getElementById('btnFinal')
const pagoContado = document.getElementById('pagoContado')
const precioEfectivo = 0.90
const servicioMesa = 500
const opciones = document.createElement('ul')

function calcularPrecioFinal(total, cantidadComensales, esPagoContado) {
    let precioFinal = total + (servicioMesa * cantidadComensales)
    if (esPagoContado) {
        precioFinal *= precioEfectivo // Aplica el 10% de descuento
    }
    return precioFinal.toFixed(2)
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    const mesaSeleccionada = localStorage.getItem('mesa')
    const mesas = JSON.parse(localStorage.getItem('mesas')) || {}
    const listaCarrito = document.getElementById('listaCarrito')

    if (mesaSeleccionada && mesas[mesaSeleccionada]) {
        const { pedidos, total } = mesas[mesaSeleccionada]
        const cantidadComensales = parseInt(numComensales.value) || 1
        const esPagoContado = pagoContado.checked
        const precioFinal = calcularPrecioFinal(total, cantidadComensales, esPagoContado)
        
        if (pedidos && pedidos.length > 0) {
            listaCarrito.innerHTML = `
                <h3>Pedido de la Mesa Número ${mesaSeleccionada}</h3>
                <ul class="pedido-item">
                    ${pedidos.map(item => `
                        <li>
                            ${item.cantidad}u - ${item.nombre} - <div>$${item.precio * item.cantidad}</div>
                        </li>
                    `).join('')}
                </ul>`
            opciones.innerHTML = `
                <li class="carrito-totales">Subtotal: <span>$${total}</span></li>
                <li class="carrito-totales">${cantidadComensales}x Servicio de mesa: <span>$${servicioMesa}</span></li>
                <li class="carrito-totales">Precio final: <span>$${precioFinal}</span></li>`
            opciones.classList.add('opciones-contenedor')
            listaCarrito.appendChild(opciones)
        } else {
            listaCarrito.innerHTML = `<p>No hay productos en el carrito.</p>`
        }
    } else {
        listaCarrito.innerHTML = `<p>No hay pedidos cargados.</p>`
    }
}

// Función para manejar cambios en la cantidad de comensales
function manejarCambiosDeComensales(operacion) {
    let valorActual = parseInt(numComensales.value)
    if (operacion === 'sumar') {
        numComensales.value = valorActual + 1
    } else if (operacion === 'restar' && valorActual > 1) {
        numComensales.value = valorActual - 1
    }
    actualizarCarrito()// Actualiza el carrito después de cambiar la cantidad
}


btnRestaC.onclick = () => manejarCambiosDeComensales('restar')
btnSumaC.onclick = () => manejarCambiosDeComensales('sumar')

// Actualizar el valor total del carrito cuando se slecciona pago contado
pagoContado.onchange = actualizarCarrito

actualizarCarrito()

// Evento para finalizar el pedido
btnFinal.onclick = () => {
    const mesaSeleccionada = localStorage.getItem('mesa')
    const mesas = JSON.parse(localStorage.getItem('mesas')) || {}

    if (mesaSeleccionada && mesas[mesaSeleccionada]) {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: "Finalizar pedido?",
            text: "Recuerda consultar la forma de pago",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Finalizar",
            cancelButtonText: "Cancelar",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              swalWithBootstrapButtons.fire({
                title: 'Pedido Finalizado',
                text: 'Gracias por su compra',
                icon: 'success'
              })
              let timerInterval
              Swal.fire({
                title: "Finalizando pedido",
                html: "Cargando articulos espere <b></b> Segundos.",
                timer: 3500,
                timerProgressBar: false,
                didOpen: () => {
                  Swal.showLoading()
                  const timer = Swal.getPopup().querySelector("b")
                  timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`
                  }, 100)
                },
                willClose: () => {
                  // Elimina solo los datos de la mesa seleccionada
                  delete mesas[mesaSeleccionada]
                  localStorage.setItem('mesas', JSON.stringify(mesas))
                  localStorage.removeItem('mesa')
                  window.location.href = 'index.html'
                  clearInterval(timerInterval)              
                }
                
              }).then((result) => {
                    
                    if (result.dismiss === Swal.DismissReason.timer) {
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
                            title: "Servicio de la mesa finalizado!",
                            icon: "success"                
                        })
                    }
                })
            } else(
              result.dismiss === Swal.DismissReason.cancel
            )
          })

    }
}

btnvolver.onclick = () => {
    window.location.href = 'index.html'
}



