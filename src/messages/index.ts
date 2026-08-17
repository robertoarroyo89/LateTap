import type { Locale } from "@/config/app";

const es = {
  nav: { home: "Inicio", explore: "Explorar", bookings: "Reservas", profile: "Perfil", forBusinesses: "Para negocios", login: "Entrar" },
  home: {
    live: "Disponibilidad real en Valencia",
    titleStart: "Tu próxima cita",
    titleEnd: "puede ser hoy.",
    subtitle: "Citas de última hora cerca de ti. Descubre qué acaba de quedar libre y reserva en segundos.",
    seeToday: "Ver citas para hoy",
    useLocation: "Usar mi ubicación",
    venuePayment: "Reserva ahora · Paga directamente en el establecimiento",
    categoriesKicker: "¿QUÉ TE APETECE?",
    categoriesTitle: "Encuentra tu momento",
    upcomingKicker: "EN LAS PRÓXIMAS HORAS",
    todayTitle: "Citas para hoy",
    all: "Ver todas",
    businessKicker: "LATETAP PARA NEGOCIOS",
    businessTitle: "¿Se ha liberado una cita?",
    businessSubtitle: "Conviértela en una nueva oportunidad en menos de 30 segundos.",
    publish: "Publicar una cita",
  },
  slot: { today: "Hoy", tomorrow: "Mañana", reserve: "Reservar", available: "Disponible", minutes: "min", payAtVenue: "Pagarás directamente en el establecimiento.", noLongerAvailable: "Esta cita ya no está disponible.", expired: "Esta cita ya ha pasado.", otherNearby: "Ver otras citas cerca" },
  explore: { title: "Citas disponibles", subtitle: "Algo acaba de quedar libre cerca de ti.", filters: "Filtros", date: "Fecha", category: "Categoría", radius: "Distancia", price: "Precio máximo", today: "Hoy", tomorrow: "Mañana", week: "Esta semana", any: "Cualquiera", sort: "Ordenar", soonest: "Más próximas", nearest: "Más cercanas", discount: "Mayor descuento", lowestPrice: "Menor precio", loadMore: "Ver más", emptyTitle: "Todavía no hay citas por aquí.", emptyBody: "Prueba a ampliar la distancia o mirar para mañana." },
  auth: { loginTitle: "Qué bien verte", registerTitle: "Crea tu cuenta", email: "Email", password: "Contraseña", name: "Nombre", continueGoogle: "Continuar con Google", login: "Entrar", register: "Crear cuenta", forgot: "He olvidado mi contraseña", noAccount: "¿Aún no tienes cuenta?", hasAccount: "¿Ya tienes cuenta?", terms: "Acepto los términos y la política de privacidad", resetTitle: "Recupera tu contraseña", reset: "Enviar enlace", resetSent: "Te hemos enviado un enlace para recuperar tu contraseña." },
  business: { verified: "Negocio verificado", nextSlots: "Próximas citas", noSlots: "Ahora mismo no hay citas disponibles.", notify: "Avísame cuando aparezca una", directions: "Cómo llegar", contact: "Contactar", services: "Servicios" },
  booking: { title: "Confirma tu reserva", confirm: "Confirmar reserva", successTitle: "Cita reservada", successBody: "La cita ya aparece en tus reservas.", viewBooking: "Ver mi reserva", cancel: "Cancelar reserva", upcoming: "Próximas", past: "Pasadas", cancelled: "Canceladas" },
  common: { valencia: "Valencia", back: "Volver", save: "Guardar", cancel: "Cancelar", loading: "Cargando", error: "No hemos podido completar la acción.", language: "Idioma" },
};

const en: typeof es = {
  nav: { home: "Home", explore: "Explore", bookings: "Bookings", profile: "Profile", forBusinesses: "For businesses", login: "Log in" },
  home: {
    live: "Live availability in Valencia",
    titleStart: "Your next appointment",
    titleEnd: "could be today.",
    subtitle: "Last-minute appointments near you. Discover what just opened up and book in seconds.",
    seeToday: "See today's appointments",
    useLocation: "Use my location",
    venuePayment: "Book now · Pay directly at the venue",
    categoriesKicker: "WHAT ARE YOU IN THE MOOD FOR?",
    categoriesTitle: "Find your moment",
    upcomingKicker: "IN THE NEXT FEW HOURS",
    todayTitle: "Appointments for today",
    all: "See all",
    businessKicker: "LATETAP FOR BUSINESS",
    businessTitle: "Did an appointment open up?",
    businessSubtitle: "Turn it into a new opportunity in under 30 seconds.",
    publish: "List an appointment",
  },
  slot: { today: "Today", tomorrow: "Tomorrow", reserve: "Book", available: "Available", minutes: "min", payAtVenue: "You will pay directly at the venue.", noLongerAvailable: "This appointment is no longer available.", expired: "This appointment has already passed.", otherNearby: "See other appointments nearby" },
  explore: { title: "Available appointments", subtitle: "Something just opened up near you.", filters: "Filters", date: "Date", category: "Category", radius: "Distance", price: "Maximum price", today: "Today", tomorrow: "Tomorrow", week: "This week", any: "Any", sort: "Sort", soonest: "Soonest", nearest: "Nearest", discount: "Biggest discount", lowestPrice: "Lowest price", loadMore: "Show more", emptyTitle: "No appointments around here yet.", emptyBody: "Try increasing the distance or checking tomorrow." },
  auth: { loginTitle: "Good to see you", registerTitle: "Create your account", email: "Email", password: "Password", name: "Name", continueGoogle: "Continue with Google", login: "Log in", register: "Create account", forgot: "I forgot my password", noAccount: "Don't have an account yet?", hasAccount: "Already have an account?", terms: "I accept the terms and privacy policy", resetTitle: "Reset your password", reset: "Send reset link", resetSent: "We sent you a password reset link." },
  business: { verified: "Verified business", nextSlots: "Next appointments", noSlots: "There are no available appointments right now.", notify: "Notify me when one appears", directions: "Directions", contact: "Contact", services: "Services" },
  booking: { title: "Confirm your booking", confirm: "Confirm booking", successTitle: "Appointment booked", successBody: "The appointment now appears in your bookings.", viewBooking: "View my booking", cancel: "Cancel booking", upcoming: "Upcoming", past: "Past", cancelled: "Cancelled" },
  common: { valencia: "Valencia", back: "Back", save: "Save", cancel: "Cancel", loading: "Loading", error: "We couldn't complete that action.", language: "Language" },
};

export type Messages = typeof es;
export function getMessages(locale: Locale): Messages { return locale === "en" ? en : es; }
