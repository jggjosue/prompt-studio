import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Política de Cookies | Prompt Studio',
  description: 'Política de Cookies de Prompt Studio.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiesPolicyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Política de Cookies
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Última actualización: <span className="font-medium text-foreground">2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>Bienvenido a Prompt Studio, disponible en https://www.prompstudio.com, operado por Magzin LLC, 800 Third Avenue Associates, New York, NY 10022, United States.</p>
            <p>La presente Política de Cookies explica qué son las cookies, cómo las utilizamos, qué tipos de cookies empleamos, con qué finalidad se utilizan, cuánto tiempo permanecen almacenadas y cuáles son los derechos del usuario respecto a su uso.</p>
            <p>Esta Política complementa nuestra Política de Privacidad y nuestros Términos y Condiciones, formando parte integral del marco legal de Prompt Studio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 1. Introducción
              </h2>
            </section>
            <p>Prompt Studio utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de la Plataforma, mejorar la experiencia de navegación, proteger las cuentas de los usuarios, procesar pagos de forma segura, analizar el rendimiento del sitio y ofrecer determinadas funcionalidades relacionadas con nuestros servicios.</p>
            <p>Al acceder por primera vez a la Plataforma, el usuario podrá visualizar un aviso de cookies mediante el cual podrá aceptar, rechazar o configurar determinadas categorías de cookies, cuando la legislación aplicable así lo requiera.</p>
            <p>El uso continuado de la Plataforma podrá implicar el almacenamiento de determinadas cookies estrictamente necesarias para el funcionamiento del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.1 Finalidad</h3>
            <p>Las cookies permiten, entre otras funciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Recordar preferencias del usuario.</li>
              <li>Mejorar el rendimiento del sitio.</li>
              <li>Analizar el comportamiento de navegación.</li>
              <li>Medir conversiones.</li>
              <li>Detectar fraude.</li>
              <li>Proteger la seguridad.</li>
              <li>Optimizar el funcionamiento de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.2 Alcance</h3>
            <p>Esta Política aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitio web de Prompt Studio.</li>
              <li>Aplicaciones web asociadas.</li>
              <li>Área de clientes.</li>
              <li>Panel de administración cuando corresponda.</li>
              <li>Recursos descargables que utilicen tecnologías similares.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.3 Aceptación</h3>
            <p>Cuando la legislación aplicable lo exija, Prompt Studio solicitará el consentimiento del usuario antes de instalar cookies no esenciales.</p>
            <p>Las cookies estrictamente necesarias podrán instalarse sin consentimiento previo cuando resulten indispensables para prestar el servicio solicitado por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.4 Cambios</h3>
            <p>Prompt Studio podrá actualizar esta Política de Cookies cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambien los proveedores tecnológicos.</li>
              <li>Se incorporen nuevas funcionalidades.</li>
              <li>Cambie la legislación aplicable.</li>
              <li>Se implementen nuevas herramientas analíticas.</li>
              <li>Se modifique el funcionamiento de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.5 Legislación aplicable</h3>
            <p>Esta Política ha sido elaborada considerando, entre otras normas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (GDPR/RGPD).</li>
              <li>Directiva ePrivacy de la Unión Europea.</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>Otras normas aplicables sobre privacidad y comunicaciones electrónicas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.6 Relación con otros documentos</h3>
            <p>Esta Política deberá interpretarse conjuntamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Política de Privacidad.</li>
              <li>Términos y Condiciones.</li>
              <li>Política de Reembolsos.</li>
              <li>Política de Licencias.</li>
              <li>Acuerdo de Suscripción Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.7 Contacto</h3>
            <p>Para cualquier consulta relacionada con esta Política de Cookies, el usuario podrá comunicarse con:</p>
            <p>Prompt Studio</p>
            <p>Sitio web: https://www.prompstudio.com</p>
            <p>Correo electrónico: support@prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.8 Definiciones</h3>
            <p>A efectos de esta Política:</p>
            <p>Cookie: archivo de texto almacenado en el dispositivo del usuario.</p>
            <p>Tecnologías similares: almacenamiento local, identificadores, píxeles, etiquetas (“tags”), SDKs y otras tecnologías que permiten reconocer dispositivos o sesiones.</p>
            <p>Usuario: cualquier persona que acceda o utilice Prompt Studio.</p>
            <p>Proveedor: empresa que instala o administra una cookie.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 2. ¿Qué son las Cookies?
              </h2>
            </section>
            <p>Las cookies son pequeños archivos de texto que un sitio web almacena en el navegador o dispositivo del usuario cuando visita una página web.</p>
            <p>Su finalidad principal es permitir que el sitio recuerde determinada información entre visitas, facilitando el funcionamiento de los servicios y mejorando la experiencia de navegación.</p>
            <p>Las cookies no son programas, no contienen virus y no pueden ejecutar código por sí mismas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Funcionamiento</h3>
            <p>Cuando el usuario visita Prompt Studio:</p>
            <p>1.	El navegador solicita la página.</p>
            <p>2.	El servidor responde con el contenido solicitado.</p>
            <p>3.	Determinadas cookies pueden almacenarse en el dispositivo.</p>
            <p>4.	En visitas posteriores, dichas cookies permiten reconocer la sesión o recordar preferencias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Información que pueden almacenar</h3>
            <p>Dependiendo de su finalidad, una cookie puede almacenar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador de sesión.</li>
              <li>Estado de autenticación.</li>
              <li>Idioma preferido.</li>
              <li>Preferencias de navegación.</li>
              <li>Configuración del sitio.</li>
              <li>Identificadores anónimos para analítica.</li>
              <li>Información relacionada con la seguridad.</li>
            </ul>
            <p>Las cookies utilizadas por Prompt Studio no almacenan contraseñas en texto plano ni información completa de tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Tecnologías similares</h3>
            <p>Además de cookies tradicionales, Prompt Studio podrá utilizar tecnologías similares como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Local Storage.</li>
              <li>Session Storage.</li>
              <li>Web Beacons.</li>
              <li>Pixel Tags.</li>
              <li>SDKs.</li>
              <li>Identificadores persistentes.</li>
            </ul>
            <p>Estas tecnologías cumplen funciones equivalentes y, cuando resulte aplicable, se regirán por esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Finalidades generales</h3>
            <p>Las cookies pueden utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Recordar preferencias.</li>
              <li>Procesar pagos.</li>
              <li>Detectar fraude.</li>
              <li>Analizar el uso del sitio.</li>
              <li>Medir el rendimiento.</li>
              <li>Mejorar la experiencia del usuario.</li>
              <li>Proteger la Plataforma frente a accesos no autorizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Cookies propias y de terceros</h3>
            <p>Prompt Studio utiliza:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cookies propias, instaladas directamente por Prompt Studio.</li>
              <li>Cookies de terceros, instaladas por proveedores especializados que prestan servicios para la Plataforma.</li>
            </ul>
            <p>Cada proveedor trata la información conforme a sus propias políticas de privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.6 Duración</h3>
            <p>Las cookies pueden clasificarse según su duración en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cookies de sesión.</li>
              <li>Cookies persistentes.</li>
            </ul>
            <p>La duración específica dependerá de cada cookie y de su finalidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.7 Necesidad</h3>
            <p>Algunas cookies son imprescindibles para que Prompt Studio funcione correctamente.</p>
            <p>Otras únicamente se utilizan cuando el usuario presta su consentimiento, de conformidad con la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.8 Protección de la privacidad</h3>
            <p>Prompt Studio procura minimizar el uso de cookies y utilizar únicamente aquellas que resultan necesarias para prestar sus servicios, mejorar la Plataforma o cumplir obligaciones legales.</p>
            <p>El tratamiento de la información obtenida mediante cookies se realiza conforme a nuestra Política de Privacidad.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 3. Tipos de Cookies Utilizadas
              </h2>
            </section>
            <p>Prompt Studio utiliza diferentes categorías de cookies y tecnologías similares para garantizar el funcionamiento de la Plataforma, mejorar la experiencia del usuario, proteger las cuentas, procesar pagos, analizar el rendimiento y comprender el uso del sitio.</p>
            <p>Las cookies utilizadas pueden clasificarse según su finalidad, duración y proveedor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.1 Cookies estrictamente necesarias</h3>
            <p>Estas cookies son indispensables para el funcionamiento de Prompt Studio y no pueden desactivarse desde nuestros sistemas, ya que permiten prestar los servicios solicitados por el usuario.</p>
            <p>Entre otras funciones, permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Verificar la identidad del usuario.</li>
              <li>Recordar el estado de autenticación.</li>
              <li>Proteger la cuenta.</li>
              <li>Detectar actividad sospechosa.</li>
              <li>Procesar pagos de forma segura.</li>
              <li>Balancear la carga del sitio.</li>
              <li>Garantizar el funcionamiento básico de la Plataforma.</li>
            </ul>
            <p>Estas cookies no se utilizan con fines publicitarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.2 Cookies funcionales</h3>
            <p>Las cookies funcionales permiten recordar determinadas preferencias del usuario para ofrecer una experiencia personalizada.</p>
            <p>Pueden utilizarse para recordar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Idioma preferido.</li>
              <li>Zona horaria.</li>
              <li>Configuración de la interfaz.</li>
              <li>Preferencias del panel de usuario.</li>
              <li>Estado de determinadas opciones de navegación.</li>
              <li>Otras configuraciones elegidas por el usuario.</li>
            </ul>
            <p>Si el usuario desactiva estas cookies, algunas funciones podrán no comportarse de la forma esperada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.3 Cookies analíticas</h3>
            <p>Prompt Studio utiliza cookies analíticas para comprender cómo los usuarios interactúan con la Plataforma.</p>
            <p>Estas cookies permiten recopilar información estadística, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitantes.</li>
              <li>Páginas visitadas.</li>
              <li>Tiempo de permanencia.</li>
              <li>Flujo de navegación.</li>
              <li>Eventos de interacción.</li>
              <li>Conversión de usuarios.</li>
              <li>Rendimiento de determinadas funcionalidades.</li>
            </ul>
            <p>La información se utiliza exclusivamente para mejorar nuestros servicios y optimizar la experiencia de navegación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.4 Cookies de rendimiento</h3>
            <p>Estas cookies ayudan a identificar problemas técnicos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Velocidad de carga.</li>
              <li>Rendimiento del sitio.</li>
              <li>Errores de navegación.</li>
              <li>Disponibilidad del servicio.</li>
              <li>Optimización de recursos.</li>
              <li>Estabilidad general de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.5 Cookies relacionadas con pagos</h3>
            <p>Cuando el usuario realiza una compra o contrata una suscripción, determinados proveedores de pago podrán utilizar cookies técnicas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar transacciones.</li>
              <li>Validar el pago.</li>
              <li>Detectar fraude.</li>
              <li>Cumplir obligaciones regulatorias.</li>
              <li>Proteger las operaciones financieras.</li>
            </ul>
            <p>Prompt Studio no almacena información completa de tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.6 Cookies de seguridad</h3>
            <p>Estas cookies permiten proteger la Plataforma frente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos no autorizados.</li>
              <li>Ataques automatizados.</li>
              <li>Bots maliciosos.</li>
              <li>Robo de sesiones.</li>
              <li>Intentos de fraude.</li>
              <li>Ataques de fuerza bruta.</li>
            </ul>
            <p>Su utilización es esencial para mantener un entorno seguro.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.7 Cookies propias</h3>
            <p>Las cookies propias son aquellas instaladas directamente por Prompt Studio para prestar sus servicios.</p>
            <p>Se utilizan principalmente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión del usuario.</li>
              <li>Recordar configuraciones.</li>
              <li>Administrar preferencias.</li>
              <li>Gestionar determinadas funcionalidades internas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.8 Cookies de terceros</h3>
            <p>Prompt Studio también utiliza cookies instaladas por proveedores tecnológicos especializados.</p>
            <p>Actualmente, estos proveedores pueden incluir servicios relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Analítica web.</li>
              <li>Infraestructura.</li>
              <li>Seguridad.</li>
              <li>Distribución de contenido.</li>
            </ul>
            <p>Cada proveedor trata la información conforme a sus propios términos y políticas de privacidad.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 4. Cookies Estrictamente Necesarias
              </h2>
            </section>
            <p>Las cookies estrictamente necesarias son esenciales para que Prompt Studio funcione correctamente.</p>
            <p>Sin ellas no sería posible prestar determinados servicios solicitados por el usuario, como iniciar sesión, mantener una sesión activa o completar una compra.</p>
            <p>Estas cookies no requieren consentimiento previo cuando la legislación aplicable las considera imprescindibles para prestar el servicio solicitado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.1 Cookies de autenticación</h3>
            <p>Prompt Studio utiliza servicios especializados de autenticación que emplean cookies para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificar al usuario autenticado.</li>
              <li>Mantener la sesión iniciada.</li>
              <li>Recordar el estado de autenticación.</li>
              <li>Administrar sesiones activas.</li>
              <li>Proteger el acceso a la cuenta.</li>
            </ul>
            <p>Estas cookies son esenciales para utilizar las funcionalidades que requieren autenticación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.2 Cookies de sesión</h3>
            <p>Las cookies de sesión permiten mantener activa la conexión del usuario mientras navega por la Plataforma.</p>
            <p>Generalmente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se crean al iniciar sesión.</li>
              <li>Permanecen activas durante la sesión.</li>
              <li>Se eliminan al cerrar el navegador o finalizar la sesión.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.3 Cookies de seguridad</h3>
            <p>Estas cookies ayudan a proteger Prompt Studio mediante funciones como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prevención de ataques.</li>
              <li>Protección frente a bots.</li>
              <li>Validación de solicitudes.</li>
              <li>Protección contra falsificación de solicitudes (CSRF).</li>
              <li>Integridad de la sesión.</li>
            </ul>
            <p>Su finalidad es exclusivamente garantizar la seguridad del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.4 Cookies de infraestructura</h3>
            <p>La infraestructura tecnológica de Prompt Studio puede utilizar cookies técnicas relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Balanceo de carga.</li>
              <li>Distribución de contenido.</li>
              <li>Optimización del rendimiento.</li>
              <li>Protección frente a ataques.</li>
              <li>Disponibilidad del servicio.</li>
            </ul>
            <p>Estas cookies son administradas por la infraestructura que soporta la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.5 Cookies utilizadas actualmente</h3>
            <p>A continuación se muestran ejemplos de cookies estrictamente necesarias que pueden utilizarse en Prompt Studio.</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>__session	Clerk	Sesión	Mantener la sesión autenticada</p>
            <p>__client	Clerk	Hasta 1 año	Identificación segura del cliente</p>
            <p>__clerk_db_jwt	Clerk	Sesión	Validación de autenticación</p>
            <p>cf_clearance	Cloudflare	Variable	Protección contra bots y seguridad</p>
            <p>__stripe_sid	Stripe	Sesión	Seguridad durante el proceso de pago</p>
            <p>__stripe_mid	Stripe	Hasta 1 año	Prevención de fraude en pagos</p>
            <p>Importante: Los nombres, la duración y el funcionamiento de estas cookies pueden variar cuando los proveedores actualizan sus plataformas. Prompt Studio procura mantener esta lista actualizada, pero los proveedores pueden modificar sus cookies sin previo aviso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.6 Desactivación</h3>
            <p>Las cookies estrictamente necesarias no pueden deshabilitarse desde Prompt Studio, ya que su eliminación puede impedir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Iniciar sesión.</li>
              <li>Acceder al contenido Premium.</li>
              <li>Realizar compras.</li>
              <li>Mantener la seguridad de la cuenta.</li>
              <li>Completar procesos de autenticación.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.7 Base jurídica</h3>
            <p>Cuando resulte aplicable el Reglamento General de Protección de Datos (GDPR/RGPD), el uso de estas cookies se fundamenta en el interés legítimo de Prompt Studio y en la necesidad de prestar el servicio expresamente solicitado por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.8 Conservación</h3>
            <p>La duración de estas cookies dependerá de su finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las cookies de sesión se eliminan al cerrar el navegador.</li>
              <li>Las cookies persistentes permanecerán activas únicamente durante el tiempo necesario para cumplir su finalidad o hasta que el usuario las elimine desde su navegador.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 5. Cookies Analíticas
              </h2>
            </section>
            <p>Prompt Studio utiliza herramientas de analítica para comprender cómo los usuarios interactúan con la Plataforma, identificar oportunidades de mejora, medir el rendimiento del sitio y optimizar la experiencia general.</p>
            <p>Estas cookies no son esenciales para el funcionamiento del sitio y, cuando la legislación aplicable lo requiera (como el GDPR o la Directiva ePrivacy), únicamente se instalarán con el consentimiento previo del usuario.</p>
            <p>Prompt Studio utiliza actualmente servicios analíticos proporcionados por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics 4</li>
              <li>Firebase Analytics</li>
              <li>Vercel Analytics</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.1 Finalidad</h3>
            <p>Las cookies analíticas permiten recopilar información estadística sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitantes.</li>
              <li>Páginas visitadas.</li>
              <li>Tiempo de permanencia.</li>
              <li>Navegación entre páginas.</li>
              <li>Eventos realizados.</li>
              <li>Descargas.</li>
              <li>Conversiones.</li>
              <li>Rendimiento del sitio.</li>
              <li>Dispositivos utilizados.</li>
              <li>Navegadores.</li>
              <li>País o región aproximada.</li>
            </ul>
            <p>La información recopilada se utiliza únicamente con fines estadísticos y para mejorar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.2 Google Analytics 4</h3>
            <p>Prompt Studio utiliza Google Analytics 4 (GA4) para analizar el comportamiento de navegación de los usuarios.</p>
            <p>Google Analytics puede recopilar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitas.</li>
              <li>Sesiones.</li>
              <li>Eventos.</li>
              <li>Interacciones.</li>
              <li>Páginas vistas.</li>
              <li>Conversiones.</li>
              <li>Dispositivo utilizado.</li>
              <li>Sistema operativo.</li>
              <li>Navegador.</li>
              <li>Resolución de pantalla.</li>
              <li>País o región aproximada.</li>
            </ul>
            <p>Prompt Studio no utiliza Google Analytics para identificar personalmente a los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.3 Cookies utilizadas por Google Analytics 4</h3>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>_ga	Google Analytics	2 años	Distinguir usuarios</p>
            <p>_ga_*	Google Analytics	2 años	Mantener el estado de la sesión y estadísticas</p>
            <p>_gid (si aplica)	Google Analytics	24 horas	Diferenciar usuarios durante un día</p>
            <p>_gat (si aplica)	Google Analytics	1 minuto	Limitar solicitudes</p>
            <p>Nota: Google puede modificar el nombre o funcionamiento de estas cookies con futuras actualizaciones de Google Analytics.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.4 Firebase Analytics</h3>
            <p>Prompt Studio puede utilizar Firebase Analytics para registrar eventos relacionados con la interacción del usuario dentro de la Plataforma.</p>
            <p>Entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Apertura de páginas.</li>
              <li>Descargas.</li>
              <li>Compras.</li>
              <li>Conversión.</li>
              <li>Eventos personalizados.</li>
              <li>Rendimiento de determinadas funciones.</li>
            </ul>
            <p>Firebase Analytics utiliza identificadores propios para generar estadísticas agregadas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.5 Cookies e identificadores utilizados por Firebase</h3>
            <p>Dependiendo del navegador y dispositivo, Firebase puede utilizar:</p>
            <p>Cookie / Identificador	Duración aproximada	Finalidad</p>
            <p>_firebase_*	Variable	Analítica y eventos</p>
            <p>App Instance ID	Persistente	Identificación anónima del dispositivo</p>
            <p>Firebase Installation ID	Persistente	Estadísticas y rendimiento</p>
            <p>Los nombres exactos podrán variar según las versiones publicadas por Google.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.6 Vercel Analytics</h3>
            <p>Prompt Studio utiliza Vercel Analytics para medir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rendimiento del sitio.</li>
              <li>Velocidad de carga.</li>
              <li>Web Vitals.</li>
              <li>Tráfico.</li>
              <li>Estabilidad.</li>
              <li>Rendimiento de páginas.</li>
            </ul>
            <p>Vercel Analytics está diseñado para recopilar métricas agregadas con un enfoque orientado a la privacidad.</p>
            <p>Dependiendo de la configuración utilizada, puede funcionar con una cantidad mínima o incluso sin utilizar cookies tradicionales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.7 Transferencias internacionales</h3>
            <p>Los datos recopilados por herramientas analíticas podrán procesarse en servidores ubicados fuera del país de residencia del usuario.</p>
            <p>Cuando resulte aplicable, Prompt Studio procurará que dichas transferencias se realicen utilizando mecanismos adecuados conforme al GDPR y demás normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.8 Consentimiento</h3>
            <p>Cuando la legislación lo requiera:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics.</li>
              <li>Firebase Analytics.</li>
              <li>Otras herramientas analíticas.</li>
            </ul>
            <p>únicamente se activarán después de que el usuario haya otorgado su consentimiento mediante el banner de cookies.</p>
            <p>El usuario podrá modificar o retirar dicho consentimiento en cualquier momento.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 6. Cookies Relacionadas con Pagos
              </h2>
            </section>
            <p>Prompt Studio utiliza Stripe para procesar de forma segura compras individuales, suscripciones y demás operaciones económicas realizadas en la Plataforma.</p>
            <p>Stripe puede utilizar cookies y tecnologías similares para garantizar la seguridad de las transacciones y prevenir actividades fraudulentas.</p>
            <p>Prompt Studio no almacena información completa de tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.1 Finalidad</h3>
            <p>Las cookies relacionadas con pagos permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar compras.</li>
              <li>Validar transacciones.</li>
              <li>Detectar fraude.</li>
              <li>Administrar sesiones de pago.</li>
              <li>Cumplir obligaciones regulatorias.</li>
              <li>Proteger la información financiera.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.2 Cookies utilizadas por Stripe</h3>
            <p>Stripe puede utilizar cookies como las siguientes:</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>__stripe_sid	Stripe	Sesión	Mantener la sesión de pago</p>
            <p>__stripe_mid	Stripe	Hasta 1 año	Prevención de fraude</p>
            <p>m	Stripe	Hasta 2 años	Identificación del dispositivo para seguridad</p>
            <p>Los nombres y la duración pueden variar conforme Stripe actualice sus sistemas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.3 Información procesada</h3>
            <p>Durante una operación de pago, Stripe podrá procesar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador de la transacción.</li>
              <li>Dirección IP.</li>
              <li>Navegador.</li>
              <li>Dispositivo.</li>
              <li>País aproximado.</li>
              <li>Información necesaria para validar el pago.</li>
            </ul>
            <p>Prompt Studio únicamente recibe la información necesaria para confirmar la compra y activar los servicios correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.4 Seguridad</h3>
            <p>Las cookies utilizadas por Stripe ayudan a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Detectar intentos de fraude.</li>
              <li>Evitar pagos no autorizados.</li>
              <li>Identificar comportamientos sospechosos.</li>
              <li>Cumplir los estándares internacionales de seguridad financiera.</li>
            </ul>
            <p>Estas cookies son consideradas esenciales para el correcto funcionamiento del proceso de pago.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.5 Conservación</h3>
            <p>La duración dependerá de la finalidad de cada cookie.</p>
            <p>Algunas se eliminan al finalizar la sesión, mientras que otras permanecen durante un período limitado para facilitar futuras operaciones seguras.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.6 Base jurídica</h3>
            <p>Cuando las cookies de Stripe sean estrictamente necesarias para completar una compra solicitada por el usuario, su utilización se fundamenta en la ejecución del contrato y en el interés legítimo de garantizar la seguridad de las transacciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.7 Proveedor independiente</h3>
            <p>Stripe actúa como proveedor independiente de servicios de pago.</p>
            <p>El tratamiento de la información financiera se encuentra regulado por las políticas y términos de Stripe.</p>
            <p>Prompt Studio recomienda revisar dichas políticas para obtener información adicional sobre el tratamiento de datos realizado por este proveedor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.8 Protección del usuario</h3>
            <p>Prompt Studio no tiene acceso a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número completo de tarjetas.</li>
              <li>Código CVV/CVC.</li>
              <li>PIN bancarios.</li>
              <li>Credenciales de entidades financieras.</li>
            </ul>
            <p>Toda esta información es procesada directamente por Stripe utilizando sus propios mecanismos de seguridad.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 7. Cookies de Autenticación (Clerk)
              </h2>
            </section>
            <p>Prompt Studio utiliza Clerk como proveedor de autenticación para gestionar de forma segura el registro, inicio de sesión, recuperación de cuentas, sesiones activas y protección de identidad de los usuarios.</p>
            <p>Las cookies utilizadas por Clerk son estrictamente necesarias, ya que permiten prestar los servicios de autenticación solicitados por el usuario.</p>
            <p>Estas cookies no se utilizan para publicidad ni para crear perfiles comerciales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 Finalidad</h3>
            <p>Las cookies de autenticación permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Recordar el estado de autenticación.</li>
              <li>Validar la identidad del usuario.</li>
              <li>Gestionar múltiples sesiones.</li>
              <li>Proteger el acceso a la cuenta.</li>
              <li>Detectar accesos sospechosos.</li>
              <li>Implementar autenticación multifactor cuando corresponda.</li>
              <li>Garantizar la continuidad de la sesión.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Cookies utilizadas por Clerk</h3>
            <p>A continuación se muestran ejemplos de cookies que pueden utilizarse mediante Clerk.</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>__session	Clerk	Sesión	Mantener la sesión autenticada</p>
            <p>__client	Clerk	Hasta 1 año	Identificación segura del cliente</p>
            <p>__clerk_db_jwt	Clerk	Sesión	Validación del token de autenticación</p>
            <p>__clerk_handshake	Clerk	Sesión	Establecimiento seguro de autenticación</p>
            <p>__clerk_redirect_count	Clerk	Sesión	Gestión de redirecciones durante el inicio de sesión</p>
            <p>Nota: Clerk puede modificar el nombre, duración o funcionamiento de estas cookies conforme evolucione su plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Información procesada</h3>
            <p>Las cookies de autenticación pueden procesar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador de sesión.</li>
              <li>Estado de autenticación.</li>
              <li>Tokens temporales.</li>
              <li>Identificadores cifrados.</li>
              <li>Configuración de autenticación.</li>
              <li>Información técnica necesaria para proteger la cuenta.</li>
            </ul>
            <p>Prompt Studio no tiene acceso a las contraseñas del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Seguridad</h3>
            <p>Las cookies administradas por Clerk ayudan a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Evitar secuestro de sesiones.</li>
              <li>Detectar intentos de acceso no autorizados.</li>
              <li>Implementar autenticación segura.</li>
              <li>Reducir riesgos de fraude.</li>
              <li>Proteger cuentas frente a ataques automatizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Duración</h3>
            <p>Dependiendo de su finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Algunas cookies permanecen únicamente durante la sesión.</li>
              <li>Otras pueden mantenerse durante un período limitado para recordar el dispositivo autorizado.</li>
            </ul>
            <p>La duración podrá modificarse conforme a las políticas de Clerk.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Base jurídica</h3>
            <p>Cuando resulte aplicable el Reglamento General de Protección de Datos (GDPR), estas cookies se utilizan con fundamento en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La ejecución del contrato.</li>
              <li>El interés legítimo de proteger la seguridad de la Plataforma.</li>
              <li>La prestación del servicio solicitado por el usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Eliminación</h3>
            <p>Las cookies de Clerk podrán eliminarse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cerrando sesión.</li>
              <li>Eliminando las cookies desde el navegador.</li>
              <li>Eliminando la cuenta cuando corresponda.</li>
            </ul>
            <p>No obstante, su eliminación podrá requerir un nuevo proceso de autenticación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Consecuencias de desactivarlas</h3>
            <p>Si el usuario bloquea estas cookies podrá experimentar problemas como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imposibilidad de iniciar sesión.</li>
              <li>Cierre inesperado de la sesión.</li>
              <li>Pérdida de acceso a recursos Premium.</li>
              <li>Fallos en la autenticación.</li>
              <li>Errores al administrar la cuenta.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 8. Cookies de Infraestructura y Seguridad
              </h2>
            </section>
            <p>Prompt Studio utiliza servicios especializados para garantizar la disponibilidad, estabilidad, rendimiento y seguridad de la Plataforma.</p>
            <p>Estas tecnologías pueden instalar cookies estrictamente necesarias relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Distribución de contenido.</li>
              <li>Protección contra ataques.</li>
              <li>Balanceo de carga.</li>
              <li>Optimización del rendimiento.</li>
              <li>Entrega de recursos estáticos.</li>
            </ul>
            <p>Actualmente Prompt Studio utiliza infraestructura proporcionada por Cloudflare y Vercel.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.1 Finalidad</h3>
            <p>Estas cookies permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger la Plataforma frente a ataques.</li>
              <li>Identificar tráfico automatizado.</li>
              <li>Distribuir el contenido mediante CDN.</li>
              <li>Optimizar tiempos de respuesta.</li>
              <li>Mejorar la disponibilidad del servicio.</li>
              <li>Administrar la infraestructura.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.2 Cookies utilizadas por Cloudflare</h3>
            <p>Cloudflare puede utilizar cookies como:</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>cf_clearance	Cloudflare	Variable	Validación de seguridad</p>
            <p>__cf_bm	Cloudflare	30 minutos	Detección de bots</p>
            <p>cf_chl_rc_*	Cloudflare	Sesión	Gestión de desafíos de seguridad</p>
            <p>Estas cookies ayudan a distinguir usuarios legítimos de tráfico automatizado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.3 Cookies utilizadas por Vercel</h3>
            <p>Dependiendo de la configuración de la infraestructura, Vercel podrá utilizar cookies técnicas relacionadas con:</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>_vercel_jwt (si aplica)	Vercel	Sesión	Autenticación interna</p>
            <p>_vercel_session (si aplica)	Vercel	Sesión	Gestión técnica de la sesión</p>
            <p>Cookies técnicas internas	Vercel	Variable	Rendimiento e infraestructura</p>
            <p>Algunas implementaciones de Vercel Analytics funcionan sin cookies o utilizando únicamente datos agregados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.4 Protección contra ataques</h3>
            <p>Las cookies de infraestructura ayudan a proteger Prompt Studio frente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ataques DDoS.</li>
              <li>Bots maliciosos.</li>
              <li>Fuerza bruta.</li>
              <li>Escaneo automatizado.</li>
              <li>Intentos de explotación de vulnerabilidades.</li>
              <li>Abuso de recursos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.5 Optimización del rendimiento</h3>
            <p>Estas tecnologías permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reducir tiempos de carga.</li>
              <li>Mejorar la distribución de contenido.</li>
              <li>Equilibrar la carga entre servidores.</li>
              <li>Optimizar la entrega de recursos estáticos.</li>
              <li>Incrementar la disponibilidad de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.6 Base jurídica</h3>
            <p>Las cookies de infraestructura se consideran estrictamente necesarias porque permiten prestar de forma segura el servicio solicitado por el usuario.</p>
            <p>Cuando resulte aplicable, su utilización se fundamenta en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La ejecución del contrato.</li>
              <li>El interés legítimo en garantizar la seguridad y disponibilidad del sitio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.7 Conservación</h3>
            <p>La mayoría de estas cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permanecen únicamente durante la sesión.</li>
              <li>O se conservan durante el tiempo estrictamente necesario para proteger la infraestructura.</li>
            </ul>
            <p>Su duración exacta dependerá del proveedor correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.8 Actualizaciones</h3>
            <p>Cloudflare y Vercel pueden modificar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los nombres de sus cookies.</li>
              <li>Su duración.</li>
              <li>Su funcionamiento.</li>
            </ul>
            <p>Prompt Studio actualizará esta Política cuando dichos cambios resulten relevantes y tenga conocimiento de ellos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 9. Cookies Funcionales
              </h2>
            </section>
            <p>Las cookies funcionales permiten que Prompt Studio recuerde determinadas configuraciones y preferencias seleccionadas por el usuario con el fin de proporcionar una experiencia más personalizada y eficiente.</p>
            <p>Estas cookies no son imprescindibles para el funcionamiento básico de la Plataforma, pero mejoran significativamente la experiencia de navegación.</p>
            <p>Cuando la legislación aplicable lo requiera, estas cookies únicamente se instalarán tras obtener el consentimiento del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.1 Finalidad</h3>
            <p>Las cookies funcionales pueden utilizarse para recordar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Idioma preferido.</li>
              <li>Tema de la interfaz (claro u oscuro).</li>
              <li>Preferencias de visualización.</li>
              <li>Configuración del panel de usuario.</li>
              <li>Preferencias relacionadas con la navegación.</li>
              <li>Consentimiento de cookies.</li>
              <li>Otras opciones elegidas por el usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.2 Personalización</h3>
            <p>Estas cookies permiten que Prompt Studio recuerde determinadas configuraciones entre visitas, evitando que el usuario tenga que volver a configurarlas en cada acceso.</p>
            <p>Por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener el idioma seleccionado.</li>
              <li>Recordar preferencias de interfaz.</li>
              <li>Recordar la aceptación del banner de cookies.</li>
              <li>Mantener determinadas configuraciones de accesibilidad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.3 Cookies funcionales propias</h3>
            <p>Prompt Studio podrá utilizar cookies propias para almacenar preferencias relacionadas exclusivamente con el funcionamiento interno de la Plataforma.</p>
            <p>Estas cookies no se utilizan para crear perfiles publicitarios ni para vender información personal.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.4 Ejemplos de cookies funcionales</h3>
            <p>Dependiendo de las funcionalidades habilitadas, Prompt Studio podrá utilizar cookies similares a las siguientes:</p>
            <p>Cookie	Proveedor	Duración aproximada	Finalidad</p>
            <p>ps_language	Prompt Studio	1 año	Recordar el idioma seleccionado</p>
            <p>ps_theme	Prompt Studio	1 año	Recordar el tema visual</p>
            <p>ps_cookie_consent	Prompt Studio	12 meses	Recordar las preferencias de cookies</p>
            <p>ps_preferences	Prompt Studio	12 meses	Guardar configuraciones del usuario</p>
            <p>Importante: Los nombres anteriores son ejemplos de cookies propias. Si Prompt Studio utiliza nombres distintos en producción, esta tabla deberá actualizarse para reflejar los nombres reales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.5 Duración</h3>
            <p>La mayoría de las cookies funcionales permanecen almacenadas entre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La duración de la sesión.</li>
              <li>Algunos meses.</li>
              <li>Un máximo de doce (12) meses.</li>
            </ul>
            <p>La duración exacta dependerá de la finalidad de cada cookie.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.6 Eliminación</h3>
            <p>El usuario podrá eliminar las cookies funcionales desde la configuración de su navegador.</p>
            <p>Al hacerlo, algunas preferencias dejarán de recordarse y será necesario configurarlas nuevamente en futuras visitas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.7 Base jurídica</h3>
            <p>Cuando resulte aplicable el Reglamento General de Protección de Datos (GDPR/RGPD), estas cookies se utilizarán:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Con el consentimiento del usuario, cuando sea requerido por la legislación.</li>
              <li>O sobre la base del interés legítimo cuando resulten necesarias para mejorar la experiencia del servicio sin afectar significativamente la privacidad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.8 Impacto de su desactivación</h3>
            <p>Si el usuario rechaza estas cookies, Prompt Studio continuará funcionando, aunque determinadas funcionalidades podrán perder personalización, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El idioma volverá al valor predeterminado.</li>
              <li>El tema visual podrá restablecerse.</li>
              <li>Será necesario volver a configurar determinadas preferencias.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 10. Gestión del Consentimiento de Cookies
              </h2>
            </section>
            <p>Prompt Studio respeta el derecho del usuario a decidir sobre el uso de cookies no esenciales.</p>
            <p>Cuando la legislación aplicable lo requiera, el usuario podrá aceptar, rechazar o configurar el uso de determinadas categorías de cookies antes de que sean instaladas en su dispositivo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.1 Banner de cookies</h3>
            <p>En la primera visita a Prompt Studio, el usuario podrá visualizar un banner de cookies que permitirá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aceptar todas las cookies.</li>
              <li>Rechazar las cookies no esenciales.</li>
              <li>Configurar las preferencias por categorías.</li>
              <li>Obtener información adicional sobre cada tipo de cookie.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.2 Categorías configurables</h3>
            <p>Cuando sea técnicamente posible, el usuario podrá configurar de forma independiente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cookies estrictamente necesarias.</li>
              <li>Cookies funcionales.</li>
              <li>Cookies analíticas.</li>
              <li>Cookies de rendimiento.</li>
            </ul>
            <p>Las cookies estrictamente necesarias permanecerán activas porque son indispensables para el funcionamiento de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.3 Modificación del consentimiento</h3>
            <p>El usuario podrá modificar sus preferencias de cookies en cualquier momento mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El panel de configuración de cookies disponible en la Plataforma, cuando exista.</li>
              <li>La configuración del navegador.</li>
              <li>La eliminación de cookies previamente almacenadas.</li>
            </ul>
            <p>Los cambios surtirán efecto para futuras sesiones o conforme a las limitaciones técnicas aplicables.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.4 Retirada del consentimiento</h3>
            <p>El consentimiento podrá retirarse en cualquier momento.</p>
            <p>La retirada no afectará la licitud del tratamiento realizado antes de dicha revocación.</p>
            <p>Una vez retirado el consentimiento, Prompt Studio dejará de instalar las categorías de cookies correspondientes, salvo aquellas estrictamente necesarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.5 Configuración del navegador</h3>
            <p>La mayoría de los navegadores permiten al usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ver las cookies almacenadas.</li>
              <li>Eliminar cookies.</li>
              <li>Bloquear cookies de terceros.</li>
              <li>Bloquear todas las cookies.</li>
              <li>Configurar excepciones por sitio web.</li>
            </ul>
            <p>La configuración dependerá del navegador utilizado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.6 Consecuencias de bloquear cookies</h3>
            <p>El bloqueo de determinadas cookies podrá afectar funcionalidades como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inicio de sesión.</li>
              <li>Recordatorio de preferencias.</li>
              <li>Analítica.</li>
              <li>Personalización.</li>
              <li>Algunas funciones Premium.</li>
            </ul>
            <p>El bloqueo de cookies estrictamente necesarias puede impedir el correcto funcionamiento de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.7 Derechos del usuario</h3>
            <p>Dependiendo de la legislación aplicable, el usuario podrá ejercer derechos relacionados con el tratamiento de información obtenida mediante cookies, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Derecho de acceso.</li>
              <li>Derecho de rectificación.</li>
              <li>Derecho de supresión.</li>
              <li>Derecho de oposición.</li>
              <li>Derecho a limitar el tratamiento.</li>
              <li>Derecho a la portabilidad.</li>
              <li>Derecho a retirar el consentimiento.</li>
            </ul>
            <p>Estos derechos podrán ejercerse conforme a la Política de Privacidad de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.8 Cumplimiento normativo</h3>
            <p>Prompt Studio procura gestionar el consentimiento de cookies conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (GDPR/RGPD).</li>
              <li>Directiva ePrivacy.</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>Demás normativa aplicable en materia de privacidad y comunicaciones electrónicas.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 11. Cómo Deshabilitar las Cookies
              </h2>
            </section>
            <p>El usuario puede administrar, bloquear o eliminar las cookies almacenadas en su dispositivo mediante la configuración de su navegador o utilizando las herramientas de gestión de consentimiento disponibles en Prompt Studio.</p>
            <p>La desactivación de determinadas cookies puede afectar el funcionamiento de algunas funcionalidades de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.1 Configuración desde el navegador</h3>
            <p>La mayoría de los navegadores modernos permiten al usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ver las cookies almacenadas.</li>
              <li>Eliminar cookies individuales.</li>
              <li>Eliminar todas las cookies.</li>
              <li>Bloquear cookies de terceros.</li>
              <li>Bloquear todas las cookies.</li>
              <li>Configurar excepciones para determinados sitios web.</li>
              <li>Solicitar confirmación antes de almacenar nuevas cookies.</li>
            </ul>
            <p>La forma de acceder a estas opciones dependerá del navegador utilizado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.2 Navegadores compatibles</h3>
            <p>Los usuarios pueden consultar las instrucciones oficiales de su navegador para administrar las cookies.</p>
            <p>Los navegadores más comunes incluyen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Microsoft Edge</li>
              <li>Safari</li>
              <li>Opera</li>
              <li>Brave</li>
            </ul>
            <p>Las instrucciones pueden variar entre versiones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.3 Eliminación manual</h3>
            <p>El usuario puede eliminar las cookies previamente almacenadas en cualquier momento desde la configuración de su navegador.</p>
            <p>Después de eliminar las cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Será necesario iniciar sesión nuevamente.</li>
              <li>Algunas preferencias dejarán de recordarse.</li>
              <li>El banner de cookies podrá mostrarse nuevamente.</li>
              <li>Determinadas configuraciones volverán a sus valores predeterminados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.4 Bloqueo de cookies de terceros</h3>
            <p>La mayoría de los navegadores permiten bloquear únicamente las cookies instaladas por terceros.</p>
            <p>Esta opción puede reducir el seguimiento analítico sin afectar significativamente el funcionamiento básico del sitio.</p>
            <p>No obstante, algunos servicios externos podrían dejar de funcionar correctamente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.5 Modo incógnito o navegación privada</h3>
            <p>Muchos navegadores ofrecen un modo de navegación privada o incógnito.</p>
            <p>En este modo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las cookies normalmente se eliminan al cerrar la ventana.</li>
              <li>No se conservan determinadas preferencias.</li>
              <li>El usuario deberá autenticarse nuevamente en futuras sesiones.</li>
            </ul>
            <p>El modo incógnito no impide necesariamente que terceros recopilen información conforme a sus propias políticas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.6 Consecuencias de bloquear cookies</h3>
            <p>La desactivación de determinadas cookies puede provocar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imposibilidad de iniciar sesión.</li>
              <li>Pérdida de preferencias personalizadas.</li>
              <li>Errores durante el proceso de compra.</li>
              <li>Problemas con las suscripciones.</li>
              <li>Funcionamiento limitado del área privada.</li>
              <li>Menor calidad en la experiencia de navegación.</li>
            </ul>
            <p>Prompt Studio recomienda mantener activas las cookies estrictamente necesarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.7 Gestión desde Prompt Studio</h3>
            <p>Cuando esté disponible, Prompt Studio ofrecerá un panel para que el usuario pueda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revisar las categorías de cookies.</li>
              <li>Modificar su consentimiento.</li>
              <li>Activar o desactivar cookies opcionales.</li>
              <li>Consultar información actualizada sobre cada categoría.</li>
            </ul>
            <p>Los cambios realizados se aplicarán conforme a las limitaciones técnicas de cada navegador y proveedor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.8 Actualización de preferencias</h3>
            <p>El usuario podrá modificar sus preferencias de cookies en cualquier momento.</p>
            <p>Prompt Studio respetará dichas preferencias siempre que sea técnicamente posible y conforme a la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 12. Transferencias Internacionales de Datos Relacionadas con Cookies
              </h2>
            </section>
            <p>Algunos proveedores tecnológicos utilizados por Prompt Studio pueden procesar información derivada de cookies en servidores ubicados fuera del país de residencia del usuario.</p>
            <p>Estas transferencias internacionales se realizan únicamente cuando son necesarias para prestar los servicios ofrecidos por la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.1 Procesamiento internacional</h3>
            <p>Dependiendo del servicio utilizado, la información obtenida mediante cookies podrá procesarse en distintos países.</p>
            <p>Esto puede ocurrir cuando Prompt Studio utiliza servicios relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Analítica.</li>
              <li>Infraestructura en la nube.</li>
              <li>Almacenamiento.</li>
              <li>Seguridad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.2 Medidas de protección</h3>
            <p>Prompt Studio procura seleccionar proveedores que implementen medidas adecuadas para proteger la información personal.</p>
            <p>Cuando resulte aplicable, dichas medidas podrán incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cláusulas Contractuales Tipo (Standard Contractual Clauses).</li>
              <li>Decisiones de adecuación emitidas por autoridades competentes.</li>
              <li>Medidas técnicas y organizativas de seguridad.</li>
              <li>Compromisos contractuales de confidencialidad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.3 Reglamento General de Protección de Datos (GDPR)</h3>
            <p>Cuando resulte aplicable el GDPR, Prompt Studio procurará que cualquier transferencia internacional de datos derivada del uso de cookies cumpla con los mecanismos previstos por dicho Reglamento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.4 Proveedores internacionales</h3>
            <p>Los proveedores tecnológicos utilizados por Prompt Studio pueden operar desde distintos países y procesar información conforme a sus propias políticas de privacidad.</p>
            <p>Prompt Studio recomienda al usuario consultar dichas políticas para obtener información adicional sobre el tratamiento realizado por cada proveedor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.5 Seguridad durante la transferencia</h3>
            <p>La información transmitida entre el dispositivo del usuario y los servicios utilizados por Prompt Studio se protege mediante protocolos de comunicación seguros, incluyendo el uso de cifrado HTTPS/TLS cuando corresponda.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.6 Conservación de la información</h3>
            <p>Los datos obtenidos mediante cookies se conservarán únicamente durante el tiempo necesario para cumplir la finalidad para la cual fueron recopilados o conforme a las obligaciones legales aplicables.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.7 Derechos del usuario</h3>
            <p>Cuando una transferencia internacional implique el tratamiento de datos personales, el usuario podrá ejercer los derechos reconocidos por la legislación aplicable conforme a la Política de Privacidad de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.8 Transparencia</h3>
            <p>Prompt Studio procurará mantener actualizada la información relacionada con los proveedores tecnológicos utilizados y con las transferencias internacionales que resulten relevantes para los usuarios.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 13. Cookies de Marketing y Publicidad
              </h2>
            </section>
            <p>Actualmente, Prompt Studio no utiliza cookies destinadas a publicidad personalizada, remarketing ni redes publicitarias de terceros.</p>
            <p>Nuestra Plataforma está enfocada en la venta de recursos digitales y la prestación de servicios relacionados con Inteligencia Artificial, por lo que no mostramos anuncios personalizados basados en el comportamiento del usuario.</p>
            <p>En caso de incorporar en el futuro herramientas de publicidad o remarketing, Prompt Studio actualizará esta Política de Cookies y, cuando la legislación aplicable lo requiera, solicitará previamente el consentimiento correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.1 Estado actual</h3>
            <p>A la fecha de la última actualización de esta Política:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No utilizamos Google Ads Remarketing.</li>
              <li>No utilizamos Meta Pixel (Facebook Pixel).</li>
              <li>No utilizamos TikTok Pixel.</li>
              <li>No utilizamos LinkedIn Insight Tag.</li>
              <li>No utilizamos Microsoft Advertising (Bing Ads).</li>
              <li>No utilizamos plataformas de publicidad conductual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.2 Finalidad futura</h3>
            <p>Si Prompt Studio incorpora servicios publicitarios en el futuro, las cookies correspondientes únicamente podrán utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Medir campañas publicitarias.</li>
              <li>Analizar conversiones.</li>
              <li>Mostrar anuncios relevantes.</li>
              <li>Limitar la frecuencia de visualización de anuncios.</li>
              <li>Medir el rendimiento de campañas de marketing.</li>
            </ul>
            <p>Siempre que exista una base legal para ello.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.3 Consentimiento</h3>
            <p>Cuando la legislación aplicable lo exija, Prompt Studio solicitará el consentimiento del usuario antes de instalar cookies destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Publicidad personalizada.</li>
              <li>Remarketing.</li>
              <li>Segmentación comercial.</li>
              <li>Perfilado publicitario.</li>
              <li>Seguimiento entre sitios web.</li>
            </ul>
            <p>El usuario podrá retirar dicho consentimiento en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.4 Publicidad personalizada</h3>
            <p>Prompt Studio no crea perfiles comerciales utilizando cookies para mostrar anuncios personalizados.</p>
            <p>Si esta situación cambia en el futuro:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se actualizará esta Política.</li>
              <li>Se modificará el banner de consentimiento.</li>
              <li>Se informará adecuadamente a los usuarios.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.5 Redes publicitarias</h3>
            <p>Actualmente Prompt Studio no comparte información obtenida mediante cookies con redes publicitarias para mostrar anuncios personalizados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.6 Remarketing</h3>
            <p>Prompt Studio no realiza campañas de remarketing basadas en cookies.</p>
            <p>En caso de implementar esta funcionalidad, se informará claramente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué proveedor la realiza.</li>
              <li>Qué cookies utiliza.</li>
              <li>Su duración.</li>
              <li>Su finalidad.</li>
              <li>Cómo deshabilitarlas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.7 Venta de datos</h3>
            <p>Prompt Studio no vende información personal obtenida mediante cookies.</p>
            <p>Asimismo, no comercializa perfiles de usuarios con fines publicitarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.8 Actualizaciones</h3>
            <p>Si en el futuro Prompt Studio incorpora herramientas publicitarias o servicios de marketing comportamental, esta Política será actualizada antes de que dichas tecnologías entren en funcionamiento, respetando los derechos del usuario y la normativa aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 14. Cookies Futuras y Nuevos Servicios
              </h2>
            </section>
            <p>Prompt Studio evoluciona continuamente y podrá incorporar nuevas funcionalidades, herramientas tecnológicas y proveedores especializados.</p>
            <p>Como consecuencia, podrán añadirse nuevas cookies o tecnologías similares cuando resulten necesarias para ofrecer nuevos servicios o mejorar los existentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.1 Incorporación de nuevos proveedores</h3>
            <p>Prompt Studio podrá integrar nuevos proveedores relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inteligencia Artificial.</li>
              <li>Infraestructura.</li>
              <li>Seguridad.</li>
              <li>Analítica.</li>
              <li>Procesamiento de pagos.</li>
              <li>Autenticación.</li>
              <li>Almacenamiento.</li>
              <li>Atención al cliente.</li>
              <li>Automatización.</li>
            </ul>
            <p>Cada incorporación será evaluada desde el punto de vista técnico y de protección de datos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.2 Nuevas categorías de cookies</h3>
            <p>En el futuro podrán incorporarse nuevas categorías de cookies relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Funciones avanzadas.</li>
              <li>Herramientas colaborativas.</li>
              <li>Nuevos servicios Premium.</li>
              <li>Plataformas educativas.</li>
              <li>Automatizaciones.</li>
              <li>Sistemas de soporte.</li>
              <li>Integraciones con terceros.</li>
            </ul>
            <p>Siempre que exista una finalidad legítima y, cuando sea necesario, el consentimiento del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.3 Actualización de tablas</h3>
            <p>Cuando se incorporen nuevas cookies, Prompt Studio actualizará las tablas contenidas en esta Política indicando, cuando sea posible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre de la cookie.</li>
              <li>Proveedor.</li>
              <li>Duración.</li>
              <li>Finalidad.</li>
              <li>Categoría.</li>
              <li>Base jurídica.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.4 Eliminación de cookies obsoletas</h3>
            <p>Cuando un proveedor deje de utilizar una determinada cookie o ésta sea sustituida por otra, Prompt Studio actualizará esta Política eliminando las referencias obsoletas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.5 Cambios tecnológicos</h3>
            <p>La evolución tecnológica puede implicar el uso de mecanismos distintos a las cookies tradicionales, tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Local Storage.</li>
              <li>Session Storage.</li>
              <li>IndexedDB.</li>
              <li>Identificadores anónimos.</li>
              <li>Tecnologías equivalentes.</li>
            </ul>
            <p>Cuando dichas tecnologías tengan una finalidad similar a las cookies, serán tratadas conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.6 Información al usuario</h3>
            <p>Cuando un cambio afecte de manera significativa el tratamiento de la información obtenida mediante cookies, Prompt Studio podrá informar a los usuarios mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Banner de cookies.</li>
              <li>Avisos en la Plataforma.</li>
              <li>Correo electrónico.</li>
              <li>Actualización de esta Política.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.7 Compatibilidad normativa</h3>
            <p>Cualquier nueva tecnología incorporada procurará cumplir con la normativa aplicable en materia de privacidad, protección de datos y comunicaciones electrónicas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.8 Compromiso de transparencia</h3>
            <p>Prompt Studio se compromete a mantener esta Política de Cookies actualizada y a informar de manera clara y accesible sobre las tecnologías utilizadas para garantizar que los usuarios puedan tomar decisiones informadas respecto al uso de sus datos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 15. Derechos del Usuario respecto a las Cookies
              </h2>
            </section>
            <p>Prompt Studio respeta el derecho de los usuarios a controlar el tratamiento de la información recopilada mediante cookies y tecnologías similares.</p>
            <p>Dependiendo de la legislación aplicable y del lugar de residencia del usuario, éste podrá ejercer diversos derechos relacionados con el uso de cookies y con los datos personales asociados a ellas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.1 Derecho a ser informado</h3>
            <p>El usuario tiene derecho a recibir información clara, transparente y fácilmente accesible acerca de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las cookies utilizadas por Prompt Studio.</li>
              <li>La finalidad de cada cookie.</li>
              <li>Su duración.</li>
              <li>Los proveedores que las administran.</li>
              <li>La base jurídica para su utilización.</li>
              <li>Las opciones disponibles para administrarlas.</li>
            </ul>
            <p>Esta Política de Cookies tiene como finalidad garantizar dicho derecho.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.2 Derecho a otorgar o retirar el consentimiento</h3>
            <p>Cuando la legislación aplicable lo requiera, el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aceptar todas las cookies.</li>
              <li>Rechazar las cookies no esenciales.</li>
              <li>Configurar categorías específicas.</li>
              <li>Retirar el consentimiento previamente otorgado.</li>
            </ul>
            <p>La retirada del consentimiento no afectará la licitud del tratamiento realizado antes de dicha revocación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.3 Derecho de acceso</h3>
            <p>Cuando las cookies impliquen el tratamiento de datos personales, el usuario podrá solicitar información sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué datos personales se recopilan.</li>
              <li>Con qué finalidad se utilizan.</li>
              <li>Durante cuánto tiempo se conservan.</li>
              <li>Con quién se comparten.</li>
              <li>Qué proveedores intervienen en el tratamiento.</li>
            </ul>
            <p>El ejercicio de este derecho se realizará conforme a la Política de Privacidad de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.4 Derecho de rectificación</h3>
            <p>Si los datos personales asociados a cookies resultaran inexactos o incompletos, el usuario podrá solicitar su rectificación conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.5 Derecho de supresión</h3>
            <p>Cuando resulte legalmente procedente, el usuario podrá solicitar la eliminación de sus datos personales obtenidos mediante cookies.</p>
            <p>Este derecho podrá estar sujeto a determinadas excepciones cuando la conservación sea necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Detectar fraude.</li>
              <li>Proteger derechos legales.</li>
              <li>Garantizar la seguridad de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.6 Derecho de oposición y limitación</h3>
            <p>Cuando resulte aplicable, el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Oponerse al tratamiento de determinados datos.</li>
              <li>Solicitar la limitación del tratamiento.</li>
              <li>Restringir determinadas categorías de cookies.</li>
            </ul>
            <p>Prompt Studio evaluará cada solicitud conforme a la legislación vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.7 Derecho a la portabilidad</h3>
            <p>Cuando el tratamiento se base en el consentimiento o en la ejecución de un contrato y sea técnicamente posible, el usuario podrá solicitar la portabilidad de sus datos personales conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.8 Ejercicio de derechos</h3>
            <p>Para ejercer cualquiera de los derechos anteriores, el usuario podrá contactar con Prompt Studio mediante:</p>
            <p>Correo electrónico:</p>
            <p>support@prompstudio.com</p>
            <p>Prompt Studio responderá dentro de los plazos previstos por la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 16. Conservación de la Información Obtenida mediante Cookies
              </h2>
            </section>
            <p>Prompt Studio conserva la información obtenida mediante cookies únicamente durante el tiempo necesario para cumplir las finalidades descritas en esta Política o durante el período exigido por la legislación aplicable.</p>
            <p>La duración dependerá del tipo de cookie utilizada y de su finalidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.1 Cookies de sesión</h3>
            <p>Las cookies de sesión permanecen activas únicamente mientras el usuario mantiene abierta la sesión de navegación.</p>
            <p>Generalmente se eliminan automáticamente cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se cierra el navegador.</li>
              <li>Se cierra la sesión.</li>
              <li>Finaliza la sesión autenticada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.2 Cookies persistentes</h3>
            <p>Las cookies persistentes permanecen almacenadas durante un período determinado para recordar preferencias o facilitar futuras visitas.</p>
            <p>Su duración puede variar desde unos pocos días hasta varios meses o años, dependiendo de su finalidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.3 Conservación por proveedores</h3>
            <p>Cuando las cookies sean administradas por terceros, el período de conservación será determinado por el proveedor correspondiente conforme a sus propias políticas.</p>
            <p>Prompt Studio recomienda consultar las políticas de privacidad de dichos proveedores para obtener información detallada sobre sus períodos de conservación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.4 Eliminación automática</h3>
            <p>Una vez cumplida la finalidad para la que fueron instaladas, las cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Expirarán automáticamente.</li>
              <li>Serán sustituidas cuando corresponda.</li>
              <li>O podrán ser eliminadas por el usuario desde su navegador.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.5 Conservación por obligaciones legales</h3>
            <p>En determinados casos, la información derivada del uso de cookies podrá conservarse durante un período adicional cuando sea necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Atender requerimientos de autoridades competentes.</li>
              <li>Resolver controversias.</li>
              <li>Defender derechos legales.</li>
              <li>Investigar incidentes de seguridad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.6 Información anonimizada</h3>
            <p>Prompt Studio podrá conservar información estadística anonimizada obtenida mediante herramientas analíticas.</p>
            <p>Una vez anonimizada de forma irreversible, dicha información dejará de considerarse dato personal conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.7 Medidas de seguridad</h3>
            <p>Durante el período de conservación, Prompt Studio implementará medidas técnicas y organizativas razonables para proteger la información frente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos no autorizados.</li>
              <li>Alteración.</li>
              <li>Divulgación.</li>
              <li>Pérdida.</li>
              <li>Destrucción.</li>
              <li>Uso indebido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.8 Minimización de datos</h3>
            <p>Prompt Studio aplica el principio de minimización de datos y procurará conservar únicamente la información estrictamente necesaria para cumplir las finalidades descritas en esta Política, eliminando o anonimizado los datos cuando ya no resulten necesarios.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 17. Actualizaciones de la Política de Cookies
              </h2>
            </section>
            <p>Prompt Studio podrá actualizar la presente Política de Cookies cuando resulte necesario para reflejar cambios en la legislación aplicable, en los servicios ofrecidos, en los proveedores tecnológicos utilizados o en las tecnologías implementadas en la Plataforma.</p>
            <p>Nuestro objetivo es mantener este documento claro, transparente y alineado con las mejores prácticas internacionales en materia de privacidad y protección de datos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.1 Derecho de actualización</h3>
            <p>Prompt Studio se reserva el derecho de modificar, complementar o sustituir esta Política de Cookies en cualquier momento.</p>
            <p>Las modificaciones podrán realizarse, entre otros motivos, por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios legislativos.</li>
              <li>Nuevas obligaciones regulatorias.</li>
              <li>Incorporación de nuevos proveedores.</li>
              <li>Implementación de nuevas tecnologías.</li>
              <li>Cambios en las herramientas analíticas.</li>
              <li>Mejoras en la seguridad.</li>
              <li>Cambios en el funcionamiento de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.2 Publicación de la versión vigente</h3>
            <p>La versión más reciente de esta Política estará disponible permanentemente en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización aparecerá al inicio o al final del documento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.3 Comunicación de cambios importantes</h3>
            <p>Cuando una modificación afecte significativamente la forma en que se utilizan las cookies o el tratamiento de la información asociada, Prompt Studio podrá informar a los usuarios mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Banner de cookies.</li>
              <li>Avisos en la Plataforma.</li>
              <li>Correo electrónico.</li>
              <li>Notificaciones dentro de la cuenta.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <p>Cuando la legislación lo requiera, se solicitará nuevamente el consentimiento del usuario antes de aplicar dichos cambios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.4 Entrada en vigor</h3>
            <p>Salvo que se indique expresamente otra fecha, las modificaciones entrarán en vigor desde el momento de su publicación en la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.5 Revisión periódica</h3>
            <p>Prompt Studio recomienda a los usuarios revisar periódicamente esta Política para mantenerse informados sobre las tecnologías utilizadas y las opciones disponibles para gestionar sus preferencias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.6 Cambios de proveedores</h3>
            <p>Si Prompt Studio incorpora, sustituye o elimina proveedores tecnológicos que utilicen cookies, esta Política será actualizada para reflejar dichos cambios cuando resulten relevantes para el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.7 Historial de versiones</h3>
            <p>Prompt Studio podrá conservar versiones anteriores de esta Política con fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Auditoría.</li>
              <li>Cumplimiento legal.</li>
              <li>Resolución de controversias.</li>
              <li>Evidencia documental.</li>
              <li>Mejora continua.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.8 Aceptación de cambios</h3>
            <p>El uso continuado de Prompt Studio después de la entrada en vigor de una actualización implica que el usuario reconoce haber tenido la oportunidad de revisar la versión vigente de esta Política.</p>
            <p>Cuando la legislación aplicable requiera un consentimiento expreso, Prompt Studio lo solicitará antes de activar las categorías de cookies correspondientes.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 18. Contacto y Autoridad de Protección de Datos
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de los usuarios distintos canales de contacto para resolver dudas relacionadas con el uso de cookies y el tratamiento de la información obtenida mediante las mismas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.1 Responsable del sitio web</h3>
            <p>Prompt Studio</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.2 Contacto</h3>
            <p>Para cualquier consulta relacionada con esta Política de Cookies, el usuario podrá comunicarse con:</p>
            <p>Correo electrónico oficial:</p>
            <p>support@prompstudio.com</p>
            <p>Prompt Studio procurará responder las consultas dentro de un plazo razonable y conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.3 Ejercicio de derechos</h3>
            <p>Las solicitudes relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso.</li>
              <li>Rectificación.</li>
              <li>Supresión.</li>
              <li>Oposición.</li>
              <li>Limitación del tratamiento.</li>
              <li>Portabilidad.</li>
              <li>Retirada del consentimiento.</li>
            </ul>
            <p>deberán realizarse conforme a la Política de Privacidad de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.4 Reclamaciones</h3>
            <p>Si el usuario considera que Prompt Studio no ha tratado adecuadamente la información relacionada con cookies o datos personales, podrá presentar una reclamación ante la autoridad de protección de datos competente conforme a la legislación de su país de residencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.5 Usuarios de la Unión Europea</h3>
            <p>Los usuarios ubicados en la Unión Europea podrán dirigirse a la autoridad de control competente conforme al Reglamento General de Protección de Datos (GDPR).</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.6 Usuarios de México</h3>
            <p>Los usuarios ubicados en México podrán ejercer los derechos previstos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y, cuando corresponda, presentar las reclamaciones ante la autoridad competente conforme a dicha legislación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.7 Usuarios de Estados Unidos</h3>
            <p>Los usuarios residentes en los Estados Unidos podrán ejercer los derechos que les reconozca la legislación estatal aplicable, incluyendo la California Consumer Privacy Act (CCPA) y la California Privacy Rights Act (CPRA) cuando resulten aplicables.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.8 Compromiso de transparencia</h3>
            <p>Prompt Studio mantiene un compromiso permanente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La transparencia.</li>
              <li>La privacidad.</li>
              <li>La protección de datos personales.</li>
              <li>La seguridad de la información.</li>
              <li>El cumplimiento normativo.</li>
              <li>La mejora continua de sus servicios.</li>
            </ul>
            <p>Las consultas de los usuarios relacionadas con esta Política serán atendidas con diligencia y buena fe.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 19. Disposiciones Finales
              </h2>
            </section>
            <p>La presente Política de Cookies forma parte integrante del marco legal de Prompt Studio y deberá interpretarse conjuntamente con la Política de Privacidad, los Términos y Condiciones y las demás políticas publicadas por la Plataforma.</p>
            <p>Su finalidad es garantizar que los usuarios conozcan de manera clara y transparente el uso de cookies y tecnologías similares.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.1 Integración con otros documentos</h3>
            <p>Esta Política complementa los siguientes documentos legales de Prompt Studio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Política de Privacidad.</li>
              <li>Términos y Condiciones.</li>
              <li>Política de Reembolsos.</li>
              <li>Política de Licencias.</li>
              <li>Acuerdo de Suscripción Premium.</li>
              <li>Política DMCA / Copyright.</li>
              <li>Programa de Afiliados.</li>
            </ul>
            <p>En caso de contradicción respecto al tratamiento de datos personales, prevalecerá la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.2 Independencia de las cláusulas</h3>
            <p>Si alguna disposición de esta Política fuera declarada inválida, ilegal o inaplicable por una autoridad competente, dicha circunstancia no afectará la validez del resto de las disposiciones.</p>
            <p>Las cláusulas restantes continuarán plenamente vigentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.3 No renuncia</h3>
            <p>La falta de ejercicio por parte de Prompt Studio de cualquiera de los derechos previstos en esta Política no constituirá una renuncia a dichos derechos.</p>
            <p>Cualquier renuncia deberá realizarse expresamente y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.4 Idioma</h3>
            <p>Prompt Studio podrá ofrecer versiones traducidas de esta Política.</p>
            <p>En caso de discrepancia entre distintas traducciones, prevalecerá la versión oficial publicada en español, salvo que una legislación imperativa establezca lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.5 Relación con el navegador</h3>
            <p>La administración de cookies también depende de la configuración del navegador utilizado por el usuario.</p>
            <p>Prompt Studio no controla las herramientas de gestión de cookies proporcionadas por navegadores o fabricantes de dispositivos.</p>
            <p>El usuario es responsable de revisar periódicamente dichas configuraciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.6 Tecnologías equivalentes</h3>
            <p>Las referencias realizadas en esta Política a “cookies” incluyen, cuando resulte aplicable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cookies HTTP.</li>
              <li>Local Storage.</li>
              <li>Session Storage.</li>
              <li>IndexedDB.</li>
              <li>Web Beacons.</li>
              <li>Pixel Tags.</li>
              <li>SDKs.</li>
              <li>Identificadores persistentes.</li>
              <li>Otras tecnologías equivalentes utilizadas para finalidades similares.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.7 Fecha de entrada en vigor</h3>
            <p>Fecha de entrada en vigor:</p>
            <p>1 de enero de 2026 (o la fecha que determine Prompt Studio).</p>
            <p>Última actualización:</p>
            <p>2026</p>
            <p>Prompt Studio podrá modificar esta Política conforme a la Sección 17.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.8 Conservación del consentimiento</h3>
            <p>Cuando la legislación aplicable lo permita, Prompt Studio podrá conservar un registro de las preferencias de consentimiento del usuario relacionadas con las cookies con el único propósito de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Demostrar el cumplimiento de las obligaciones legales.</li>
              <li>Recordar las preferencias seleccionadas.</li>
              <li>Evitar solicitar el consentimiento de forma innecesaria.</li>
              <li>Atender auditorías o requerimientos regulatorios.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 20. Declaración Oficial
              </h2>
            </section>
            <p>Prompt Studio mantiene un firme compromiso con la privacidad, la transparencia y la protección de la información de sus usuarios.</p>
            <p>La utilización de cookies y tecnologías similares tiene como finalidad ofrecer una Plataforma segura, eficiente y adaptada a las necesidades de quienes utilizan nuestros servicios.</p>
            <p>Prompt Studio procura utilizar únicamente aquellas cookies que resultan necesarias para prestar correctamente sus servicios o que hayan sido autorizadas por el usuario cuando la legislación aplicable así lo requiera.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.1 Compromiso con la privacidad</h3>
            <p>Prompt Studio se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respetar las preferencias de los usuarios.</li>
              <li>Minimizar la recopilación de información.</li>
              <li>Aplicar medidas razonables de seguridad.</li>
              <li>Informar de manera transparente sobre el uso de cookies.</li>
              <li>Cumplir la normativa aplicable en materia de privacidad y protección de datos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.2 Compromiso con la transparencia</h3>
            <p>Prompt Studio actualizará esta Política cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambien los proveedores tecnológicos.</li>
              <li>Se incorporen nuevas cookies.</li>
              <li>Se modifiquen las finalidades del tratamiento.</li>
              <li>Cambie la legislación aplicable.</li>
              <li>Se implementen nuevas funcionalidades.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.3 Uso responsable de la información</h3>
            <p>La información obtenida mediante cookies será utilizada únicamente para las finalidades descritas en esta Política y en la Política de Privacidad.</p>
            <p>Prompt Studio no vende datos personales obtenidos mediante cookies ni utiliza dicha información para crear perfiles comerciales destinados a terceros.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.4 Cumplimiento normativo</h3>
            <p>Prompt Studio procura cumplir, cuando resulte aplicable, con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (GDPR/RGPD).</li>
              <li>Directiva ePrivacy.</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>Otras normas nacionales e internacionales aplicables.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.5 Contacto oficial</h3>
            <p>Para cualquier consulta relacionada con esta Política de Cookies:</p>
            <p>Prompt Studio</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>support@prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.6 Aceptación</h3>
            <p>Cuando la legislación aplicable lo requiera, el usuario manifestará su consentimiento mediante el banner de cookies disponible en Prompt Studio.</p>
            <p>El consentimiento podrá ser retirado o modificado en cualquier momento conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.7 Revisión periódica</h3>
            <p>Prompt Studio recomienda revisar esta Política de Cookies periódicamente para mantenerse informado sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las tecnologías utilizadas.</li>
              <li>Las categorías de cookies.</li>
              <li>Los proveedores tecnológicos.</li>
              <li>Las opciones disponibles para gestionar el consentimiento.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.8 Declaración de cierre</h3>
            <p>Al continuar utilizando Prompt Studio, el usuario reconoce haber tenido acceso a esta Política de Cookies y comprende la forma en que la Plataforma utiliza cookies y tecnologías similares para prestar sus servicios.</p>
            <p>La presente Política constituye el documento oficial que regula el uso de cookies en Prompt Studio.</p>
            <p>Declaración Oficial</p>
            <p>Política de Cookies de Prompt Studio</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>support@prompstudio.com</p>
            <p>© 2026 Prompt Studio. Todos los derechos reservados.</p>
            <p>Recomendación importante</p>
            <p>Hay un punto que conviene ajustar respecto a lo que hemos escrito en las tablas de cookies. En documentos legales no es recomendable afirmar que utilizas cookies con nombres específicos (por ejemplo, __session, _ga_* o __stripe_mid) como si fueran definitivas, porque Clerk, Stripe, Cloudflare, Google y Vercel pueden cambiar esos nombres sin previo aviso.</p>
            <p>Lo más seguro es:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener las tablas con los proveedores, la categoría, la duración aproximada y la finalidad.</li>
              <li>Aclarar que los nombres de las cookies son orientativos y pueden variar según las actualizaciones de los proveedores.</li>
            </ul>
            <p>De esta forma, la política seguirá siendo correcta aunque alguno de esos servicios modifique sus cookies en el futuro, evitando que el documento quede desactualizado innecesariamente.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
