// Datos base
const servicios = [
  { id: "aceite",  nombre: "Cambio de aceite",    precio: 50000 },
  { id: "frenos",  nombre: "Revisión de frenos",  precio: 70000 },
  { id: "bateria", nombre: "Cambio de batería",   precio: 80000 }
];

let solicitudes = [];

function CLP(n) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}
function mask(num) {
  const d = (num || "").replace(/\D+/g, "");
  return "•••• " + d.slice(-4).padStart(4, "•");
}
function setMinDatetime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + (15 - (now.getMinutes() % 15)));
  $("#fecha").attr("min", now.toISOString().slice(0, 16));
}

function llenarSelectServicios() {
  const $sel = $("#servicio").empty().append('<option value="">Selecciona un servicio…</option>');
  servicios.forEach(s => {
    $sel.append(`<option value="${s.id}">${s.nombre}</option>`);
  });
}
function mostrarPrecio() {
  const id = $("#servicio").val();
  const srv = servicios.find(s => s.id === id);
  $("#precio").text(srv ? CLP(srv.precio) : "—");
}
function agregarFilaTabla(item) {
  $("#cuerpoTabla").prepend(`
    <tr>
      <td><strong>${item.nombre}</strong><div class="small text-muted">${item.descripcion}</div></td>
      <td>${item.servicioNombre}</td>
      <td>${new Date(item.fecha).toLocaleString("es-CL")}</td>
      <td>${CLP(item.total)}</td>
      <td>${mask(item.tarjeta)}</td>
    </tr>
  `);
}
function limpiarTabla() {
  solicitudes = [];
  $("#cuerpoTabla").empty();
}
$(function () {
  llenarSelectServicios();
  mostrarPrecio();
  setMinDatetime();

  $("#servicio").on("change", mostrarPrecio);

  $("#tarjeta").on("input", function () {
    this.value = this.value.replace(/\D+/g, "").replace(/(.{4})/g, "$1 ").trim();
  });

  $("#formSolicitud").on("submit", function (e) {
    e.preventDefault();

    const nombre  = $("#nombre").val().trim();
    const idSrv   = $("#servicio").val();
    const desc    = $("#descripcion").val().trim();
    const fecha   = $("#fecha").val();
    const tarjeta = $("#tarjeta").val().trim();
    const titular = $("#titular").val().trim();
    const cvv     = $("#cvv").val().trim();

    if (!nombre || !idSrv || !desc || !fecha || !tarjeta || !titular || !cvv) {
      $("#mensaje").removeClass("d-none alert-success").addClass("alert alert-info")
                   .text("Completa todos los campos.");
      return;
    }
    const digits = tarjeta.replace(/\s|-/g, "");
    if (digits.length < 12) {
      $("#mensaje").removeClass("d-none alert-success").addClass("alert alert-info")
                   .text("Número de tarjeta muy corto (simulado).");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      $("#mensaje").removeClass("d-none alert-success").addClass("alert alert-info")
                   .text("CVV inválido (simulado).");
      return;
    }

    const srv = servicios.find(s => s.id === idSrv);
    const item = {
      id: Date.now().toString(),
      nombre,
      servicioId: idSrv,
      servicioNombre: srv.nombre,
      descripcion: desc,
      fecha,
      total: srv.precio,
      tarjeta,
      titular
    };
    solicitudes.unshift(item);

    agregarFilaTabla(item);

    $("#mensaje").removeClass("d-none alert-info").addClass("alert alert-success")
                 .text("¡Solicitud guardada (sólo en esta sesión)!");
    this.reset();
    mostrarPrecio();
    setMinDatetime();
  });

  $("#btnLimpiarTabla").on("click", function () {
    if (confirm("¿Borrar todas las filas de esta tabla? (Se pierden)")) {
      limpiarTabla();
    }
  });
});
