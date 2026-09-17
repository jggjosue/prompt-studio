import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Prompt Studio',
  description: 'Política de Privacidad de Prompt Studio.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Política de Privacidad
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Última actualización: <span className="font-medium text-foreground">2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>POLÍTICA DE PRIVACIDAD</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 1. Introducción
              </h2>
            </section>
            <p>Bienvenido a Prompt Studio (“la Plataforma”, “nosotros”, “nuestro” o “Prompt Studio”).</p>
            <p>La presente Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos, protegemos y compartimos la información personal de los usuarios que acceden o utilizan nuestros servicios disponibles en:</p>
            <p>https://www.prompstudio.com</p>
            <p>Nuestro compromiso es proteger la privacidad de nuestros usuarios y tratar sus datos personales conforme a la legislación aplicable, incluyendo, cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos de la Unión Europea (RGPD / GDPR).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México.</li>
              <li>California Consumer Privacy Act (CCPA) y California Privacy Rights Act (CPRA).</li>
              <li>Otras leyes nacionales e internacionales aplicables en materia de privacidad y protección de datos.</li>
            </ul>
            <p>Esta Política forma parte integral de los Términos y Condiciones de Prompt Studio.</p>
            <p>Al acceder, registrarse o utilizar cualquiera de nuestros servicios, el usuario reconoce haber leído esta Política y acepta el tratamiento de sus datos conforme a ella.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.1 Nuestro compromiso</h3>
            <p>Prompt Studio está comprometido con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La transparencia.</li>
              <li>La seguridad de la información.</li>
              <li>La protección de la privacidad.</li>
              <li>El tratamiento responsable de los datos personales.</li>
              <li>El cumplimiento de la legislación aplicable.</li>
              <li>La mejora continua de nuestras medidas de seguridad.</li>
            </ul>
            <p>Nuestro objetivo es recopilar únicamente la información necesaria para ofrecer una plataforma segura, eficiente y personalizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.2 ¿Qué es Prompt Studio?</h3>
            <p>Prompt Studio es una plataforma digital especializada en recursos para Inteligencia Artificial.</p>
            <p>Los usuarios pueden acceder a contenidos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para aplicaciones.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Demos.</li>
              <li>Ejemplos.</li>
              <li>Recursos gratuitos.</li>
              <li>Contenido Premium mediante compra o suscripción.</li>
            </ul>
            <p>Además, la Plataforma incorpora herramientas basadas en Inteligencia Artificial para ayudar a generar nuevos prompts y mejorar la productividad del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.3 Alcance de esta Política</h3>
            <p>Esta Política aplica al tratamiento de datos realizado cuando el usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Visita nuestro sitio web.</li>
              <li>Crea una cuenta.</li>
              <li>Inicia sesión mediante Clerk.</li>
              <li>Compra productos.</li>
              <li>Contrata una suscripción Premium.</li>
              <li>Utiliza los generadores de prompts mediante IA.</li>
              <li>Descarga recursos gratuitos.</li>
              <li>Descarga recursos Premium.</li>
              <li>Contacta con soporte.</li>
              <li>Se suscribe al boletín.</li>
              <li>Interactúa con nuestras campañas de correo electrónico.</li>
              <li>Utiliza cualquiera de las funciones disponibles en Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.4 Qué regula esta Política</h3>
            <p>Esta Política explica:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué información recopilamos.</li>
              <li>Cómo la obtenemos.</li>
              <li>Para qué la utilizamos.</li>
              <li>Con quién la compartimos.</li>
              <li>Cuánto tiempo la conservamos.</li>
              <li>Cómo protegemos la información.</li>
              <li>Qué derechos tienen los usuarios.</li>
              <li>Cómo ejercer dichos derechos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.5 Documentos relacionados</h3>
            <p>Esta Política debe leerse conjuntamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los Términos y Condiciones.</li>
              <li>La Política de Cookies.</li>
              <li>Las políticas específicas relacionadas con promociones.</li>
              <li>Las condiciones de compra.</li>
              <li>Las políticas de suscripciones Premium.</li>
            </ul>
            <p>En caso de conflicto respecto al tratamiento de datos personales, prevalecerá esta Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.6 Cambios futuros</h3>
            <p>Prompt Studio podrá actualizar esta Política cuando resulte necesario debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios tecnológicos.</li>
              <li>Cambios legales.</li>
              <li>Incorporación de nuevos servicios.</li>
              <li>Nuevos proveedores.</li>
              <li>Mejoras de seguridad.</li>
              <li>Nuevas funcionalidades.</li>
            </ul>
            <p>Cuando las modificaciones sean relevantes, se notificará a los usuarios mediante los medios apropiados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 2. Responsable del Tratamiento
              </h2>
            </section>
            <p>El responsable del tratamiento de los datos personales tratados a través de Prompt Studio es:</p>
            <p>Magzin LLC</p>
            <p>Dirección:</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo de soporte:</p>
            <p>user@example.com</p>
            <p>Magzin LLC es responsable de determinar las finalidades y los medios mediante los cuales se tratan los datos personales recopilados por la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Datos de contacto</h3>
            <p>Para cualquier consulta relacionada con esta Política de Privacidad, los usuarios pueden comunicarse con nosotros mediante:</p>
            <p>Correo electrónico</p>
            <p>user@example.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Servicios administrados</h3>
            <p>Magzin LLC administra, desarrolla y opera:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompt Studio.</li>
              <li>La infraestructura tecnológica.</li>
              <li>La plataforma Premium.</li>
              <li>Las ventas de recursos digitales.</li>
              <li>Las suscripciones.</li>
              <li>El soporte técnico.</li>
              <li>Las campañas de comunicación.</li>
              <li>Los sistemas relacionados con Inteligencia Artificial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Proveedores tecnológicos</h3>
            <p>Para prestar nuestros servicios utilizamos diversos proveedores especializados, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clerk</li>
              <li>Stripe</li>
              <li>MongoDB Atlas</li>
              <li>Cloudflare R2</li>
              <li>Google Gemini / Genkit</li>
              <li>Firebase Analytics</li>
              <li>Google Analytics 4</li>
              <li>Vercel Analytics</li>
              <li>Resend</li>
              <li>Vercel</li>
            </ul>
            <p>Cada proveedor únicamente procesa la información necesaria para prestar el servicio correspondiente y conforme a sus propias obligaciones contractuales y políticas de privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Alcance de nuestra responsabilidad</h3>
            <p>Prompt Studio es responsable del tratamiento de los datos personales que administra directamente.</p>
            <p>Los proveedores externos actúan como encargados del tratamiento o responsables independientes, según la naturaleza del servicio prestado y la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Contacto para privacidad</h3>
            <p>Las solicitudes relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Protección de datos.</li>
              <li>Eliminación de información.</li>
              <li>Derechos GDPR.</li>
              <li>Derechos ARCO.</li>
              <li>Derechos CCPA.</li>
              <li>Seguridad.</li>
              <li>Incidentes relacionados con privacidad.</li>
            </ul>
            <p>deberán enviarse a:</p>
            <p>user@example.com</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 3. Ámbito de Aplicación
              </h2>
            </section>
            <p>La presente Política de Privacidad regula el tratamiento de los datos personales realizado por Prompt Studio en relación con todos los servicios ofrecidos a través del sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Esta Política se aplica a cualquier persona que interactúe con la Plataforma, independientemente de su país de residencia, en la medida permitida por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.1 Personas a las que aplica</h3>
            <p>Esta Política aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Visitantes del sitio web.</li>
              <li>Usuarios registrados.</li>
              <li>Usuarios con cuentas gratuitas.</li>
              <li>Usuarios Premium.</li>
              <li>Compradores de productos digitales.</li>
              <li>Suscriptores.</li>
              <li>Afiliados.</li>
              <li>Personas que contacten al soporte.</li>
              <li>Personas que se suscriban al boletín.</li>
              <li>Personas que utilicen los generadores de Inteligencia Artificial.</li>
              <li>Personas que descarguen recursos gratuitos.</li>
              <li>Personas que descarguen recursos Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.2 Servicios cubiertos</h3>
            <p>Esta Política regula el tratamiento de datos relacionado con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro e inicio de sesión mediante Clerk.</li>
              <li>Administración de perfiles.</li>
              <li>Compra de prompts.</li>
              <li>Compra de recursos digitales.</li>
              <li>Suscripciones Premium.</li>
              <li>Facturación mediante Stripe.</li>
              <li>Portal del cliente de Stripe.</li>
              <li>Generación de prompts mediante Google Gemini / Genkit.</li>
              <li>Descarga de recursos digitales.</li>
              <li>Demos HTML almacenadas en Cloudflare R2.</li>
              <li>Programa de afiliados.</li>
              <li>Comunicaciones mediante Resend.</li>
              <li>Analítica mediante Google Analytics 4.</li>
              <li>Eventos mediante Firebase Analytics.</li>
              <li>Métricas mediante Vercel Analytics.</li>
              <li>Atención al cliente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.3 Servicios no cubiertos</h3>
            <p>Esta Política no regula el tratamiento de datos realizado directamente por servicios de terceros cuando el usuario abandona Prompt Studio.</p>
            <p>Entre ellos se encuentran, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitios web externos.</li>
              <li>Plataformas enlazadas desde Prompt Studio.</li>
              <li>Redes sociales.</li>
              <li>Pasarelas externas.</li>
              <li>Sitios propiedad de terceros.</li>
            </ul>
            <p>Cada uno de estos servicios cuenta con sus propias políticas de privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.4 Alcance territorial</h3>
            <p>Prompt Studio ofrece servicios a usuarios de diferentes países.</p>
            <p>Dependiendo del lugar de residencia del usuario, podrán resultar aplicables diferentes normativas, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (RGPD/GDPR).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Otras leyes locales de privacidad.</li>
            </ul>
            <p>Prompt Studio procurará cumplir las obligaciones que correspondan conforme a la legislación aplicable en cada caso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.5 Servicios de terceros</h3>
            <p>La Plataforma integra servicios proporcionados por terceros especializados, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clerk.</li>
              <li>Stripe.</li>
              <li>MongoDB Atlas.</li>
              <li>Cloudflare R2.</li>
              <li>Google Gemini.</li>
              <li>Google Genkit.</li>
              <li>Google Analytics 4.</li>
              <li>Firebase Analytics.</li>
              <li>Vercel Analytics.</li>
              <li>Resend.</li>
            </ul>
            <p>Cada proveedor procesa información únicamente en la medida necesaria para prestar el servicio correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.6 Exclusiones</h3>
            <p>Esta Política no regula:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Información recopilada fuera de Prompt Studio.</li>
              <li>Sitios web de terceros.</li>
              <li>Servicios que no sean administrados por Magzin LLC.</li>
              <li>Tratamientos realizados por terceros sobre los cuales Prompt Studio no tenga control.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.7 Aceptación</h3>
            <p>Al utilizar cualquiera de los servicios de Prompt Studio, el usuario reconoce haber leído esta Política y acepta el tratamiento de sus datos conforme a ella.</p>
            <p>Cuando la legislación lo exija, se solicitará un consentimiento adicional mediante los mecanismos correspondientes.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 4. Información que Recopilamos
              </h2>
            </section>
            <p>Prompt Studio recopila únicamente la información necesaria para proporcionar sus servicios, mejorar la experiencia del usuario, garantizar la seguridad de la Plataforma y cumplir con las obligaciones legales aplicables.</p>
            <p>La información recopilada dependerá de los servicios utilizados por cada usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.1 Información proporcionada directamente</h3>
            <p>Cuando un usuario crea una cuenta o interactúa con la Plataforma, podrá proporcionar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Nombre de usuario.</li>
              <li>Imagen de perfil (cuando corresponda).</li>
              <li>Preferencias de la cuenta.</li>
              <li>Idioma.</li>
              <li>País.</li>
              <li>Información de contacto.</li>
              <li>Información enviada mediante formularios.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.2 Información de autenticación</h3>
            <p>A través de Clerk, la Plataforma puede tratar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador único del usuario.</li>
              <li>Estado de autenticación.</li>
              <li>Sesiones activas.</li>
              <li>Tokens de sesión.</li>
              <li>Métodos de inicio de sesión.</li>
              <li>Verificación del correo electrónico.</li>
              <li>Metadatos asociados a la cuenta.</li>
              <li>Información generada mediante webhooks.</li>
            </ul>
            <p>Las contraseñas son administradas por Clerk y Prompt Studio no almacena directamente las contraseñas de los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.3 Información relacionada con compras</h3>
            <p>Cuando un usuario realiza una compra o adquiere una suscripción Premium, podrán tratarse datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador del cliente.</li>
              <li>Productos adquiridos.</li>
              <li>Suscripciones activas.</li>
              <li>Historial de compras.</li>
              <li>Estado de pagos.</li>
              <li>Facturas.</li>
              <li>Moneda utilizada.</li>
              <li>País de facturación.</li>
            </ul>
            <p>Los datos financieros son procesados mediante Stripe.</p>
            <p>Prompt Studio no almacena números completos de tarjetas bancarias ni códigos de seguridad (CVV/CVC).</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.4 Información almacenada en MongoDB Atlas</h3>
            <p>La base de datos MongoDB Atlas podrá almacenar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usuarios.</li>
              <li>Perfiles.</li>
              <li>Preferencias.</li>
              <li>Historial de actividad.</li>
              <li>Recursos descargados.</li>
              <li>Prompts favoritos.</li>
              <li>Compras.</li>
              <li>Estado de la suscripción.</li>
              <li>Programa de afiliados.</li>
              <li>Configuraciones de usuario.</li>
              <li>Registros técnicos necesarios para el funcionamiento de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.5 Información relacionada con IA</h3>
            <p>Cuando el usuario utilice herramientas basadas en Google Gemini / Genkit, podrán procesarse datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Texto introducido por el usuario.</li>
              <li>Instrucciones proporcionadas.</li>
              <li>Configuración seleccionada.</li>
              <li>Resultado generado.</li>
              <li>Información técnica necesaria para ejecutar la solicitud.</li>
            </ul>
            <p>Prompt Studio no utiliza estos datos para entrenar modelos propios de inteligencia artificial, salvo que el usuario otorgue un consentimiento específico y la legislación aplicable lo permita.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.6 Información técnica</h3>
            <p>Durante la navegación, podrán recopilarse automáticamente datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dirección IP.</li>
              <li>Tipo de navegador.</li>
              <li>Sistema operativo.</li>
              <li>Idioma del navegador.</li>
              <li>Resolución de pantalla.</li>
              <li>Tipo de dispositivo.</li>
              <li>Zona horaria.</li>
              <li>Páginas visitadas.</li>
              <li>Tiempo de permanencia.</li>
              <li>Referencia de origen.</li>
              <li>Identificadores de sesión.</li>
            </ul>
            <p>Esta información se utiliza para garantizar la seguridad, el rendimiento y la estabilidad de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.7 Información analítica</h3>
            <p>A través de Google Analytics 4, Firebase Analytics y Vercel Analytics, podrán recopilarse datos estadísticos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitantes.</li>
              <li>Eventos de interacción.</li>
              <li>Rendimiento del sitio.</li>
              <li>Conversión.</li>
              <li>Tiempo de permanencia.</li>
              <li>Flujo de navegación.</li>
              <li>Descargas de recursos.</li>
              <li>Uso de funciones Premium.</li>
              <li>Rendimiento de páginas.</li>
              <li>Errores técnicos.</li>
            </ul>
            <p>Esta información se utiliza exclusivamente para mejorar la Plataforma y comprender el comportamiento general de los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.8 Información de comunicaciones</h3>
            <p>Cuando el usuario interactúe con nuestros correos electrónicos enviados mediante Resend, podrán registrarse datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmación de entrega.</li>
              <li>Apertura del correo (cuando sea técnicamente posible).</li>
              <li>Clics en enlaces.</li>
              <li>Errores de entrega.</li>
              <li>Cancelación de suscripción.</li>
              <li>Estado de la lista de contactos.</li>
            </ul>
            <p>Estos datos nos ayudan a garantizar el correcto funcionamiento de nuestras comunicaciones y mejorar la experiencia del usuario.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 5. Información Proporcionada por el Usuario
              </h2>
            </section>
            <p>Prompt Studio recopila la información que el usuario decide proporcionar voluntariamente al utilizar la Plataforma.</p>
            <p>La cantidad y el tipo de información dependerán de las funciones utilizadas, la configuración de la cuenta y los servicios contratados.</p>
            <p>Nuestro objetivo es recopilar únicamente los datos razonablemente necesarios para prestar los servicios solicitados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.1 Registro de la cuenta</h3>
            <p>Cuando el usuario crea una cuenta mediante Clerk, podrá proporcionar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Nombre de usuario.</li>
              <li>Fotografía de perfil (opcional).</li>
              <li>Idioma preferido.</li>
              <li>País o región.</li>
              <li>Configuración de la cuenta.</li>
            </ul>
            <p>Dependiendo del método de autenticación seleccionado, Clerk podrá gestionar información adicional necesaria para verificar la identidad del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.2 Información del perfil</h3>
            <p>El usuario podrá actualizar voluntariamente información relacionada con su perfil, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre visible.</li>
              <li>Imagen de perfil.</li>
              <li>Preferencias.</li>
              <li>Idioma.</li>
              <li>Configuración personal.</li>
              <li>Información opcional relacionada con su cuenta.</li>
            </ul>
            <p>Toda esta información podrá modificarse o eliminarse desde las herramientas disponibles en la Plataforma o mediante Clerk, cuando corresponda.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.3 Información enviada mediante formularios</h3>
            <p>Cuando el usuario complete formularios disponibles en Prompt Studio, podremos recopilar la información incluida en ellos, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consultas al soporte.</li>
              <li>Reportes de errores.</li>
              <li>Solicitudes de funciones.</li>
              <li>Comentarios.</li>
              <li>Opiniones.</li>
              <li>Reclamaciones.</li>
              <li>Solicitudes relacionadas con privacidad.</li>
              <li>Formularios de contacto.</li>
            </ul>
            <p>La información será utilizada exclusivamente para atender la solicitud correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.4 Compras y suscripciones</h3>
            <p>Cuando el usuario adquiera un recurso Premium o una suscripción, podrá proporcionar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre del comprador.</li>
              <li>Correo electrónico.</li>
              <li>País de facturación.</li>
              <li>Información fiscal cuando resulte necesaria.</li>
              <li>Datos requeridos por Stripe para completar la operación.</li>
            </ul>
            <p>Prompt Studio no tiene acceso a la información completa de las tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.5 Programa de afiliados</h3>
            <p>Cuando el usuario participe en el programa de afiliados, podremos recopilar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Código de afiliado.</li>
              <li>Enlaces de referencia.</li>
              <li>Ventas atribuidas.</li>
              <li>Comisiones generadas.</li>
              <li>Estado de pagos.</li>
              <li>Historial de referencias.</li>
            </ul>
            <p>Estos datos son utilizados únicamente para administrar correctamente el programa de afiliados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.6 Uso de herramientas de Inteligencia Artificial</h3>
            <p>Cuando el usuario utilice los generadores de prompts impulsados por Google Gemini / Genkit, podrá proporcionar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descripciones.</li>
              <li>Instrucciones.</li>
              <li>Prompt inicial.</li>
              <li>Preferencias.</li>
              <li>Parámetros de generación.</li>
              <li>Correcciones posteriores.</li>
            </ul>
            <p>Esta información será utilizada para generar el contenido solicitado y mejorar la experiencia de uso de la herramienta.</p>
            <p>Prompt Studio no utiliza automáticamente estos datos para entrenar modelos propios de inteligencia artificial.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.7 Comunicaciones con soporte</h3>
            <p>Cuando el usuario contacte con nuestro equipo de soporte, podremos tratar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dirección de correo electrónico.</li>
              <li>Nombre.</li>
              <li>Contenido del mensaje.</li>
              <li>Archivos adjuntos enviados voluntariamente.</li>
              <li>Historial de conversaciones.</li>
              <li>Información técnica necesaria para resolver el problema.</li>
            </ul>
            <p>Esta información será utilizada exclusivamente para prestar asistencia y mejorar la calidad del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.8 Información proporcionada voluntariamente</h3>
            <p>El usuario podrá decidir proporcionar información adicional durante el uso de la Plataforma.</p>
            <p>Prompt Studio recomienda no enviar información sensible, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Números completos de tarjetas bancarias.</li>
              <li>Contraseñas.</li>
              <li>Documentos oficiales de identidad.</li>
              <li>Información médica.</li>
              <li>Información financiera confidencial.</li>
              <li>Cualquier otro dato que no sea necesario para la prestación del servicio.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 6. Información Recopilada Automáticamente
              </h2>
            </section>
            <p>Además de la información proporcionada directamente por el usuario, Prompt Studio recopila automáticamente determinados datos técnicos necesarios para el funcionamiento, la seguridad y el análisis de la Plataforma.</p>
            <p>Esta información se obtiene mediante tecnologías estándar de Internet, cookies y herramientas analíticas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.1 Información del dispositivo</h3>
            <p>Cuando un usuario accede a Prompt Studio, podrán recopilarse datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tipo de dispositivo.</li>
              <li>Sistema operativo.</li>
              <li>Versión del navegador.</li>
              <li>Idioma del navegador.</li>
              <li>Resolución de pantalla.</li>
              <li>Zona horaria.</li>
              <li>Configuración regional.</li>
              <li>Identificadores técnicos necesarios para la sesión.</li>
            </ul>
            <p>Estos datos ayudan a garantizar la compatibilidad y el correcto funcionamiento del sitio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.2 Información de navegación</h3>
            <p>Durante la navegación podrán registrarse datos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Páginas visitadas.</li>
              <li>Recursos consultados.</li>
              <li>Tiempo de permanencia.</li>
              <li>Secuencia de navegación.</li>
              <li>Botones utilizados.</li>
              <li>Descargas realizadas.</li>
              <li>Errores encontrados.</li>
              <li>Tiempo de carga.</li>
              <li>Fecha y hora de acceso.</li>
            </ul>
            <p>Esta información permite comprender cómo interactúan los usuarios con la Plataforma y detectar posibles problemas de funcionamiento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.3 Dirección IP</h3>
            <p>Prompt Studio podrá registrar la dirección IP utilizada durante la conexión.</p>
            <p>La dirección IP puede utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Detectar actividad sospechosa.</li>
              <li>Prevenir fraude.</li>
              <li>Proteger la Plataforma.</li>
              <li>Analizar estadísticas generales.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>Cuando resulte posible, se aplicarán mecanismos de anonimización o reducción de la información identificativa conforme a las opciones ofrecidas por los proveedores utilizados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.4 Información mediante Google Analytics 4</h3>
            <p>Google Analytics 4 puede recopilar información estadística relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usuarios activos.</li>
              <li>Eventos.</li>
              <li>Conversión.</li>
              <li>Tráfico.</li>
              <li>Rendimiento.</li>
              <li>Flujo de navegación.</li>
              <li>Campañas.</li>
              <li>Dispositivos.</li>
              <li>Navegadores.</li>
            </ul>
            <p>Estos datos se utilizan exclusivamente para mejorar los servicios ofrecidos por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.5 Información mediante Firebase Analytics</h3>
            <p>Firebase Analytics podrá registrar eventos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Apertura de funciones.</li>
              <li>Uso de herramientas.</li>
              <li>Interacción con los generadores de IA.</li>
              <li>Descargas.</li>
              <li>Acciones realizadas por el usuario.</li>
              <li>Rendimiento de determinadas funciones.</li>
            </ul>
            <p>Los eventos se utilizan con fines estadísticos y de mejora del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.6 Información mediante Vercel Analytics</h3>
            <p>Vercel Analytics recopila métricas relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Velocidad del sitio.</li>
              <li>Tiempo de respuesta.</li>
              <li>Rendimiento.</li>
              <li>Errores técnicos.</li>
              <li>Disponibilidad.</li>
              <li>Experiencia de usuario.</li>
            </ul>
            <p>Esta información permite optimizar continuamente la infraestructura de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.7 Cookies y tecnologías similares</h3>
            <p>La Plataforma utiliza cookies y tecnologías equivalentes para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Recordar preferencias.</li>
              <li>Analizar el uso del sitio.</li>
              <li>Mejorar el rendimiento.</li>
              <li>Proteger la seguridad.</li>
              <li>Medir conversiones.</li>
            </ul>
            <p>Las cookies se describen detalladamente en la sección correspondiente de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.8 Registros técnicos</h3>
            <p>Para proteger la Plataforma y garantizar su funcionamiento, Prompt Studio podrá generar registros técnicos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Errores del sistema.</li>
              <li>Fallos de autenticación.</li>
              <li>Actividad sospechosa.</li>
              <li>Accesos.</li>
              <li>Estado de los servicios.</li>
              <li>Eventos relacionados con la seguridad.</li>
              <li>Funcionamiento de los webhooks.</li>
            </ul>
            <p>Estos registros se utilizan exclusivamente para fines técnicos, de seguridad y cumplimiento legal.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 7. Información Proveniente de Terceros
              </h2>
            </section>
            <p>Para ofrecer los servicios de Prompt Studio de forma segura, eficiente y personalizada, utilizamos diversos proveedores tecnológicos especializados.</p>
            <p>Dependiendo de los servicios utilizados por el usuario, podremos recibir información procedente de dichos proveedores.</p>
            <p>Cada proveedor procesa únicamente la información necesaria para prestar el servicio correspondiente conforme a sus propias políticas de privacidad y a los acuerdos contractuales vigentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 Información recibida de Clerk</h3>
            <p>Prompt Studio utiliza Clerk como proveedor de autenticación y administración de identidades.</p>
            <p>A través de Clerk podremos recibir información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador único del usuario.</li>
              <li>Dirección de correo electrónico verificada.</li>
              <li>Nombre del usuario.</li>
              <li>Fotografía de perfil (cuando exista).</li>
              <li>Estado de autenticación.</li>
              <li>Información de sesiones activas.</li>
              <li>Fecha de creación de la cuenta.</li>
              <li>Metadatos públicos.</li>
              <li>Metadatos privados autorizados.</li>
              <li>Eventos generados mediante webhooks.</li>
            </ul>
            <p>Esta información se utiliza exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y administrar la cuenta.</li>
              <li>Mantener sesiones seguras.</li>
              <li>Verificar la identidad.</li>
              <li>Proteger el acceso.</li>
              <li>Sincronizar la información con MongoDB Atlas.</li>
            </ul>
            <p>Prompt Studio no recibe ni almacena directamente las contraseñas de los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Información recibida de Stripe</h3>
            <p>Cuando un usuario realiza una compra o contrata una suscripción Premium, Stripe podrá compartir con Prompt Studio información relacionada con la transacción, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador del cliente.</li>
              <li>Estado del pago.</li>
              <li>Identificador de la suscripción.</li>
              <li>Historial de facturación.</li>
              <li>Facturas.</li>
              <li>Estado de reembolsos.</li>
              <li>Estado de cancelaciones.</li>
              <li>Estado del método de pago.</li>
              <li>Eventos generados mediante webhooks.</li>
            </ul>
            <p>Prompt Studio no recibe ni almacena:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número completo de la tarjeta.</li>
              <li>Código CVV.</li>
              <li>PIN.</li>
              <li>Datos bancarios completos.</li>
            </ul>
            <p>Toda la información financiera es administrada directamente por Stripe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Información recibida de MongoDB Atlas</h3>
            <p>MongoDB Atlas constituye la base de datos principal de Prompt Studio.</p>
            <p>A través de esta infraestructura se almacenan, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Información del perfil.</li>
              <li>Preferencias.</li>
              <li>Recursos adquiridos.</li>
              <li>Historial de compras.</li>
              <li>Descargas.</li>
              <li>Actividad del usuario.</li>
              <li>Estado Premium.</li>
              <li>Programa de afiliados.</li>
              <li>Configuración personalizada.</li>
              <li>Historial de generación de prompts.</li>
              <li>Información técnica necesaria para el funcionamiento del servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Información recibida de Google Gemini / Genkit</h3>
            <p>Cuando el usuario utiliza los generadores de Inteligencia Artificial, Google Gemini o Genkit podrán procesar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompt introducido.</li>
              <li>Parámetros seleccionados.</li>
              <li>Configuración de generación.</li>
              <li>Resultado generado.</li>
              <li>Información técnica necesaria para ejecutar la solicitud.</li>
            </ul>
            <p>Prompt Studio utiliza esta información exclusivamente para generar el contenido solicitado por el usuario.</p>
            <p>Salvo que se indique expresamente lo contrario, Prompt Studio no utiliza automáticamente estas solicitudes para entrenar modelos propios de inteligencia artificial.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Información recibida de Cloudflare R2</h3>
            <p>Cloudflare R2 almacena recursos digitales utilizados por la Plataforma, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Demos HTML.</li>
              <li>Archivos estáticos.</li>
              <li>Recursos descargables.</li>
              <li>Material Premium.</li>
              <li>Recursos gratuitos.</li>
              <li>Archivos multimedia.</li>
            </ul>
            <p>Cloudflare R2 podrá generar registros técnicos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargas.</li>
              <li>Disponibilidad.</li>
              <li>Rendimiento.</li>
              <li>Accesos.</li>
              <li>Uso de ancho de banda.</li>
            </ul>
            <p>Estos registros se utilizan únicamente para garantizar el correcto funcionamiento del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Información recibida de Resend</h3>
            <p>Cuando Prompt Studio envía correos electrónicos mediante Resend, podrá recibir información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmación de entrega.</li>
              <li>Correos rechazados.</li>
              <li>Estado del envío.</li>
              <li>Errores.</li>
              <li>Cancelaciones de suscripción.</li>
              <li>Estadísticas de apertura (cuando técnicamente estén disponibles).</li>
              <li>Clics realizados sobre enlaces del correo (cuando estén habilitados).</li>
            </ul>
            <p>Estos datos permiten mejorar la calidad de nuestras comunicaciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Información recibida mediante herramientas analíticas</h3>
            <p>Prompt Studio utiliza diversas herramientas analíticas para comprender el funcionamiento de la Plataforma.</p>
            <p>Entre ellas:</p>
            <p>Google Analytics 4</p>
            <p>Puede proporcionar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tráfico.</li>
              <li>Conversión.</li>
              <li>Navegación.</li>
              <li>Eventos.</li>
              <li>Usuarios.</li>
              <li>Dispositivos.</li>
            </ul>
            <p>Firebase Analytics</p>
            <p>Puede proporcionar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eventos.</li>
              <li>Uso de funciones.</li>
              <li>Interacciones.</li>
              <li>Rendimiento.</li>
            </ul>
            <p>Vercel Analytics</p>
            <p>Puede proporcionar métricas relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Velocidad.</li>
              <li>Rendimiento.</li>
              <li>Disponibilidad.</li>
              <li>Errores.</li>
              <li>Experiencia de usuario.</li>
            </ul>
            <p>Toda esta información se utiliza exclusivamente para fines estadísticos y de mejora continua.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Información recibida mediante Webhooks</h3>
            <p>Prompt Studio utiliza webhooks para mantener sincronizados diversos servicios.</p>
            <p>Los webhooks podrán comunicar eventos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro de nuevos usuarios.</li>
              <li>Actualización del perfil.</li>
              <li>Confirmación de pagos.</li>
              <li>Cancelación de suscripciones.</li>
              <li>Renovaciones.</li>
              <li>Reembolsos.</li>
              <li>Eliminación de cuentas.</li>
              <li>Cambios en el estado Premium.</li>
            </ul>
            <p>Los webhooks contienen únicamente la información necesaria para sincronizar correctamente la Plataforma.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 8. Finalidades del Tratamiento
              </h2>
            </section>
            <p>Prompt Studio trata los datos personales únicamente para finalidades legítimas, específicas y previamente informadas al usuario.</p>
            <p>No utilizamos la información para fines incompatibles con aquellos para los cuales fue recopilada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.1 Prestación del servicio</h3>
            <p>Utilizamos los datos personales para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear cuentas.</li>
              <li>Administrar perfiles.</li>
              <li>Mantener sesiones.</li>
              <li>Proporcionar acceso a recursos gratuitos.</li>
              <li>Proporcionar acceso a recursos Premium.</li>
              <li>Gestionar suscripciones.</li>
              <li>Permitir la descarga de contenido.</li>
              <li>Operar la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.2 Autenticación</h3>
            <p>La información administrada mediante Clerk se utiliza para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificar al usuario.</li>
              <li>Mantener sesiones activas.</li>
              <li>Recuperar cuentas.</li>
              <li>Restablecer contraseñas.</li>
              <li>Proteger el acceso.</li>
              <li>Detectar accesos no autorizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.3 Compras</h3>
            <p>Los datos relacionados con compras se utilizan para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar pagos mediante Stripe.</li>
              <li>Emitir facturas.</li>
              <li>Confirmar pedidos.</li>
              <li>Gestionar suscripciones.</li>
              <li>Procesar reembolsos.</li>
              <li>Atender incidencias relacionadas con pagos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.4 Inteligencia Artificial</h3>
            <p>Cuando el usuario utiliza los generadores de prompts, la información proporcionada se utiliza para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar la solicitud.</li>
              <li>Generar contenido mediante Google Gemini / Genkit.</li>
              <li>Mejorar la experiencia de uso.</li>
              <li>Mantener la continuidad de la conversación cuando corresponda.</li>
            </ul>
            <p>Prompt Studio no utiliza automáticamente el contenido generado por el usuario para entrenar modelos propios de IA.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.5 Personalización</h3>
            <p>Podremos utilizar información relacionada con el uso de la Plataforma para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recordar preferencias.</li>
              <li>Mostrar recursos relevantes.</li>
              <li>Recomendar prompts.</li>
              <li>Organizar el contenido.</li>
              <li>Mejorar la experiencia de navegación.</li>
            </ul>
            <p>Estas recomendaciones no producen efectos jurídicos sobre el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.6 Atención al cliente</h3>
            <p>Utilizamos la información enviada al soporte para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resolver incidencias.</li>
              <li>Atender consultas.</li>
              <li>Corregir errores.</li>
              <li>Gestionar reclamaciones.</li>
              <li>Mejorar el servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.7 Seguridad</h3>
            <p>La información también podrá utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Detectar fraude.</li>
              <li>Proteger cuentas.</li>
              <li>Prevenir accesos indebidos.</li>
              <li>Investigar incidentes.</li>
              <li>Detectar actividad automatizada.</li>
              <li>Proteger la infraestructura tecnológica.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.8 Marketing</h3>
            <p>Cuando el usuario otorgue su consentimiento, podremos utilizar su correo electrónico para enviar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Novedades.</li>
              <li>Promociones.</li>
              <li>Nuevos prompts.</li>
              <li>Nuevas colecciones.</li>
              <li>Recursos gratuitos.</li>
              <li>Actualizaciones Premium.</li>
              <li>Noticias relacionadas con Inteligencia Artificial.</li>
            </ul>
            <p>El usuario podrá cancelar estas comunicaciones en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.9 Cumplimiento legal</h3>
            <p>Determinada información podrá utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Atender requerimientos de autoridades.</li>
              <li>Cumplir obligaciones fiscales.</li>
              <li>Resolver controversias.</li>
              <li>Defender derechos legales.</li>
              <li>Cumplir contratos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.10 Mejora continua</h3>
            <p>Finalmente, utilizamos información estadística para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analizar el rendimiento.</li>
              <li>Optimizar la velocidad.</li>
              <li>Corregir errores.</li>
              <li>Incorporar nuevas funciones.</li>
              <li>Mejorar la experiencia del usuario.</li>
              <li>Desarrollar nuevas herramientas.</li>
            </ul>
            <p>Estas actividades se realizan procurando minimizar el tratamiento de datos personales y, cuando sea posible, utilizando información agregada o anonimizada.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 9. Bases Legales del Tratamiento (RGPD / GDPR)
              </h2>
            </section>
            <p>Cuando el tratamiento de datos personales esté sujeto al Reglamento (UE) 2016/679 (RGPD/GDPR), Prompt Studio tratará la información únicamente cuando exista una base jurídica válida conforme a dicho reglamento.</p>
            <p>La base legal utilizada dependerá del tipo de servicio utilizado por el usuario y de la finalidad específica del tratamiento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.1 Consentimiento</h3>
            <p>Prompt Studio solicitará el consentimiento del usuario cuando la legislación aplicable así lo exija.</p>
            <p>El consentimiento podrá utilizarse, entre otros casos, para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Envío de campañas de email marketing.</li>
              <li>Instalación de cookies analíticas.</li>
              <li>Instalación de cookies publicitarias, cuando existan.</li>
              <li>Comunicaciones promocionales.</li>
              <li>Participación voluntaria en estudios o encuestas.</li>
              <li>Finalidades adicionales que requieran autorización expresa.</li>
            </ul>
            <p>El consentimiento será:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Libre.</li>
              <li>Específico.</li>
              <li>Informado.</li>
              <li>Inequívoco.</li>
            </ul>
            <p>El usuario podrá retirarlo en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.2 Ejecución de un contrato</h3>
            <p>Gran parte del tratamiento realizado por Prompt Studio es necesario para ejecutar el contrato celebrado con el usuario.</p>
            <p>Esta base jurídica permite tratar información necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear la cuenta.</li>
              <li>Mantener la sesión iniciada.</li>
              <li>Gestionar recursos Premium.</li>
              <li>Procesar compras.</li>
              <li>Administrar suscripciones.</li>
              <li>Descargar archivos.</li>
              <li>Emitir facturas.</li>
              <li>Gestionar pagos mediante Stripe.</li>
              <li>Prestar soporte.</li>
            </ul>
            <p>Sin este tratamiento no sería posible prestar correctamente los servicios contratados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.3 Cumplimiento de obligaciones legales</h3>
            <p>Prompt Studio podrá tratar datos personales cuando resulte necesario para cumplir obligaciones legales, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Obligaciones fiscales.</li>
              <li>Obligaciones contables.</li>
              <li>Requerimientos judiciales.</li>
              <li>Órdenes administrativas.</li>
              <li>Prevención de fraude.</li>
              <li>Conservación de documentación obligatoria.</li>
              <li>Cumplimiento de normas de protección de datos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.4 Interés legítimo</h3>
            <p>En determinados casos Prompt Studio podrá tratar información basándose en su interés legítimo, siempre que dicho interés no prevalezca sobre los derechos y libertades del usuario.</p>
            <p>Entre estos tratamientos pueden encontrarse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Protección contra fraude.</li>
              <li>Seguridad informática.</li>
              <li>Prevención de ataques.</li>
              <li>Detección de accesos sospechosos.</li>
              <li>Mejora del rendimiento.</li>
              <li>Estadísticas internas.</li>
              <li>Auditorías.</li>
              <li>Protección de la infraestructura.</li>
            </ul>
            <p>Antes de utilizar esta base jurídica procuraremos evaluar el equilibrio entre nuestros intereses y los derechos del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.5 Protección de intereses vitales</h3>
            <p>En situaciones excepcionales, Prompt Studio podrá tratar datos personales cuando ello resulte necesario para proteger intereses vitales del usuario o de otra persona, conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.6 Cambios en la base jurídica</h3>
            <p>Si en el futuro una finalidad de tratamiento requiere una base jurídica distinta de la inicialmente utilizada, Prompt Studio informará al usuario antes de iniciar dicho tratamiento cuando la legislación aplicable así lo exija.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.7 Minimización de datos</h3>
            <p>Prompt Studio procura recopilar únicamente la información estrictamente necesaria para cada finalidad.</p>
            <p>No solicitaremos datos que no resulten razonablemente necesarios para prestar nuestros servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.8 Exactitud</h3>
            <p>Procuramos mantener los datos personales actualizados.</p>
            <p>El usuario podrá corregir su información mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Su perfil.</li>
              <li>Clerk.</li>
              <li>Contactando con soporte.</li>
            </ul>
            <p>Es responsabilidad del usuario mantener actualizados los datos proporcionados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.9 Conservación limitada</h3>
            <p>Los datos personales serán conservados únicamente durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prestar el servicio.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Defender derechos legales.</li>
              <li>Prevenir fraude.</li>
            </ul>
            <p>Posteriormente podrán eliminarse o anonimizarse.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.10 Transparencia</h3>
            <p>Prompt Studio se compromete a informar de manera clara:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué datos recopila.</li>
              <li>Cómo los utiliza.</li>
              <li>Durante cuánto tiempo los conserva.</li>
              <li>Con quién los comparte.</li>
              <li>Qué derechos tiene el usuario.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 10. Cuenta de Usuario (Clerk)
              </h2>
            </section>
            <p>Prompt Studio utiliza Clerk como proveedor oficial para la autenticación y administración segura de cuentas.</p>
            <p>Clerk proporciona una infraestructura especializada para gestionar el registro, autenticación y seguridad de los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.1 Registro</h3>
            <p>El usuario puede crear una cuenta utilizando los métodos de autenticación habilitados por Clerk.</p>
            <p>Dependiendo de la configuración de la Plataforma, dichos métodos podrán incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico.</li>
              <li>Contraseña.</li>
              <li>Magic Links.</li>
              <li>Códigos de verificación.</li>
              <li>Proveedores OAuth compatibles.</li>
              <li>Autenticación multifactor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.2 Información administrada por Clerk</h3>
            <p>Clerk podrá tratar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre.</li>
              <li>Correo electrónico.</li>
              <li>Identificador único.</li>
              <li>Estado de verificación.</li>
              <li>Sesiones activas.</li>
              <li>Tokens.</li>
              <li>Metadatos públicos.</li>
              <li>Metadatos privados.</li>
              <li>Imagen de perfil.</li>
              <li>Historial de autenticación.</li>
            </ul>
            <p>Prompt Studio únicamente accede a la información necesaria para prestar sus servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.3 Contraseñas</h3>
            <p>Las contraseñas son administradas exclusivamente por Clerk.</p>
            <p>Prompt Studio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No almacena contraseñas.</li>
              <li>No puede visualizar contraseñas.</li>
              <li>No recupera contraseñas.</li>
              <li>No conserva credenciales de autenticación.</li>
            </ul>
            <p>Toda la autenticación se realiza utilizando la infraestructura segura proporcionada por Clerk.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.4 Sesiones</h3>
            <p>Clerk administra las sesiones de usuario mediante mecanismos seguros.</p>
            <p>Esto permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Evitar accesos no autorizados.</li>
              <li>Recordar el estado de autenticación.</li>
              <li>Revocar sesiones comprometidas.</li>
              <li>Gestionar múltiples dispositivos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.5 Webhooks</h3>
            <p>Prompt Studio utiliza webhooks proporcionados por Clerk para sincronizar automáticamente eventos relacionados con la cuenta.</p>
            <p>Entre ellos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creación de usuarios.</li>
              <li>Actualización del perfil.</li>
              <li>Eliminación de cuentas.</li>
              <li>Verificación del correo.</li>
              <li>Cambios en los metadatos.</li>
              <li>Actualización de sesiones.</li>
            </ul>
            <p>Estos webhooks contienen únicamente la información necesaria para mantener sincronizada la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.6 Seguridad</h3>
            <p>Clerk implementa mecanismos avanzados destinados a proteger las cuentas, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado.</li>
              <li>Gestión segura de sesiones.</li>
              <li>Protección frente a ataques automatizados.</li>
              <li>Verificación de identidad.</li>
              <li>Recuperación segura de cuentas.</li>
              <li>Autenticación multifactor cuando esté habilitada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.7 Eliminación de la cuenta</h3>
            <p>El usuario podrá eliminar su cuenta en cualquier momento utilizando las herramientas disponibles en Clerk o solicitándolo mediante:</p>
            <p>user@example.com</p>
            <p>Una vez eliminada la cuenta:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se cancelará el acceso.</li>
              <li>Se iniciará el proceso de eliminación o anonimización de los datos almacenados en Prompt Studio.</li>
              <li>Se cancelarán las comunicaciones promocionales cuando corresponda.</li>
            </ul>
            <p>La información cuya conservación sea obligatoria por ley podrá mantenerse durante el tiempo exigido por la normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.8 Sincronización con MongoDB Atlas</h3>
            <p>La información administrada por Clerk podrá sincronizarse con MongoDB Atlas para mantener:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perfil del usuario.</li>
              <li>Estado Premium.</li>
              <li>Historial de compras.</li>
              <li>Preferencias.</li>
              <li>Configuración.</li>
              <li>Actividad necesaria para el funcionamiento de la Plataforma.</li>
            </ul>
            <p>Prompt Studio procura mantener esta sincronización limitada únicamente a la información estrictamente necesaria para prestar los servicios contratados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 11. Compras y Pagos mediante Stripe
              </h2>
            </section>
            <p>Prompt Studio utiliza Stripe como proveedor oficial para el procesamiento seguro de pagos relacionados con productos digitales, suscripciones Premium y demás servicios de pago disponibles en la Plataforma.</p>
            <p>Stripe actúa como proveedor independiente de servicios de pago y procesa la información financiera conforme a sus propios términos, políticas de privacidad y estándares internacionales de seguridad.</p>
            <p>Prompt Studio no almacena información completa de tarjetas bancarias, números de cuenta ni códigos de seguridad (CVV/CVC).</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.1 Productos y servicios de pago</h3>
            <p>Stripe podrá utilizarse para procesar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras únicas de prompts.</li>
              <li>Compra de paquetes Premium.</li>
              <li>Suscripciones mensuales.</li>
              <li>Suscripciones anuales.</li>
              <li>Renovaciones automáticas.</li>
              <li>Facturación electrónica.</li>
              <li>Reembolsos.</li>
              <li>Cancelaciones.</li>
              <li>Créditos promocionales cuando estén disponibles.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.2 Información procesada por Stripe</h3>
            <p>Dependiendo del tipo de operación, Stripe podrá procesar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre del titular del pago.</li>
              <li>Dirección de correo electrónico.</li>
              <li>País de facturación.</li>
              <li>Dirección de facturación.</li>
              <li>Identificador del cliente.</li>
              <li>Método de pago.</li>
              <li>Estado del pago.</li>
              <li>Identificador de la transacción.</li>
              <li>Facturas.</li>
              <li>Estado de la suscripción.</li>
              <li>Historial de pagos.</li>
            </ul>
            <p>Prompt Studio únicamente recibe la información necesaria para confirmar el resultado de la transacción y prestar los servicios contratados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.3 Información que Prompt Studio no almacena</h3>
            <p>Por motivos de seguridad, Prompt Studio no almacena directamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número completo de tarjeta.</li>
              <li>Código CVV o CVC.</li>
              <li>PIN.</li>
              <li>Contraseña del banco.</li>
              <li>Datos completos de la cuenta bancaria.</li>
              <li>Información de autenticación financiera.</li>
            </ul>
            <p>Toda esta información permanece bajo la infraestructura segura de Stripe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.4 Confirmación de pagos</h3>
            <p>Una vez procesado el pago, Stripe podrá enviar información a Prompt Studio mediante webhooks seguros, incluyendo eventos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pago completado.</li>
              <li>Pago rechazado.</li>
              <li>Pago pendiente.</li>
              <li>Renovación exitosa.</li>
              <li>Cancelación.</li>
              <li>Reembolso.</li>
              <li>Contracargo.</li>
              <li>Actualización del método de pago.</li>
              <li>Expiración de la suscripción.</li>
            </ul>
            <p>Estos eventos permiten sincronizar automáticamente el estado de la cuenta del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.5 Prevención del fraude</h3>
            <p>Stripe incorpora mecanismos avanzados para detectar y prevenir actividades fraudulentas.</p>
            <p>Como parte de este proceso, Stripe podrá analizar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dirección IP.</li>
              <li>País.</li>
              <li>Dispositivo utilizado.</li>
              <li>Historial de pagos.</li>
              <li>Comportamiento de la transacción.</li>
              <li>Riesgo de fraude.</li>
            </ul>
            <p>Prompt Studio únicamente recibe el resultado necesario para decidir si la operación puede completarse.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.6 Facturación</h3>
            <p>Cuando corresponda, Stripe podrá emitir o administrar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facturas.</li>
              <li>Recibos.</li>
              <li>Historial de pagos.</li>
              <li>Documentación fiscal.</li>
            </ul>
            <p>Prompt Studio podrá conservar la información necesaria para cumplir obligaciones fiscales y contables conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.7 Reembolsos</h3>
            <p>Cuando un reembolso sea aprobado conforme a los Términos y Condiciones de Prompt Studio, Stripe procesará la devolución utilizando el método de pago correspondiente.</p>
            <p>Los tiempos de acreditación dependerán de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe.</li>
              <li>La institución financiera.</li>
              <li>El método de pago utilizado.</li>
              <li>La legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.8 Conservación de información financiera</h3>
            <p>Prompt Studio conservará únicamente la información necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar compras.</li>
              <li>Cumplir obligaciones fiscales.</li>
              <li>Resolver disputas.</li>
              <li>Atender contracargos.</li>
              <li>Prevenir fraude.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>La información financiera sensible permanece administrada por Stripe.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 12. Suscripciones Premium
              </h2>
            </section>
            <p>Prompt Studio ofrece determinados servicios mediante suscripciones Premium.</p>
            <p>Estas suscripciones permiten acceder a recursos exclusivos y funcionalidades adicionales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.1 Servicios incluidos</h3>
            <p>Dependiendo del plan contratado, el usuario podrá acceder a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts Premium.</li>
              <li>Colecciones exclusivas.</li>
              <li>Recursos HTML Premium.</li>
              <li>Plantillas avanzadas.</li>
              <li>Descargas ilimitadas cuando corresponda.</li>
              <li>Herramientas adicionales de Inteligencia Artificial.</li>
              <li>Contenido exclusivo.</li>
              <li>Nuevas funciones disponibles únicamente para suscriptores.</li>
            </ul>
            <p>Las características específicas podrán variar con el tiempo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.2 Activación</h3>
            <p>Una vez confirmado el pago mediante Stripe:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La suscripción será activada automáticamente.</li>
              <li>La cuenta será actualizada.</li>
              <li>MongoDB Atlas sincronizará el estado Premium.</li>
              <li>Clerk mantendrá el acceso correspondiente.</li>
            </ul>
            <p>El usuario podrá utilizar inmediatamente las funciones incluidas en su plan, salvo que se indique expresamente otro plazo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.3 Renovación automática</h3>
            <p>Cuando el usuario contrate una suscripción periódica, esta podrá renovarse automáticamente al finalizar cada período contratado, salvo que el usuario la cancele antes de la fecha de renovación.</p>
            <p>La renovación utilizará el método de pago registrado en Stripe.</p>
            <p>Cuando la legislación aplicable lo exija, Prompt Studio proporcionará la información necesaria sobre la renovación automática antes de la contratación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.4 Cancelación</h3>
            <p>El usuario podrá cancelar su suscripción en cualquier momento mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Portal del Cliente de Stripe.</li>
              <li>La configuración de su cuenta.</li>
              <li>Contactando con:</li>
            </ul>
            <p>user@example.com</p>
            <p>La cancelación impedirá futuras renovaciones, pero no afectará el acceso al período previamente pagado, salvo que la legislación aplicable disponga otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.5 Cambios de plan</h3>
            <p>Cuando la Plataforma lo permita, el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actualizar su plan.</li>
              <li>Reducir su plan.</li>
              <li>Cambiar la periodicidad.</li>
              <li>Reactivar una suscripción cancelada.</li>
            </ul>
            <p>Las modificaciones se procesarán mediante Stripe y podrán surtir efecto inmediatamente o al finalizar el período vigente, según la configuración del plan.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.6 Reembolsos</h3>
            <p>Los reembolsos de suscripciones estarán sujetos a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los Términos y Condiciones de Prompt Studio.</li>
              <li>La legislación aplicable.</li>
              <li>Las políticas de Stripe cuando correspondan.</li>
            </ul>
            <p>No todos los pagos serán reembolsables.</p>
            <p>Los casos serán evaluados individualmente cuando exista una obligación legal o una situación excepcional.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.7 Conservación de registros</h3>
            <p>Prompt Studio podrá conservar información relacionada con las suscripciones para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones fiscales.</li>
              <li>Resolver disputas.</li>
              <li>Atender auditorías.</li>
              <li>Gestionar contracargos.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Mantener el historial de la cuenta.</li>
            </ul>
            <p>La conservación se limitará al tiempo necesario conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.8 Finalización de la suscripción</h3>
            <p>Una vez finalizada la suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario conservará su cuenta gratuita, si está disponible.</li>
              <li>El acceso a funciones Premium será deshabilitado.</li>
              <li>Los recursos adquiridos mediante compra única continuarán disponibles cuando así lo indiquen las condiciones de compra.</li>
              <li>La información de la cuenta permanecerá protegida conforme a esta Política de Privacidad.</li>
            </ul>
            <p>La finalización de la suscripción no implica automáticamente la eliminación de la cuenta ni de los datos personales, salvo que el usuario solicite expresamente su eliminación.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 13. MongoDB Atlas (Base de Datos)
              </h2>
            </section>
            <p>Prompt Studio utiliza MongoDB Atlas como plataforma principal para el almacenamiento seguro de la información necesaria para el funcionamiento de los servicios.</p>
            <p>MongoDB Atlas proporciona una infraestructura administrada con altos estándares de disponibilidad, redundancia y seguridad para garantizar la integridad de los datos almacenados.</p>
            <p>Prompt Studio implementa medidas razonables para asegurar que únicamente el personal autorizado y los sistemas necesarios tengan acceso a la información almacenada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.1 Información almacenada</h3>
            <p>Dependiendo de los servicios utilizados por el usuario, MongoDB Atlas podrá almacenar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador del usuario.</li>
              <li>Perfil.</li>
              <li>Nombre.</li>
              <li>Correo electrónico.</li>
              <li>Preferencias.</li>
              <li>Idioma.</li>
              <li>Estado Premium.</li>
              <li>Historial de compras.</li>
              <li>Recursos adquiridos.</li>
              <li>Recursos descargados.</li>
              <li>Favoritos.</li>
              <li>Historial de actividad.</li>
              <li>Configuración personalizada.</li>
              <li>Programa de afiliados.</li>
              <li>Historial de generación de prompts.</li>
              <li>Registros técnicos necesarios para el funcionamiento del servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.2 Información sincronizada</h3>
            <p>MongoDB Atlas podrá sincronizar información proveniente de distintos servicios, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clerk.</li>
              <li>Stripe.</li>
              <li>Google Gemini / Genkit.</li>
              <li>Resend.</li>
              <li>Cloudflare R2.</li>
            </ul>
            <p>La sincronización se limita únicamente a la información necesaria para prestar correctamente los servicios contratados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.3 Historial de actividad</h3>
            <p>Con el objetivo de mejorar la experiencia del usuario, Prompt Studio podrá conservar registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recursos descargados.</li>
              <li>Recursos favoritos.</li>
              <li>Prompts utilizados.</li>
              <li>Historial de compras.</li>
              <li>Estado de las suscripciones.</li>
              <li>Uso de funciones Premium.</li>
              <li>Actividad del programa de afiliados.</li>
              <li>Configuración del usuario.</li>
            </ul>
            <p>Esta información facilita la recuperación de recursos y la continuidad de la experiencia dentro de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.4 Integridad de los datos</h3>
            <p>Prompt Studio adopta medidas técnicas para proteger la integridad de la información almacenada, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Validación de datos.</li>
              <li>Controles de acceso.</li>
              <li>Cifrado en tránsito mediante HTTPS/TLS.</li>
              <li>Copias de seguridad administradas por la infraestructura.</li>
              <li>Restricción de permisos.</li>
              <li>Auditorías internas cuando corresponda.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.5 Conservación</h3>
            <p>Los datos almacenados en MongoDB Atlas permanecerán únicamente durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la cuenta activa.</li>
              <li>Prestar los servicios.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Prevenir fraude.</li>
              <li>Defender derechos legales.</li>
            </ul>
            <p>Posteriormente podrán ser eliminados o anonimizados conforme a esta Política y a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.6 Eliminación de información</h3>
            <p>Cuando un usuario solicite la eliminación de su cuenta, Prompt Studio iniciará un proceso para eliminar o anonimizar la información almacenada en MongoDB Atlas, salvo aquella cuya conservación sea obligatoria por ley.</p>
            <p>La eliminación podrá comprender, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perfil.</li>
              <li>Preferencias.</li>
              <li>Favoritos.</li>
              <li>Configuración.</li>
              <li>Historial de actividad.</li>
              <li>Información de afiliados.</li>
              <li>Recursos asociados a la cuenta.</li>
            </ul>
            <p>Determinados registros relacionados con obligaciones fiscales, prevención de fraude o cumplimiento legal podrán conservarse durante el plazo exigido por la normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.7 Seguridad</h3>
            <p>MongoDB Atlas implementa mecanismos de seguridad que pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado de datos en reposo.</li>
              <li>Cifrado durante la transmisión.</li>
              <li>Autenticación segura.</li>
              <li>Control de acceso basado en roles.</li>
              <li>Monitoreo de infraestructura.</li>
              <li>Protección contra accesos no autorizados.</li>
            </ul>
            <p>Prompt Studio complementa estas medidas con controles internos para limitar el acceso únicamente al personal autorizado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.8 Copias de seguridad</h3>
            <p>Con el fin de garantizar la continuidad del servicio, la infraestructura podrá generar copias de seguridad de la información almacenada.</p>
            <p>Estas copias se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recuperación ante desastres.</li>
              <li>Restauración de información.</li>
              <li>Continuidad operativa.</li>
              <li>Protección frente a pérdida accidental de datos.</li>
            </ul>
            <p>Las copias de seguridad estarán sujetas a los mismos estándares de seguridad aplicables a la base de datos principal.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 14. Prompts Gratuitos y Premium
              </h2>
            </section>
            <p>Prompt Studio ofrece una combinación de recursos gratuitos y recursos Premium destinados a facilitar el trabajo con herramientas de Inteligencia Artificial.</p>
            <p>Los recursos digitales pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para imágenes.</li>
              <li>Prompts para video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para aplicaciones.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Demos.</li>
              <li>Ejemplos.</li>
              <li>Colecciones especializadas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.1 Recursos gratuitos</h3>
            <p>Los recursos gratuitos pueden descargarse o utilizarse conforme a las condiciones específicas indicadas en cada publicación.</p>
            <p>El acceso a determinados recursos gratuitos podrá requerir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Una cuenta registrada.</li>
              <li>Verificación del correo electrónico.</li>
              <li>Aceptación de los Términos y Condiciones.</li>
              <li>Cumplimiento de las políticas de uso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.2 Recursos Premium</h3>
            <p>Los recursos Premium únicamente estarán disponibles para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usuarios que hayan adquirido el recurso correspondiente.</li>
              <li>Usuarios con una suscripción Premium vigente.</li>
              <li>Usuarios que tengan acceso mediante promociones autorizadas.</li>
            </ul>
            <p>El acceso se habilitará automáticamente una vez confirmado el pago mediante Stripe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.3 Historial de compras</h3>
            <p>Prompt Studio podrá conservar un historial de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recursos adquiridos.</li>
              <li>Fecha de compra.</li>
              <li>Estado de acceso.</li>
              <li>Descargas realizadas.</li>
              <li>Versiones adquiridas.</li>
              <li>Licencias asociadas.</li>
            </ul>
            <p>Esta información permite restaurar el acceso cuando corresponda y verificar los derechos del usuario sobre los recursos adquiridos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.4 Descargas</h3>
            <p>Cuando un usuario descargue un recurso, Prompt Studio podrá registrar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fecha de descarga.</li>
              <li>Recurso descargado.</li>
              <li>Identificador del usuario.</li>
              <li>Estado de la descarga.</li>
              <li>Información técnica necesaria para garantizar la entrega.</li>
            </ul>
            <p>Estos registros se utilizan para mejorar la experiencia del usuario y resolver incidencias relacionadas con las descargas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.5 Favoritos</h3>
            <p>Prompt Studio podrá permitir que el usuario marque recursos como favoritos.</p>
            <p>La información relacionada con los favoritos podrá almacenarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personalizar la experiencia.</li>
              <li>Facilitar futuras consultas.</li>
              <li>Organizar el contenido del usuario.</li>
            </ul>
            <p>El usuario podrá modificar esta información en cualquier momento desde su cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.6 Licencias de uso</h3>
            <p>La compra o descarga de un recurso no implica la transferencia de la propiedad intelectual del mismo.</p>
            <p>Cada recurso estará sujeto a la licencia de uso indicada en su página correspondiente.</p>
            <p>El usuario deberá respetar las restricciones de uso, redistribución y comercialización establecidas en dicha licencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.7 Contenido generado mediante IA</h3>
            <p>Algunos prompts podrán haber sido creados o asistidos mediante herramientas de Inteligencia Artificial.</p>
            <p>Prompt Studio revisa razonablemente dichos recursos antes de su publicación; sin embargo, no garantiza que todos los resultados obtenidos por el usuario sean idénticos, ya que los modelos de IA pueden generar respuestas variables.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.8 Actualizaciones de recursos</h3>
            <p>Prompt Studio podrá actualizar, corregir o mejorar determinados recursos digitales.</p>
            <p>Cuando resulte posible, los usuarios que hayan adquirido un recurso podrán acceder a las actualizaciones conforme a las condiciones específicas indicadas para dicho producto.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 15. Google Gemini / Genkit (Inteligencia Artificial)
              </h2>
            </section>
            <p>Prompt Studio incorpora herramientas de Inteligencia Artificial utilizando Google Gemini y Google Genkit para ayudar a los usuarios en la creación, optimización y mejora de prompts destinados a diferentes modelos de IA.</p>
            <p>Estas herramientas están diseñadas para asistir al usuario y no sustituyen el criterio humano ni constituyen asesoría profesional.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.1 Finalidad del servicio</h3>
            <p>Las herramientas de Inteligencia Artificial disponibles en Prompt Studio tienen como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generar nuevos prompts.</li>
              <li>Mejorar prompts existentes.</li>
              <li>Optimizar instrucciones.</li>
              <li>Crear estructuras para imágenes.</li>
              <li>Crear estructuras para video.</li>
              <li>Crear estructuras para sitios web.</li>
              <li>Crear estructuras para aplicaciones.</li>
              <li>Asistir en tareas creativas.</li>
              <li>Incrementar la productividad del usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.2 Información enviada a la IA</h3>
            <p>Cuando el usuario utiliza los generadores de IA, podrá enviar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Texto del prompt.</li>
              <li>Descripción de la solicitud.</li>
              <li>Parámetros de generación.</li>
              <li>Configuración elegida.</li>
              <li>Preferencias del usuario.</li>
              <li>Correcciones posteriores.</li>
              <li>Conversaciones necesarias para generar el resultado solicitado.</li>
            </ul>
            <p>Esta información podrá ser procesada temporalmente por Google Gemini o Genkit para generar la respuesta correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.3 Finalidad del tratamiento</h3>
            <p>La información enviada al modelo de IA se utiliza exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar la solicitud del usuario.</li>
              <li>Generar el contenido solicitado.</li>
              <li>Mantener la continuidad de la sesión cuando corresponda.</li>
              <li>Mejorar el funcionamiento técnico de la Plataforma.</li>
              <li>Detectar errores.</li>
            </ul>
            <p>Prompt Studio no utiliza automáticamente los prompts enviados por los usuarios para entrenar modelos propios de Inteligencia Artificial.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.4 Contenido generado</h3>
            <p>Las respuestas generadas mediante Inteligencia Artificial pueden contener:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Errores.</li>
              <li>Omisiones.</li>
              <li>Inexactitudes.</li>
              <li>Resultados inesperados.</li>
              <li>Información incompleta.</li>
            </ul>
            <p>El usuario es responsable de revisar cuidadosamente cualquier contenido generado antes de utilizarlo para fines profesionales, comerciales o personales.</p>
            <p>Prompt Studio no garantiza que el contenido generado sea completamente exacto, original o adecuado para un propósito específico.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.5 Contenido prohibido</h3>
            <p>Los usuarios no deberán utilizar las herramientas de IA para generar contenido que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sea ilegal.</li>
              <li>Infrinja derechos de autor.</li>
              <li>Vulnere marcas registradas.</li>
              <li>Promueva violencia.</li>
              <li>Incite al odio.</li>
              <li>Contenga malware.</li>
              <li>Facilite actividades ilícitas.</li>
              <li>Vulnere la privacidad de terceros.</li>
              <li>Contenga información confidencial cuya divulgación no esté autorizada.</li>
            </ul>
            <p>Prompt Studio podrá limitar o bloquear el uso de las herramientas cuando detecte actividades que incumplan estos principios o los Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.6 Conservación de las solicitudes</h3>
            <p>Prompt Studio podrá conservar temporalmente determinadas solicitudes de IA con las siguientes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recuperar sesiones.</li>
              <li>Mejorar la experiencia del usuario.</li>
              <li>Resolver incidencias técnicas.</li>
              <li>Detectar abusos del servicio.</li>
              <li>Garantizar la estabilidad de la Plataforma.</li>
            </ul>
            <p>Cuando sea posible, la información será anonimizada o eliminada una vez que deje de ser necesaria.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.7 Seguridad de las solicitudes</h3>
            <p>Las comunicaciones entre Prompt Studio y los servicios de Google Gemini / Genkit se realizan mediante conexiones cifradas utilizando protocolos seguros.</p>
            <p>Prompt Studio adopta medidas razonables para reducir el acceso no autorizado a la información enviada por los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.8 Propiedad del contenido generado</h3>
            <p>Salvo disposición distinta en la licencia específica del servicio o en la legislación aplicable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario conserva los derechos que legalmente le correspondan sobre los prompts que cree.</li>
              <li>Prompt Studio no reclama la propiedad del contenido generado por el usuario.</li>
              <li>Los modelos de IA utilizados pueden producir resultados similares para distintos usuarios debido a la naturaleza probabilística de la Inteligencia Artificial.</li>
            </ul>
            <p>Por ello, Prompt Studio no garantiza la exclusividad absoluta de los resultados generados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 16. Cloudflare R2 (Almacenamiento de Recursos)
              </h2>
            </section>
            <p>Prompt Studio utiliza Cloudflare R2 como sistema principal para el almacenamiento de recursos digitales distribuidos a través de la Plataforma.</p>
            <p>Cloudflare R2 permite ofrecer un acceso rápido, seguro y escalable a los archivos utilizados por los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.1 Recursos almacenados</h3>
            <p>Cloudflare R2 podrá almacenar, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts descargables.</li>
              <li>Recursos Premium.</li>
              <li>Recursos gratuitos.</li>
              <li>Archivos HTML.</li>
              <li>Demos.</li>
              <li>Plantillas.</li>
              <li>Imágenes.</li>
              <li>Videos de demostración.</li>
              <li>Archivos ZIP.</li>
              <li>Recursos estáticos.</li>
              <li>Documentación relacionada con los productos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.2 Finalidad del almacenamiento</h3>
            <p>Los archivos almacenados en Cloudflare R2 tienen como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitar las descargas.</li>
              <li>Mejorar la velocidad de acceso.</li>
              <li>Reducir tiempos de carga.</li>
              <li>Garantizar la disponibilidad de los recursos.</li>
              <li>Optimizar la distribución internacional del contenido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.3 Información técnica</h3>
            <p>Cloudflare R2 podrá generar registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargas realizadas.</li>
              <li>Solicitudes de archivos.</li>
              <li>Uso del ancho de banda.</li>
              <li>Errores de acceso.</li>
              <li>Disponibilidad del servicio.</li>
              <li>Rendimiento de la infraestructura.</li>
            </ul>
            <p>Prompt Studio utiliza esta información exclusivamente para fines técnicos, estadísticos y de seguridad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.4 Control de acceso</h3>
            <p>Los recursos Premium se encuentran protegidos mediante mecanismos que restringen el acceso únicamente a los usuarios autorizados.</p>
            <p>Entre ellos pueden incluirse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verificación de autenticación mediante Clerk.</li>
              <li>Validación de compras realizadas con Stripe.</li>
              <li>Verificación de suscripción Premium.</li>
              <li>Tokens temporales de descarga.</li>
              <li>Controles internos de acceso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.5 Disponibilidad</h3>
            <p>Prompt Studio realiza esfuerzos razonables para mantener disponibles los recursos digitales.</p>
            <p>Sin embargo, podrán producirse interrupciones derivadas de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento.</li>
              <li>Actualizaciones.</li>
              <li>Problemas de infraestructura.</li>
              <li>Incidentes de Cloudflare.</li>
              <li>Fallos de conectividad.</li>
              <li>Circunstancias de fuerza mayor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.6 Seguridad</h3>
            <p>Los archivos almacenados en Cloudflare R2 se protegen mediante medidas de seguridad que pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado durante la transmisión.</li>
              <li>Controles de acceso.</li>
              <li>Restricciones administrativas.</li>
              <li>Infraestructura distribuida.</li>
              <li>Monitoreo de disponibilidad.</li>
              <li>Protección frente a accesos no autorizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.7 Eliminación de recursos</h3>
            <p>Cuando un recurso deje de estar disponible o sea retirado de la Plataforma, Prompt Studio podrá eliminarlo de Cloudflare R2.</p>
            <p>No obstante, podrán conservarse copias de seguridad durante el tiempo estrictamente necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recuperación ante desastres.</li>
              <li>Continuidad operativa.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.8 Recursos descargados</h3>
            <p>Una vez que el usuario descarga un recurso en su propio dispositivo, Prompt Studio no tiene control sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Su almacenamiento.</li>
              <li>Su distribución.</li>
              <li>Su modificación.</li>
              <li>Su eliminación.</li>
            </ul>
            <p>El usuario es responsable de proteger los archivos descargados y utilizarlos conforme a la licencia correspondiente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 17. Resend (Correos Electrónicos)
              </h2>
            </section>
            <p>Prompt Studio utiliza Resend como proveedor oficial para el envío de correos electrónicos relacionados con el funcionamiento de la Plataforma, las compras realizadas por los usuarios y, cuando exista el consentimiento correspondiente, las campañas de email marketing.</p>
            <p>Resend actúa como proveedor tecnológico especializado en el envío de correo electrónico y procesa únicamente la información necesaria para garantizar la entrega, seguridad y seguimiento de las comunicaciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.1 Finalidad de los correos electrónicos</h3>
            <p>Prompt Studio podrá enviar correos electrónicos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar el registro de una cuenta.</li>
              <li>Verificar direcciones de correo electrónico.</li>
              <li>Confirmar compras.</li>
              <li>Confirmar suscripciones.</li>
              <li>Enviar facturas.</li>
              <li>Confirmar pagos.</li>
              <li>Restablecer contraseñas.</li>
              <li>Informar sobre cambios en la cuenta.</li>
              <li>Notificar incidencias de seguridad.</li>
              <li>Informar actualizaciones importantes de la Plataforma.</li>
              <li>Responder solicitudes enviadas al soporte.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.2 Información procesada por Resend</h3>
            <p>Para prestar el servicio de correo electrónico, Resend podrá procesar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dirección de correo electrónico.</li>
              <li>Nombre del destinatario (cuando esté disponible).</li>
              <li>Asunto del mensaje.</li>
              <li>Fecha y hora de envío.</li>
              <li>Estado de entrega.</li>
              <li>Estado de apertura (cuando sea técnicamente posible).</li>
              <li>Clics en enlaces (cuando esta funcionalidad esté habilitada).</li>
              <li>Errores de entrega.</li>
              <li>Rebotes (“bounces”).</li>
              <li>Cancelaciones de suscripción.</li>
            </ul>
            <p>Prompt Studio únicamente utiliza esta información para administrar correctamente las comunicaciones enviadas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.3 Correos transaccionales</h3>
            <p>Los correos transaccionales son aquellos necesarios para el funcionamiento de la Plataforma.</p>
            <p>Entre ellos se incluyen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Activación de cuentas.</li>
              <li>Recuperación de contraseña.</li>
              <li>Confirmaciones de compra.</li>
              <li>Confirmaciones de pago.</li>
              <li>Facturación.</li>
              <li>Cambios de seguridad.</li>
              <li>Confirmación de suscripciones.</li>
              <li>Notificaciones importantes relacionadas con el servicio.</li>
            </ul>
            <p>Estos correos podrán enviarse incluso cuando el usuario haya cancelado la recepción de comunicaciones promocionales, ya que son necesarios para la prestación del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.4 Seguridad del correo electrónico</h3>
            <p>Prompt Studio adopta medidas razonables para proteger las comunicaciones enviadas mediante Resend.</p>
            <p>Estas medidas pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación del dominio.</li>
              <li>Cifrado durante la transmisión.</li>
              <li>Protección contra suplantación de identidad.</li>
              <li>Validación de remitentes.</li>
              <li>Supervisión de entregabilidad.</li>
              <li>Control de rebotes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.5 Conservación de registros</h3>
            <p>Prompt Studio podrá conservar registros relacionados con los correos enviados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar la entrega.</li>
              <li>Resolver incidencias.</li>
              <li>Atender reclamaciones.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Detectar abusos.</li>
              <li>Prevenir fraude.</li>
            </ul>
            <p>La conservación se limitará al tiempo necesario para dichas finalidades.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.6 Eliminación de contactos</h3>
            <p>Cuando el usuario elimine su cuenta o solicite la eliminación de sus datos personales, Prompt Studio adoptará medidas razonables para eliminar su información de las listas administradas mediante Resend, salvo cuando exista una obligación legal que exija su conservación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.7 Transferencias internacionales</h3>
            <p>Debido a la naturaleza del servicio prestado por Resend, determinada información podrá tratarse en servidores ubicados fuera del país de residencia del usuario.</p>
            <p>Cuando resulte aplicable, Prompt Studio procurará que dichas transferencias se realicen utilizando mecanismos adecuados conforme al RGPD y demás legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.8 Proveedor independiente</h3>
            <p>Resend actúa como proveedor independiente de servicios tecnológicos.</p>
            <p>El tratamiento realizado directamente por Resend también se encuentra sujeto a su propia Política de Privacidad y a sus condiciones de servicio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 18. Marketing y Newsletters
              </h2>
            </section>
            <p>Prompt Studio podrá enviar comunicaciones promocionales relacionadas con sus productos y servicios cuando el usuario haya otorgado el consentimiento requerido por la legislación aplicable.</p>
            <p>Nuestro objetivo es mantener informados a los usuarios acerca de novedades relevantes sin realizar envíos excesivos o no deseados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.1 Comunicaciones promocionales</h3>
            <p>Las campañas promocionales podrán incluir información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nuevos prompts.</li>
              <li>Nuevas colecciones.</li>
              <li>Recursos gratuitos.</li>
              <li>Recursos Premium.</li>
              <li>Actualizaciones de la Plataforma.</li>
              <li>Nuevas herramientas de IA.</li>
              <li>Promociones.</li>
              <li>Descuentos.</li>
              <li>Eventos.</li>
              <li>Noticias relacionadas con Inteligencia Artificial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.2 Consentimiento</h3>
            <p>Cuando la legislación aplicable lo requiera, Prompt Studio solicitará el consentimiento previo antes de enviar comunicaciones promocionales.</p>
            <p>El consentimiento podrá obtenerse mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Formularios de registro.</li>
              <li>Casillas de aceptación.</li>
              <li>Configuración de preferencias.</li>
              <li>Herramientas equivalentes autorizadas por la legislación.</li>
            </ul>
            <p>La ausencia de consentimiento no impedirá el uso general de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.3 Cancelación de la suscripción</h3>
            <p>El usuario podrá cancelar la recepción de comunicaciones promocionales en cualquier momento mediante cualquiera de los siguientes mecanismos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El enlace “Cancelar suscripción” incluido en cada correo.</li>
              <li>Las preferencias de la cuenta, cuando estén disponibles.</li>
              <li>Una solicitud enviada a:</li>
            </ul>
            <p>user@example.com</p>
            <p>La cancelación será procesada dentro de un plazo razonable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.4 Comunicaciones obligatorias</h3>
            <p>La cancelación del newsletter no impedirá que Prompt Studio envíe comunicaciones necesarias para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seguridad.</li>
              <li>Recuperación de cuenta.</li>
              <li>Compras.</li>
              <li>Facturación.</li>
              <li>Confirmación de pagos.</li>
              <li>Renovaciones de suscripciones.</li>
              <li>Cambios importantes en los Términos y Condiciones.</li>
              <li>Cambios relevantes en la Política de Privacidad.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
            <p>Estas comunicaciones no tienen carácter publicitario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.5 Segmentación</h3>
            <p>Con el consentimiento del usuario, Prompt Studio podrá segmentar las comunicaciones teniendo en cuenta información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Idioma.</li>
              <li>País.</li>
              <li>Recursos adquiridos.</li>
              <li>Suscripción Premium.</li>
              <li>Categorías de interés.</li>
              <li>Actividad general dentro de la Plataforma.</li>
            </ul>
            <p>La segmentación tiene como finalidad enviar contenido más relevante y reducir el envío de comunicaciones innecesarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.6 Estadísticas</h3>
            <p>Prompt Studio podrá utilizar información estadística relacionada con las campañas para analizar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tasa de entrega.</li>
              <li>Tasa de apertura.</li>
              <li>Clics.</li>
              <li>Cancelaciones de suscripción.</li>
              <li>Errores de entrega.</li>
              <li>Rendimiento de campañas.</li>
            </ul>
            <p>Estas estadísticas se utilizan exclusivamente para mejorar la calidad de nuestras comunicaciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.7 Protección de la información</h3>
            <p>Las listas de correo electrónico administradas por Prompt Studio no serán vendidas, alquiladas ni cedidas a terceros con fines comerciales.</p>
            <p>El acceso a dichas listas estará limitado al personal autorizado y a los proveedores tecnológicos necesarios para prestar el servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.8 Revocación del consentimiento</h3>
            <p>El usuario podrá retirar en cualquier momento el consentimiento otorgado para recibir comunicaciones promocionales.</p>
            <p>La revocación no afectará la licitud del tratamiento realizado antes de su retiro ni impedirá el envío de comunicaciones estrictamente necesarias para la prestación de los servicios contratados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 19. Cookies y Tecnologías Similares
              </h2>
            </section>
            <p>Prompt Studio utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de la Plataforma, mejorar la experiencia del usuario, analizar el uso del sitio, optimizar el rendimiento y ofrecer determinadas funcionalidades.</p>
            <p>Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita nuestro sitio web.</p>
            <p>Cuando la legislación aplicable lo exija, Prompt Studio solicitará el consentimiento del usuario antes de instalar cookies que no sean estrictamente necesarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.1 ¿Qué son las cookies?</h3>
            <p>Las cookies permiten recordar determinada información relacionada con la navegación del usuario.</p>
            <p>Dependiendo de su finalidad, las cookies pueden utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener sesiones activas.</li>
              <li>Recordar preferencias.</li>
              <li>Analizar estadísticas.</li>
              <li>Mejorar el rendimiento.</li>
              <li>Incrementar la seguridad.</li>
              <li>Optimizar la experiencia del usuario.</li>
            </ul>
            <p>Las cookies pueden ser:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cookies propias.</li>
              <li>Cookies de terceros.</li>
              <li>Cookies de sesión.</li>
              <li>Cookies persistentes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.2 Cookies estrictamente necesarias</h3>
            <p>Estas cookies son indispensables para el funcionamiento de Prompt Studio.</p>
            <p>Permiten, entre otras funciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión iniciada.</li>
              <li>Verificar la autenticación.</li>
              <li>Recordar el estado de la cuenta.</li>
              <li>Proteger la seguridad.</li>
              <li>Detectar accesos sospechosos.</li>
              <li>Administrar preferencias esenciales.</li>
            </ul>
            <p>Estas cookies son utilizadas principalmente por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clerk</li>
              <li>Vercel</li>
            </ul>
            <p>La desactivación de estas cookies puede impedir el funcionamiento correcto de determinadas funciones de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.3 Cookies analíticas</h3>
            <p>Prompt Studio utiliza herramientas analíticas para comprender el comportamiento general de los usuarios y mejorar continuamente el servicio.</p>
            <p>Estas cookies permiten recopilar información estadística como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitantes.</li>
              <li>Páginas más consultadas.</li>
              <li>Tiempo de permanencia.</li>
              <li>Flujo de navegación.</li>
              <li>Recursos descargados.</li>
              <li>Conversión.</li>
              <li>Dispositivos utilizados.</li>
              <li>Navegadores.</li>
              <li>País o región aproximada.</li>
            </ul>
            <p>Estas cookies son utilizadas principalmente por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics 4</li>
              <li>Firebase Analytics</li>
              <li>Vercel Analytics</li>
            </ul>
            <p>La información recopilada se utiliza únicamente con fines estadísticos y de mejora del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.4 Cookies relacionadas con autenticación</h3>
            <p>Clerk puede utilizar cookies técnicas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la sesión del usuario.</li>
              <li>Gestionar la autenticación.</li>
              <li>Recordar dispositivos confiables.</li>
              <li>Verificar la identidad.</li>
              <li>Prevenir ataques automatizados.</li>
              <li>Gestionar la autenticación multifactor cuando esté habilitada.</li>
            </ul>
            <p>Estas cookies son esenciales para la seguridad de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.5 Cookies relacionadas con pagos</h3>
            <p>Cuando el usuario realiza una compra o administra una suscripción, Stripe podrá utilizar cookies y tecnologías similares para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar pagos.</li>
              <li>Detectar fraude.</li>
              <li>Verificar transacciones.</li>
              <li>Gestionar el Portal del Cliente.</li>
              <li>Cumplir obligaciones regulatorias.</li>
              <li>Mejorar la seguridad del proceso de pago.</li>
            </ul>
            <p>Prompt Studio no controla directamente estas cookies.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.6 Cookies relacionadas con infraestructura</h3>
            <p>Prompt Studio se encuentra alojado en la infraestructura de Vercel.</p>
            <p>Vercel podrá utilizar cookies técnicas relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Balanceo de carga.</li>
              <li>Distribución de contenido.</li>
              <li>Optimización del rendimiento.</li>
              <li>Seguridad.</li>
              <li>Protección frente a ataques.</li>
              <li>Disponibilidad del servicio.</li>
            </ul>
            <p>Estas cookies son necesarias para garantizar el funcionamiento adecuado del sitio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.7 Gestión de cookies</h3>
            <p>El usuario podrá administrar las cookies mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El banner de consentimiento mostrado por la Plataforma, cuando corresponda.</li>
              <li>La configuración de su navegador.</li>
              <li>Herramientas de privacidad del dispositivo.</li>
              <li>Complementos específicos del navegador.</li>
            </ul>
            <p>La desactivación de determinadas cookies puede afectar el funcionamiento de algunas funciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.8 Conservación</h3>
            <p>Las cookies podrán permanecer activas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Durante la sesión actual.</li>
              <li>Hasta la fecha de expiración configurada.</li>
              <li>Hasta que el usuario las elimine manualmente.</li>
              <li>Hasta que retire su consentimiento, cuando corresponda.</li>
            </ul>
            <p>Prompt Studio revisa periódicamente las cookies utilizadas para minimizar su duración cuando resulte posible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.9 Consentimiento</h3>
            <p>Cuando la legislación aplicable lo requiera, Prompt Studio solicitará el consentimiento previo antes de instalar cookies no esenciales.</p>
            <p>El usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aceptarlas.</li>
              <li>Rechazarlas.</li>
              <li>Modificar posteriormente sus preferencias.</li>
            </ul>
            <p>La retirada del consentimiento no afectará la licitud del tratamiento realizado antes de dicha revocación.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 20. Google Analytics 4
              </h2>
            </section>
            <p>Prompt Studio utiliza Google Analytics 4 (GA4) para analizar el uso general de la Plataforma y comprender cómo interactúan los usuarios con nuestros servicios.</p>
            <p>Google Analytics 4 recopila información estadística agregada con el objetivo de mejorar continuamente la experiencia del usuario.</p>
            <p>Prompt Studio no utiliza Google Analytics 4 para identificar personalmente a los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.1 Finalidad</h3>
            <p>Google Analytics 4 permite a Prompt Studio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comprender el comportamiento general de los usuarios.</li>
              <li>Identificar las páginas más visitadas.</li>
              <li>Analizar conversiones.</li>
              <li>Detectar problemas de navegación.</li>
              <li>Mejorar el rendimiento.</li>
              <li>Evaluar nuevas funcionalidades.</li>
              <li>Optimizar la experiencia de usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.2 Información recopilada</h3>
            <p>Google Analytics 4 podrá recopilar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de visitantes.</li>
              <li>Duración de las sesiones.</li>
              <li>Eventos.</li>
              <li>Navegación.</li>
              <li>Tipo de navegador.</li>
              <li>Sistema operativo.</li>
              <li>Tipo de dispositivo.</li>
              <li>Idioma.</li>
              <li>País o región aproximada.</li>
              <li>Fuente del tráfico.</li>
              <li>Resolución de pantalla.</li>
            </ul>
            <p>Cuando resulte técnicamente posible, Prompt Studio procurará utilizar las opciones de anonimización de direcciones IP disponibles en Google Analytics.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.3 Eventos</h3>
            <p>Google Analytics 4 podrá registrar eventos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro de usuarios.</li>
              <li>Inicio de sesión.</li>
              <li>Descarga de recursos.</li>
              <li>Compras.</li>
              <li>Suscripciones.</li>
              <li>Uso de herramientas de IA.</li>
              <li>Visualización de páginas.</li>
              <li>Interacciones con botones.</li>
              <li>Conversión de campañas.</li>
            </ul>
            <p>Estos eventos se utilizan exclusivamente para comprender el funcionamiento general de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.4 Información no recopilada</h3>
            <p>Google Analytics 4 no se utiliza para recopilar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contraseñas.</li>
              <li>Información completa de tarjetas bancarias.</li>
              <li>Datos almacenados por Clerk.</li>
              <li>Información financiera confidencial.</li>
              <li>Contenido privado de las conversaciones con IA.</li>
              <li>Documentos personales del usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.5 Conservación</h3>
            <p>La información recopilada mediante Google Analytics 4 será conservada conforme a la configuración establecida por Prompt Studio y a las políticas de Google.</p>
            <p>Una vez cumplidos los períodos de conservación, los datos podrán eliminarse o anonimizarse.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.6 Desactivación</h3>
            <p>El usuario podrá limitar el funcionamiento de Google Analytics 4 mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El banner de consentimiento.</li>
              <li>La configuración del navegador.</li>
              <li>Herramientas de privacidad.</li>
              <li>Complementos oficiales de Google cuando estén disponibles.</li>
            </ul>
            <p>La desactivación de Google Analytics 4 no impedirá el uso general de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.7 Transferencias internacionales</h3>
            <p>Google podrá tratar información en servidores ubicados fuera del país de residencia del usuario.</p>
            <p>Cuando resulte aplicable, Prompt Studio procurará que dichas transferencias se realicen utilizando mecanismos reconocidos por la legislación aplicable, incluyendo el Reglamento General de Protección de Datos (RGPD/GDPR).</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.8 Uso responsable</h3>
            <p>Prompt Studio utiliza Google Analytics 4 exclusivamente para fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Estadística.</li>
              <li>Optimización.</li>
              <li>Rendimiento.</li>
              <li>Mejora continua.</li>
            </ul>
            <p>No utilizamos Google Analytics 4 para adoptar decisiones automatizadas que produzcan efectos jurídicos o significativamente similares sobre los usuarios.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 21. Firebase Analytics
              </h2>
            </section>
            <p>Prompt Studio utiliza Firebase Analytics para comprender cómo los usuarios interactúan con determinadas funcionalidades de la Plataforma, medir eventos importantes y mejorar continuamente la experiencia de uso.</p>
            <p>Firebase Analytics recopila información estadística sobre la interacción del usuario y permite analizar el comportamiento general dentro de la Plataforma sin necesidad de identificar personalmente a los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.1 Finalidad</h3>
            <p>Firebase Analytics se utiliza para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analizar la interacción con la Plataforma.</li>
              <li>Medir el uso de nuevas funcionalidades.</li>
              <li>Detectar errores de navegación.</li>
              <li>Evaluar el rendimiento de herramientas.</li>
              <li>Mejorar la experiencia del usuario.</li>
              <li>Analizar embudos de conversión.</li>
              <li>Comprender el uso de los recursos Premium.</li>
              <li>Optimizar futuras versiones de Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.2 Eventos registrados</h3>
            <p>Firebase Analytics podrá registrar eventos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro de nuevos usuarios.</li>
              <li>Inicio de sesión.</li>
              <li>Cierre de sesión.</li>
              <li>Descarga de recursos.</li>
              <li>Compra de productos.</li>
              <li>Activación de suscripciones.</li>
              <li>Cancelación de suscripciones.</li>
              <li>Uso de herramientas de IA.</li>
              <li>Visualización de recursos.</li>
              <li>Interacciones con botones.</li>
              <li>Errores de funcionamiento.</li>
              <li>Eventos personalizados relacionados con la Plataforma.</li>
            </ul>
            <p>Los eventos registrados pueden variar conforme evolucionen las funcionalidades de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.3 Información recopilada</h3>
            <p>Firebase Analytics podrá recopilar información técnica como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificadores técnicos del dispositivo.</li>
              <li>Tipo de dispositivo.</li>
              <li>Sistema operativo.</li>
              <li>Modelo del dispositivo.</li>
              <li>Idioma.</li>
              <li>País o región aproximada.</li>
              <li>Versión de la aplicación o del sitio.</li>
              <li>Resolución de pantalla.</li>
              <li>Eventos de interacción.</li>
              <li>Tiempo de uso.</li>
            </ul>
            <p>Prompt Studio procura configurar Firebase Analytics para minimizar el tratamiento de información personal siempre que sea posible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.4 Finalidad estadística</h3>
            <p>Toda la información recopilada mediante Firebase Analytics se utiliza exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Elaborar estadísticas.</li>
              <li>Detectar errores.</li>
              <li>Analizar tendencias.</li>
              <li>Mejorar el rendimiento.</li>
              <li>Optimizar la navegación.</li>
              <li>Evaluar nuevas funciones.</li>
            </ul>
            <p>Prompt Studio no utiliza Firebase Analytics para crear perfiles individuales destinados a decisiones automatizadas con efectos jurídicos sobre los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.5 Conservación</h3>
            <p>Los datos recopilados mediante Firebase Analytics se conservarán conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La configuración establecida por Prompt Studio.</li>
              <li>Las políticas de retención de Google.</li>
              <li>La legislación aplicable.</li>
            </ul>
            <p>Una vez cumplido el período correspondiente, la información podrá eliminarse o anonimizarse.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.6 Desactivación</h3>
            <p>Cuando la legislación aplicable lo requiera, el usuario podrá limitar el uso de Firebase Analytics mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El banner de consentimiento.</li>
              <li>La configuración de cookies.</li>
              <li>Herramientas de privacidad del navegador.</li>
              <li>Configuración del dispositivo cuando resulte aplicable.</li>
            </ul>
            <p>La desactivación de Firebase Analytics no impedirá el uso general de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.7 Transferencias internacionales</h3>
            <p>Firebase Analytics podrá tratar información en servidores ubicados fuera del país de residencia del usuario.</p>
            <p>Cuando resulte aplicable, Prompt Studio procurará que dichas transferencias se realicen utilizando mecanismos reconocidos por la legislación aplicable, incluyendo el RGPD.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.8 Protección de la privacidad</h3>
            <p>Prompt Studio configura Firebase Analytics procurando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Minimizar la recopilación de datos.</li>
              <li>Limitar el acceso a la información.</li>
              <li>Utilizar información agregada cuando resulte posible.</li>
              <li>Reducir el tratamiento de datos identificables.</li>
              <li>Respetar los derechos de privacidad de los usuarios.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 22. Vercel Analytics
              </h2>
            </section>
            <p>Prompt Studio utiliza Vercel Analytics para supervisar el rendimiento técnico del sitio web, optimizar la infraestructura y garantizar una experiencia de navegación rápida y estable.</p>
            <p>Vercel Analytics se centra principalmente en métricas relacionadas con el funcionamiento del sitio y no tiene como finalidad identificar personalmente a los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.1 Finalidad</h3>
            <p>Vercel Analytics permite a Prompt Studio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Medir el rendimiento del sitio.</li>
              <li>Detectar errores.</li>
              <li>Optimizar la velocidad.</li>
              <li>Analizar tiempos de carga.</li>
              <li>Supervisar la estabilidad.</li>
              <li>Mejorar la experiencia del usuario.</li>
              <li>Detectar cuellos de botella.</li>
              <li>Evaluar el comportamiento general del tráfico.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.2 Información recopilada</h3>
            <p>Vercel Analytics podrá recopilar información técnica como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tiempo de carga de páginas.</li>
              <li>Latencia.</li>
              <li>Rendimiento del servidor.</li>
              <li>Estado de la infraestructura.</li>
              <li>Tipo de navegador.</li>
              <li>Tipo de dispositivo.</li>
              <li>Sistema operativo.</li>
              <li>Resolución de pantalla.</li>
              <li>Región aproximada.</li>
              <li>Eventos relacionados con el rendimiento.</li>
            </ul>
            <p>Esta información se utiliza exclusivamente para optimizar el funcionamiento de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.3 Métricas de rendimiento</h3>
            <p>Las métricas obtenidas mediante Vercel Analytics permiten identificar aspectos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Velocidad de carga.</li>
              <li>Rendimiento del frontend.</li>
              <li>Rendimiento del backend.</li>
              <li>Disponibilidad del servicio.</li>
              <li>Errores de infraestructura.</li>
              <li>Estabilidad de la Plataforma.</li>
              <li>Optimización de recursos.</li>
              <li>Consumo de ancho de banda.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.4 Supervisión de la infraestructura</h3>
            <p>Prompt Studio utiliza Vercel Analytics para supervisar continuamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Disponibilidad del sitio.</li>
              <li>Estado de los servidores.</li>
              <li>Respuesta de las funciones.</li>
              <li>Errores del sistema.</li>
              <li>Rendimiento de la infraestructura.</li>
              <li>Estabilidad del servicio.</li>
            </ul>
            <p>Esta supervisión permite detectar y corregir problemas con mayor rapidez.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.5 Uso de la información</h3>
            <p>La información recopilada mediante Vercel Analytics se utiliza exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar el rendimiento.</li>
              <li>Incrementar la estabilidad.</li>
              <li>Optimizar la experiencia del usuario.</li>
              <li>Reducir tiempos de respuesta.</li>
              <li>Detectar incidencias técnicas.</li>
            </ul>
            <p>Prompt Studio no utiliza esta información con fines publicitarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.6 Conservación</h3>
            <p>Las métricas recopiladas mediante Vercel Analytics se conservarán únicamente durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Elaborar estadísticas.</li>
              <li>Detectar incidencias.</li>
              <li>Analizar tendencias.</li>
              <li>Mejorar el rendimiento.</li>
            </ul>
            <p>Posteriormente podrán eliminarse o anonimizarse conforme a las políticas aplicables.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.7 Seguridad</h3>
            <p>Prompt Studio limita el acceso a la información recopilada mediante Vercel Analytics únicamente al personal autorizado que necesite utilizarla para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Administración técnica.</li>
              <li>Desarrollo.</li>
              <li>Seguridad.</li>
              <li>Optimización del servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.8 Uso responsable</h3>
            <p>Prompt Studio utiliza Vercel Analytics exclusivamente con fines relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rendimiento.</li>
              <li>Disponibilidad.</li>
              <li>Optimización.</li>
              <li>Seguridad técnica.</li>
            </ul>
            <p>No se utiliza para identificar individualmente a los usuarios ni para adoptar decisiones automatizadas que produzcan efectos jurídicos sobre ellos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 23. Webhooks e Integraciones
              </h2>
            </section>
            <p>Prompt Studio utiliza webhooks para mantener sincronizados los distintos servicios que forman parte de la Plataforma.</p>
            <p>Los webhooks permiten que los sistemas intercambien información de forma automática cuando ocurre un evento específico, garantizando la consistencia y seguridad de los datos.</p>
            <p>Prompt Studio utiliza los webhooks únicamente para prestar los servicios solicitados por el usuario y mantener la integridad de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.1 ¿Qué es un webhook?</h3>
            <p>Un webhook es un mecanismo de comunicación automática entre servicios que envía información cuando ocurre un evento determinado.</p>
            <p>A diferencia de las consultas periódicas, los webhooks permiten que los sistemas reaccionen inmediatamente cuando sucede un cambio relevante.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.2 Finalidad</h3>
            <p>Prompt Studio utiliza webhooks para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sincronizar usuarios.</li>
              <li>Confirmar pagos.</li>
              <li>Actualizar suscripciones.</li>
              <li>Administrar compras.</li>
              <li>Registrar cancelaciones.</li>
              <li>Eliminar cuentas.</li>
              <li>Actualizar perfiles.</li>
              <li>Gestionar eventos técnicos.</li>
              <li>Mantener la coherencia entre los distintos servicios utilizados por la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.3 Webhooks de Clerk</h3>
            <p>Clerk podrá enviar eventos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creación de usuarios.</li>
              <li>Verificación del correo electrónico.</li>
              <li>Actualización del perfil.</li>
              <li>Eliminación de cuentas.</li>
              <li>Inicio de sesión.</li>
              <li>Cierre de sesión.</li>
              <li>Cambios en los metadatos.</li>
              <li>Actualización de sesiones.</li>
              <li>Eventos relacionados con autenticación.</li>
            </ul>
            <p>Prompt Studio utiliza esta información para mantener sincronizada la cuenta del usuario dentro de MongoDB Atlas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.4 Webhooks de Stripe</h3>
            <p>Stripe podrá enviar eventos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pagos completados.</li>
              <li>Pagos fallidos.</li>
              <li>Pagos pendientes.</li>
              <li>Reembolsos.</li>
              <li>Contracargos.</li>
              <li>Cancelaciones.</li>
              <li>Renovaciones automáticas.</li>
              <li>Actualización del método de pago.</li>
              <li>Facturación.</li>
              <li>Expiración de suscripciones.</li>
            </ul>
            <p>Estos eventos permiten activar o desactivar automáticamente el acceso a los recursos Premium.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.5 Integración con MongoDB Atlas</h3>
            <p>Los eventos recibidos mediante webhooks podrán actualizar automáticamente la información almacenada en MongoDB Atlas, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Estado Premium.</li>
              <li>Historial de compras.</li>
              <li>Estado de la suscripción.</li>
              <li>Perfil del usuario.</li>
              <li>Preferencias.</li>
              <li>Actividad necesaria para la prestación del servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.6 Integración con Resend</h3>
            <p>Prompt Studio podrá utilizar eventos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro exitoso.</li>
              <li>Confirmación de cuenta.</li>
              <li>Compra realizada.</li>
              <li>Renovación de suscripción.</li>
              <li>Recuperación de contraseña.</li>
              <li>Cambios importantes de la cuenta.</li>
            </ul>
            <p>Estos eventos permiten enviar automáticamente los correos electrónicos correspondientes mediante Resend.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.7 Seguridad de los webhooks</h3>
            <p>Prompt Studio implementa medidas razonables para verificar que los webhooks provengan realmente del proveedor correspondiente.</p>
            <p>Entre ellas podrán incluirse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Firmas criptográficas.</li>
              <li>Tokens secretos.</li>
              <li>Validación del origen.</li>
              <li>HTTPS/TLS.</li>
              <li>Verificación de eventos.</li>
              <li>Restricciones de acceso.</li>
            </ul>
            <p>Estas medidas ayudan a prevenir el envío de información fraudulenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.8 Conservación de registros</h3>
            <p>Prompt Studio podrá conservar registros técnicos relacionados con los webhooks para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resolver incidencias.</li>
              <li>Auditar el funcionamiento.</li>
              <li>Detectar errores.</li>
              <li>Garantizar la integridad de la información.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Proteger la seguridad de la Plataforma.</li>
            </ul>
            <p>Estos registros serán conservados únicamente durante el tiempo necesario para dichas finalidades.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 24. Programa de Afiliados
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer un programa de afiliados mediante el cual determinados usuarios podrán recomendar la Plataforma utilizando enlaces o códigos de referencia.</p>
            <p>La participación en el programa es voluntaria y estará sujeta a los Términos y Condiciones específicos del programa de afiliados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.1 Información recopilada</h3>
            <p>Cuando un usuario participe como afiliado, Prompt Studio podrá recopilar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificador del afiliado.</li>
              <li>Código de afiliado.</li>
              <li>Enlace de referencia.</li>
              <li>Fecha de registro.</li>
              <li>Estado del afiliado.</li>
              <li>Historial de referencias.</li>
              <li>Comisiones generadas.</li>
              <li>Pagos realizados.</li>
              <li>Estado de los pagos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.2 Finalidad</h3>
            <p>La información recopilada se utiliza para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificar afiliados.</li>
              <li>Atribuir correctamente las referencias.</li>
              <li>Calcular comisiones.</li>
              <li>Prevenir fraude.</li>
              <li>Generar reportes.</li>
              <li>Administrar el programa.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.3 Cookies de afiliados</h3>
            <p>Cuando el usuario acceda mediante un enlace de afiliado, Prompt Studio podrá utilizar cookies o tecnologías similares para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registrar la referencia.</li>
              <li>Asociar la compra correspondiente.</li>
              <li>Calcular la comisión.</li>
              <li>Evitar duplicidades.</li>
            </ul>
            <p>Estas cookies estarán sujetas a la Política de Cookies y, cuando corresponda, al consentimiento del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.4 Prevención del fraude</h3>
            <p>Prompt Studio podrá revisar la actividad relacionada con el programa de afiliados para detectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Referencias falsas.</li>
              <li>Compras simuladas.</li>
              <li>Manipulación de enlaces.</li>
              <li>Creación masiva de cuentas.</li>
              <li>Uso automatizado.</li>
              <li>Cualquier otra actividad destinada a obtener comisiones de manera indebida.</li>
            </ul>
            <p>Cuando se detecte actividad sospechosa, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspender temporalmente al afiliado.</li>
              <li>Retener pagos.</li>
              <li>Solicitar información adicional.</li>
              <li>Cancelar la participación en el programa.</li>
              <li>Adoptar otras medidas previstas en los Términos y Condiciones.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.5 Conservación de la información</h3>
            <p>Los registros relacionados con el programa de afiliados podrán conservarse mientras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exista una relación activa con el afiliado.</li>
              <li>Sea necesario calcular comisiones.</li>
              <li>Existan obligaciones fiscales.</li>
              <li>Deban atenderse auditorías.</li>
              <li>Sea necesario resolver controversias.</li>
              <li>La legislación aplicable exija conservar determinada documentación.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.6 Pagos</h3>
            <p>Cuando el programa contemple pagos a afiliados, Prompt Studio podrá conservar la información necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar los pagos.</li>
              <li>Emitir documentación fiscal.</li>
              <li>Cumplir obligaciones tributarias.</li>
              <li>Verificar la identidad del beneficiario.</li>
            </ul>
            <p>Prompt Studio solicitará únicamente la información estrictamente necesaria para realizar dichos pagos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.7 Derechos del afiliado</h3>
            <p>Los afiliados conservan los mismos derechos de privacidad reconocidos a cualquier usuario de Prompt Studio, incluyendo, cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso.</li>
              <li>Rectificación.</li>
              <li>Supresión.</li>
              <li>Portabilidad.</li>
              <li>Limitación.</li>
              <li>Oposición.</li>
              <li>Revocación del consentimiento.</li>
            </ul>
            <p>Las solicitudes podrán enviarse a:</p>
            <p>user@example.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.8 Finalización de la participación</h3>
            <p>Cuando un afiliado deje de participar en el programa:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se desactivarán sus enlaces de referencia cuando corresponda.</li>
              <li>Se conservará únicamente la información necesaria para cumplir obligaciones legales.</li>
              <li>Las comisiones pendientes podrán procesarse conforme a las condiciones del programa.</li>
              <li>La eliminación de la cuenta no afectará la información cuya conservación sea obligatoria por ley.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 25. Seguridad de la Información
              </h2>
            </section>
            <p>Prompt Studio reconoce que la protección de la información personal constituye una parte esencial de la prestación de sus servicios.</p>
            <p>Por ello, implementamos medidas técnicas, organizativas y administrativas razonables destinadas a proteger los datos personales contra accesos no autorizados, pérdida, alteración, destrucción o divulgación indebida.</p>
            <p>No obstante, ningún sistema conectado a Internet puede garantizar una seguridad absoluta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.1 Principios de seguridad</h3>
            <p>Las medidas implementadas por Prompt Studio tienen como objetivo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Garantizar la confidencialidad.</li>
              <li>Proteger la integridad de la información.</li>
              <li>Mantener la disponibilidad de los servicios.</li>
              <li>Detectar incidentes de seguridad.</li>
              <li>Reducir riesgos tecnológicos.</li>
              <li>Proteger los datos personales de nuestros usuarios.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.2 Cifrado de la información</h3>
            <p>Prompt Studio utiliza conexiones seguras mediante protocolos de cifrado, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>HTTPS.</li>
              <li>TLS (Transport Layer Security).</li>
            </ul>
            <p>Estas tecnologías ayudan a proteger la información durante su transmisión entre el dispositivo del usuario y nuestros servidores o proveedores tecnológicos.</p>
            <p>Cuando los servicios utilizados lo permitan, determinados datos también podrán almacenarse utilizando mecanismos de cifrado en reposo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.3 Control de acceso</h3>
            <p>El acceso a la información personal está restringido únicamente a las personas que necesitan utilizarla para desempeñar sus funciones.</p>
            <p>Entre las medidas implementadas se incluyen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Control de acceso basado en roles.</li>
              <li>Autenticación segura.</li>
              <li>Gestión de permisos.</li>
              <li>Restricción de privilegios administrativos.</li>
              <li>Registro de accesos administrativos cuando corresponda.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.4 Seguridad de la autenticación</h3>
            <p>Prompt Studio utiliza Clerk para administrar de forma segura:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro de usuarios.</li>
              <li>Inicio de sesión.</li>
              <li>Sesiones activas.</li>
              <li>Recuperación de cuentas.</li>
              <li>Autenticación multifactor cuando esté disponible.</li>
              <li>Verificación del correo electrónico.</li>
            </ul>
            <p>Las contraseñas son administradas exclusivamente por Clerk y no son almacenadas directamente por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.5 Seguridad de los pagos</h3>
            <p>Todos los pagos realizados en Prompt Studio son procesados mediante Stripe.</p>
            <p>Prompt Studio no almacena:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Números completos de tarjetas.</li>
              <li>Códigos CVV/CVC.</li>
              <li>PIN bancarios.</li>
              <li>Credenciales financieras.</li>
            </ul>
            <p>Stripe aplica estándares internacionales de seguridad para el tratamiento de la información financiera, incluyendo el cumplimiento de PCI DSS (Payment Card Industry Data Security Standard).</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.6 Seguridad de la base de datos</h3>
            <p>La información almacenada en MongoDB Atlas se protege mediante mecanismos que pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado.</li>
              <li>Control de acceso.</li>
              <li>Monitoreo.</li>
              <li>Copias de seguridad.</li>
              <li>Restricción de conexiones.</li>
              <li>Protección de infraestructura.</li>
            </ul>
            <p>Prompt Studio configura la base de datos siguiendo el principio de mínimo privilegio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.7 Supervisión y monitoreo</h3>
            <p>Prompt Studio podrá supervisar continuamente el funcionamiento de la Plataforma con el fin de detectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos no autorizados.</li>
              <li>Actividad sospechosa.</li>
              <li>Ataques automatizados.</li>
              <li>Intentos de fraude.</li>
              <li>Errores críticos.</li>
              <li>Problemas de infraestructura.</li>
              <li>Fallos de disponibilidad.</li>
            </ul>
            <p>La información obtenida se utiliza exclusivamente para proteger la Plataforma y sus usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.8 Gestión de incidentes</h3>
            <p>En caso de detectarse un incidente de seguridad que afecte datos personales, Prompt Studio evaluará:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La naturaleza del incidente.</li>
              <li>Los datos afectados.</li>
              <li>El nivel de riesgo.</li>
              <li>Las medidas correctivas necesarias.</li>
              <li>La obligación de notificar a autoridades competentes.</li>
              <li>La obligación de informar a los usuarios cuando resulte exigible por la legislación aplicable.</li>
            </ul>
            <p>Prompt Studio actuará procurando minimizar el impacto del incidente y restablecer la seguridad del servicio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 26. Conservación de los Datos Personales
              </h2>
            </section>
            <p>Prompt Studio conserva los datos personales únicamente durante el tiempo necesario para cumplir las finalidades descritas en esta Política de Privacidad o durante el plazo exigido por la legislación aplicable.</p>
            <p>Una vez finalizado el período de conservación correspondiente, los datos serán eliminados, anonimizados o bloqueados conforme a la normativa vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.1 Criterios de conservación</h3>
            <p>El período de conservación dependerá de factores como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La naturaleza de los datos.</li>
              <li>La finalidad del tratamiento.</li>
              <li>La existencia de una cuenta activa.</li>
              <li>Las obligaciones legales.</li>
              <li>Las obligaciones fiscales.</li>
              <li>Las reclamaciones pendientes.</li>
              <li>La prevención del fraude.</li>
              <li>La defensa de derechos legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.2 Información de la cuenta</h3>
            <p>La información relacionada con la cuenta podrá conservarse mientras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La cuenta permanezca activa.</li>
              <li>El usuario continúe utilizando los servicios.</li>
              <li>Sea necesaria para prestar la Plataforma.</li>
            </ul>
            <p>Cuando el usuario elimine la cuenta, Prompt Studio iniciará el proceso de eliminación o anonimización conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.3 Información relacionada con compras</h3>
            <p>La información relacionada con compras podrá conservarse durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones fiscales.</li>
              <li>Atender reembolsos.</li>
              <li>Resolver contracargos.</li>
              <li>Gestionar reclamaciones.</li>
              <li>Cumplir obligaciones contables.</li>
              <li>Defender derechos legales.</li>
            </ul>
            <p>El plazo específico dependerá de la legislación aplicable en cada jurisdicción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.4 Información de suscripciones</h3>
            <p>Los registros relacionados con suscripciones Premium podrán conservarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Administrar renovaciones.</li>
              <li>Resolver incidencias.</li>
              <li>Gestionar cancelaciones.</li>
              <li>Atender reclamaciones.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>Una vez finalizadas dichas finalidades, la información podrá eliminarse o anonimizarse.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.5 Información analítica</h3>
            <p>La información recopilada mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics 4.</li>
              <li>Firebase Analytics.</li>
              <li>Vercel Analytics.</li>
            </ul>
            <p>será conservada conforme a los períodos de retención configurados en cada servicio y a las políticas de sus respectivos proveedores.</p>
            <p>Cuando resulte posible, Prompt Studio utilizará información agregada o anonimizada para fines estadísticos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.6 Registros técnicos</h3>
            <p>Los registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seguridad.</li>
              <li>Autenticación.</li>
              <li>Errores.</li>
              <li>Rendimiento.</li>
              <li>Webhooks.</li>
              <li>Infraestructura.</li>
            </ul>
            <p>podrán conservarse durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Detectar incidentes.</li>
              <li>Resolver problemas técnicos.</li>
              <li>Proteger la Plataforma.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.7 Copias de seguridad</h3>
            <p>Las copias de seguridad podrán conservar información durante un período adicional limitado con fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recuperación ante desastres.</li>
              <li>Continuidad operativa.</li>
              <li>Restauración de información.</li>
              <li>Protección frente a pérdidas accidentales.</li>
            </ul>
            <p>Una vez que dichas copias dejen de ser necesarias, serán eliminadas conforme a los procedimientos internos de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.8 Eliminación y anonimización</h3>
            <p>Cuando la información deje de ser necesaria y no exista obligación legal de conservarla, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminar permanentemente los datos.</li>
              <li>Anonimizar la información.</li>
              <li>Bloquear el acceso a determinados registros cuando así lo exija la legislación aplicable.</li>
            </ul>
            <p>La anonimización se realizará procurando que la información ya no pueda asociarse razonablemente a una persona identificada o identificable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 27. Eliminación de la Cuenta
              </h2>
            </section>
            <p>Prompt Studio reconoce el derecho de los usuarios a eliminar su cuenta y solicitar la supresión de sus datos personales, de conformidad con la legislación aplicable.</p>
            <p>El usuario podrá solicitar la eliminación de su cuenta en cualquier momento utilizando las herramientas disponibles en la Plataforma o contactando a nuestro equipo de soporte.</p>
            <p>La eliminación de la cuenta no afectará los datos cuya conservación sea obligatoria por disposición legal.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.1 Eliminación desde la Plataforma</h3>
            <p>Cuando la funcionalidad esté disponible, el usuario podrá eliminar su cuenta directamente desde la configuración de su perfil.</p>
            <p>El proceso podrá incluir medidas de seguridad destinadas a verificar la identidad del titular antes de proceder con la eliminación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.2 Eliminación mediante Clerk</h3>
            <p>La autenticación y administración de cuentas se realiza mediante Clerk.</p>
            <p>Cuando una cuenta sea eliminada:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se revocarán las sesiones activas.</li>
              <li>Se eliminarán los datos administrados por Clerk conforme a sus políticas.</li>
              <li>Se notificará a Prompt Studio mediante webhooks para sincronizar la eliminación.</li>
              <li>Se impedirán futuros accesos con dicha cuenta, salvo que el usuario cree una nueva.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.3 Eliminación en MongoDB Atlas</h3>
            <p>Una vez recibida la solicitud de eliminación, Prompt Studio iniciará el proceso para eliminar o anonimizar la información almacenada en MongoDB Atlas, incluyendo, cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perfil del usuario.</li>
              <li>Preferencias.</li>
              <li>Recursos favoritos.</li>
              <li>Configuración personalizada.</li>
              <li>Historial de actividad.</li>
              <li>Registros de afiliación.</li>
              <li>Datos asociados a la cuenta.</li>
            </ul>
            <p>Los registros que deban conservarse por obligaciones legales permanecerán protegidos durante el tiempo exigido por la normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.4 Compras realizadas</h3>
            <p>La eliminación de la cuenta no implica necesariamente la eliminación inmediata de los registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras.</li>
              <li>Facturas.</li>
              <li>Pagos.</li>
              <li>Reembolsos.</li>
              <li>Información contable.</li>
              <li>Obligaciones fiscales.</li>
            </ul>
            <p>Estos registros podrán conservarse mientras exista una obligación legal que así lo exija.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.5 Suscripciones Premium</h3>
            <p>Cuando el usuario elimine su cuenta:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las suscripciones activas deberán cancelarse previamente o dejarán de renovarse conforme a las condiciones del servicio.</li>
              <li>El acceso a los recursos Premium finalizará una vez concluido el período contratado.</li>
              <li>Prompt Studio podrá conservar la información estrictamente necesaria para cumplir obligaciones legales relacionadas con la suscripción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.6 Correos electrónicos</h3>
            <p>Tras la eliminación de la cuenta:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El correo electrónico será eliminado de las listas de marketing administradas por Resend.</li>
              <li>Se cancelará el envío de newsletters y promociones.</li>
              <li>Podrán seguir enviándose comunicaciones cuando exista una obligación legal pendiente o sea necesario completar procesos iniciados antes de la eliminación.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.7 Copias de seguridad</h3>
            <p>Determinada información podrá permanecer temporalmente en copias de seguridad protegidas.</p>
            <p>Estas copias se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recuperación ante desastres.</li>
              <li>Continuidad operativa.</li>
              <li>Restauración de sistemas.</li>
            </ul>
            <p>La información será eliminada cuando las copias correspondientes sean reemplazadas conforme a los ciclos normales de respaldo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.8 Solicitudes de eliminación</h3>
            <p>Las solicitudes relacionadas con la eliminación de la cuenta podrán enviarse a:</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>Prompt Studio responderá dentro de un plazo razonable y, cuando resulte aplicable, dentro de los plazos establecidos por la legislación vigente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 28. Derechos conforme al Reglamento General de Protección de Datos (RGPD/GDPR)
              </h2>
            </section>
            <p>Cuando el tratamiento de datos personales esté sujeto al Reglamento General de Protección de Datos (RGPD), los usuarios podrán ejercer los derechos reconocidos por dicha normativa.</p>
            <p>Prompt Studio facilitará el ejercicio de estos derechos de manera gratuita, salvo en los casos permitidos por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.1 Derecho de acceso</h3>
            <p>El usuario podrá solicitar confirmación sobre si Prompt Studio trata datos personales que le conciernen.</p>
            <p>En caso afirmativo, podrá solicitar acceso a dicha información y obtener detalles sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los datos tratados.</li>
              <li>Las finalidades.</li>
              <li>Las categorías de datos.</li>
              <li>Los destinatarios.</li>
              <li>El plazo de conservación.</li>
              <li>Los derechos disponibles.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.2 Derecho de rectificación</h3>
            <p>El usuario podrá solicitar la corrección de datos personales inexactos o incompletos.</p>
            <p>Cuando sea posible, también podrá actualizar su información directamente desde la configuración de su cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.3 Derecho de supresión (“Derecho al olvido”)</h3>
            <p>El usuario podrá solicitar la eliminación de sus datos personales cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ya no sean necesarios para la finalidad con la que fueron recopilados.</li>
              <li>Retire su consentimiento y no exista otra base jurídica para el tratamiento.</li>
              <li>Se oponga al tratamiento y no prevalezcan intereses legítimos.</li>
              <li>El tratamiento sea ilícito.</li>
              <li>Exista una obligación legal de eliminarlos.</li>
            </ul>
            <p>Este derecho podrá estar sujeto a las excepciones previstas por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.4 Derecho a la limitación del tratamiento</h3>
            <p>El usuario podrá solicitar que Prompt Studio limite temporalmente el tratamiento de sus datos cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Impugne la exactitud de la información.</li>
              <li>El tratamiento sea ilícito y prefiera la limitación en lugar de la eliminación.</li>
              <li>Prompt Studio ya no necesite los datos, pero el usuario los requiera para ejercer o defender reclamaciones.</li>
              <li>Se encuentre pendiente la resolución de una oposición al tratamiento.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.5 Derecho a la portabilidad</h3>
            <p>Cuando resulte aplicable, el usuario podrá solicitar recibir sus datos personales en un formato estructurado, de uso común y lectura mecánica.</p>
            <p>Asimismo, podrá solicitar que dichos datos sean transmitidos a otro responsable del tratamiento cuando sea técnicamente posible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.6 Derecho de oposición</h3>
            <p>El usuario podrá oponerse al tratamiento de sus datos personales basado en intereses legítimos.</p>
            <p>Prompt Studio dejará de tratar dichos datos salvo que existan motivos legítimos imperiosos o sea necesario para la formulación, el ejercicio o la defensa de reclamaciones legales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.7 Derecho a retirar el consentimiento</h3>
            <p>Cuando el tratamiento se base en el consentimiento, el usuario podrá retirarlo en cualquier momento.</p>
            <p>La retirada del consentimiento no afectará la licitud del tratamiento realizado con anterioridad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.8 Derecho a presentar una reclamación</h3>
            <p>Si el usuario considera que Prompt Studio ha tratado sus datos personales de manera contraria al RGPD, podrá presentar una reclamación ante la autoridad de control competente de su país de residencia o del lugar donde se haya producido la presunta infracción.</p>
            <p>Asimismo, podrá contactar previamente con Prompt Studio a través de:</p>
            <p>user@example.com</p>
            <p>con el fin de intentar resolver la situación de forma amistosa.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 29. Derechos conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México)
              </h2>
            </section>
            <p>Cuando el tratamiento de datos personales esté sujeto a la legislación mexicana, los usuarios podrán ejercer los derechos reconocidos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y demás disposiciones aplicables.</p>
            <p>Prompt Studio facilitará el ejercicio de estos derechos de manera gratuita, salvo en los casos expresamente permitidos por la legislación vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.1 Derechos ARCO</h3>
            <p>Los usuarios tienen derecho a ejercer los llamados Derechos ARCO, que comprenden:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso.</li>
              <li>Rectificación.</li>
              <li>Cancelación.</li>
              <li>Oposición.</li>
            </ul>
            <p>Estos derechos podrán ejercerse respecto de los datos personales tratados por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.2 Derecho de Acceso</h3>
            <p>El usuario podrá solicitar información sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué datos personales posee Prompt Studio.</li>
              <li>Cómo fueron obtenidos.</li>
              <li>Para qué se utilizan.</li>
              <li>Con quién se comparten.</li>
              <li>El tiempo previsto de conservación.</li>
              <li>Las medidas generales de protección aplicadas.</li>
            </ul>
            <p>Prompt Studio responderá conforme a los plazos establecidos por la legislación mexicana.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.3 Derecho de Rectificación</h3>
            <p>Cuando los datos personales sean inexactos, incompletos o estén desactualizados, el usuario podrá solicitar su corrección.</p>
            <p>Siempre que sea posible, la actualización también podrá realizarse directamente desde la configuración de la cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.4 Derecho de Cancelación</h3>
            <p>El usuario podrá solicitar la cancelación de sus datos personales cuando considere que ya no son necesarios para las finalidades para las cuales fueron recopilados.</p>
            <p>La cancelación podrá implicar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminación.</li>
              <li>Bloqueo.</li>
              <li>Anonimización.</li>
            </ul>
            <p>No obstante, Prompt Studio podrá conservar determinada información cuando exista una obligación legal o contractual que así lo requiera.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.5 Derecho de Oposición</h3>
            <p>El usuario podrá oponerse al tratamiento de sus datos personales cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Existan motivos legítimos relacionados con su situación particular.</li>
              <li>El tratamiento no sea necesario para cumplir obligaciones legales.</li>
              <li>La legislación mexicana reconozca dicho derecho.</li>
            </ul>
            <p>Prompt Studio analizará cada solicitud conforme a la normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.6 Revocación del consentimiento</h3>
            <p>Cuando el tratamiento se base en el consentimiento del usuario, éste podrá revocarlo en cualquier momento.</p>
            <p>La revocación no tendrá efectos retroactivos sobre los tratamientos realizados antes de dicha solicitud.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.7 Procedimiento para ejercer los derechos</h3>
            <p>Las solicitudes relacionadas con derechos ARCO deberán enviarse a:</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>La solicitud deberá incluir, cuando sea posible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre del titular.</li>
              <li>Correo electrónico asociado a la cuenta.</li>
              <li>Derecho que desea ejercer.</li>
              <li>Descripción clara de la solicitud.</li>
              <li>Información suficiente para identificar la cuenta correspondiente.</li>
            </ul>
            <p>Prompt Studio podrá solicitar información adicional cuando resulte necesario para verificar la identidad del solicitante.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.8 Autoridad competente</h3>
            <p>Si el usuario considera que Prompt Studio ha tratado sus datos personales de manera contraria a la legislación mexicana, podrá acudir al organismo competente en materia de protección de datos personales.</p>
            <p>No obstante, recomendamos contactar previamente con Prompt Studio para intentar resolver la situación de forma amistosa.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 30. Derechos conforme a la California Consumer Privacy Act (CCPA) y California Privacy Rights Act (CPRA)
              </h2>
            </section>
            <p>Cuando resulte aplicable, los residentes del Estado de California podrán ejercer los derechos reconocidos por la California Consumer Privacy Act (CCPA) y la California Privacy Rights Act (CPRA).</p>
            <p>Prompt Studio respetará estos derechos en la medida en que resulten aplicables conforme a la legislación correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.1 Derecho a conocer</h3>
            <p>El usuario podrá solicitar información acerca de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las categorías de datos personales recopiladas.</li>
              <li>Las fuentes de obtención.</li>
              <li>Las finalidades del tratamiento.</li>
              <li>Las categorías de terceros con quienes se comparte la información.</li>
              <li>Las categorías de información divulgadas durante el período correspondiente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.2 Derecho de acceso</h3>
            <p>Cuando resulte aplicable, el usuario podrá solicitar una copia de los datos personales tratados por Prompt Studio.</p>
            <p>La información será proporcionada en un formato razonablemente accesible, conforme a la legislación vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.3 Derecho de eliminación</h3>
            <p>El usuario podrá solicitar la eliminación de los datos personales recopilados por Prompt Studio, salvo cuando la legislación permita conservar determinada información para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Completar transacciones.</li>
              <li>Detectar incidentes de seguridad.</li>
              <li>Prevenir fraude.</li>
              <li>Defender reclamaciones legales.</li>
              <li>Cumplir obligaciones fiscales.</li>
              <li>Ejercer derechos previstos por la ley.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.4 Derecho de corrección</h3>
            <p>El usuario podrá solicitar la corrección de información personal inexacta mantenida por Prompt Studio.</p>
            <p>Cuando resulte posible, también podrá actualizar directamente su perfil.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.5 Derecho a limitar el uso de información sensible</h3>
            <p>Si Prompt Studio llegara a tratar categorías de información consideradas sensibles conforme a la CPRA, el usuario podrá solicitar la limitación de dicho tratamiento cuando la legislación así lo permita.</p>
            <p>Actualmente Prompt Studio procura no recopilar información personal sensible que no resulte necesaria para la prestación de sus servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.6 Derecho a no ser discriminado</h3>
            <p>Prompt Studio no discriminará a ningún usuario por ejercer los derechos reconocidos por la CCPA o la CPRA.</p>
            <p>El ejercicio de estos derechos no implicará:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Negación injustificada del servicio.</li>
              <li>Cobros adicionales.</li>
              <li>Reducción arbitraria de funcionalidades.</li>
              <li>Trato desigual.</li>
            </ul>
            <p>No obstante, determinadas funciones podrán dejar de estar disponibles cuando requieran necesariamente el tratamiento de datos cuya eliminación haya sido solicitada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.7 Venta y uso compartido de información</h3>
            <p>Prompt Studio no vende datos personales a terceros.</p>
            <p>Asimismo, Prompt Studio no comparte información personal con fines de publicidad conductual entre diferentes contextos (“cross-context behavioral advertising”), salvo que en el futuro se informe expresamente al usuario y se obtenga el consentimiento cuando la legislación lo requiera.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.8 Ejercicio de derechos</h3>
            <p>Los usuarios podrán ejercer sus derechos enviando una solicitud a:</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>Prompt Studio podrá solicitar información razonable para verificar la identidad del solicitante antes de atender la solicitud.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 31. Transferencias Internacionales de Datos
              </h2>
            </section>
            <p>Prompt Studio opera como una plataforma digital accesible desde distintos países y utiliza proveedores tecnológicos ubicados en diversas jurisdicciones para prestar sus servicios.</p>
            <p>Como consecuencia, los datos personales del usuario podrán ser tratados o almacenados fuera de su país de residencia.</p>
            <p>Prompt Studio adopta medidas razonables para garantizar que dichas transferencias se realicen conforme a la legislación aplicable y con un nivel adecuado de protección.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.1 Naturaleza de las transferencias</h3>
            <p>Los datos personales podrán ser transferidos internacionalmente cuando sea necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticar usuarios.</li>
              <li>Procesar pagos.</li>
              <li>Almacenar información.</li>
              <li>Enviar correos electrónicos.</li>
              <li>Generar contenido mediante Inteligencia Artificial.</li>
              <li>Analizar el rendimiento de la Plataforma.</li>
              <li>Prestar soporte técnico.</li>
              <li>Mantener la infraestructura tecnológica.</li>
            </ul>
            <p>Estas transferencias forman parte del funcionamiento normal de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.2 Destinos de las transferencias</h3>
            <p>Dependiendo de los servicios utilizados por el usuario, la información podrá ser tratada por proveedores ubicados en diferentes países.</p>
            <p>Entre los servicios utilizados por Prompt Studio se encuentran, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Servicios de autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Bases de datos.</li>
              <li>Almacenamiento de archivos.</li>
              <li>Infraestructura en la nube.</li>
              <li>Inteligencia Artificial.</li>
              <li>Analítica.</li>
              <li>Correo electrónico.</li>
            </ul>
            <p>Los proveedores podrán procesar información en centros de datos ubicados en Estados Unidos u otras jurisdicciones donde operen sus infraestructuras.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.3 Garantías aplicadas</h3>
            <p>Cuando una transferencia internacional esté sujeta al Reglamento General de Protección de Datos (RGPD/GDPR), Prompt Studio procurará utilizar mecanismos reconocidos por la legislación aplicable, incluyendo, cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cláusulas Contractuales Tipo (Standard Contractual Clauses).</li>
              <li>Decisiones de adecuación emitidas por las autoridades competentes.</li>
              <li>Medidas técnicas y organizativas adicionales.</li>
              <li>Otros mecanismos legalmente reconocidos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.4 Transferencias necesarias para la prestación del servicio</h3>
            <p>Al utilizar Prompt Studio, el usuario reconoce que determinadas transferencias internacionales son necesarias para el funcionamiento de servicios como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inicio de sesión.</li>
              <li>Gestión de suscripciones.</li>
              <li>Procesamiento de pagos.</li>
              <li>Descarga de recursos.</li>
              <li>Envío de correos electrónicos.</li>
              <li>Generación de prompts mediante IA.</li>
            </ul>
            <p>Sin estas transferencias, determinadas funcionalidades de la Plataforma podrían no estar disponibles.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.5 Medidas de protección</h3>
            <p>Prompt Studio procura seleccionar proveedores que implementen medidas de seguridad apropiadas, tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado durante la transmisión.</li>
              <li>Cifrado de la información almacenada cuando esté disponible.</li>
              <li>Controles de acceso.</li>
              <li>Supervisión de seguridad.</li>
              <li>Programas de cumplimiento normativo.</li>
              <li>Auditorías de seguridad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.6 Limitación del acceso</h3>
            <p>Prompt Studio limita el acceso a los datos personales transferidos únicamente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal autorizado.</li>
              <li>Proveedores tecnológicos necesarios.</li>
              <li>Autoridades competentes cuando exista una obligación legal.</li>
            </ul>
            <p>No autorizamos el acceso indiscriminado a la información personal.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.7 Derechos del usuario</h3>
            <p>Las transferencias internacionales no afectan los derechos reconocidos al usuario conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (RGPD).</li>
              <li>Ley Federal de Protección de Datos Personales de México.</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Demás legislación aplicable.</li>
            </ul>
            <p>El usuario podrá ejercer sus derechos utilizando los mecanismos descritos en esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.8 Cambios en los proveedores</h3>
            <p>Prompt Studio podrá sustituir sus proveedores tecnológicos por otros equivalentes cuando resulte necesario por razones técnicas, comerciales o de seguridad.</p>
            <p>En todos los casos procuraremos que los nuevos proveedores mantengan un nivel adecuado de protección de los datos personales.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 32. Privacidad de Menores de Edad
              </h2>
            </section>
            <p>Prompt Studio está dirigido principalmente a personas mayores de edad o a usuarios que tengan la capacidad legal necesaria para contratar los servicios ofrecidos por la Plataforma.</p>
            <p>La protección de la privacidad de niños y adolescentes constituye una prioridad para Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.1 Edad mínima</h3>
            <p>El uso de Prompt Studio está destinado a usuarios que tengan al menos la edad mínima requerida conforme a la legislación aplicable en su lugar de residencia.</p>
            <p>Cuando la legislación exija el consentimiento de los padres o tutores para el tratamiento de datos personales de menores, dicho consentimiento deberá obtenerse antes de utilizar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.2 Información recopilada</h3>
            <p>Prompt Studio no recopila deliberadamente información personal de menores cuando la legislación prohíba dicho tratamiento sin autorización de sus representantes legales.</p>
            <p>Si detectamos que se ha recopilado información de un menor en contravención de la legislación aplicable, adoptaremos medidas razonables para eliminar dicha información.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.3 Responsabilidad de los padres o tutores</h3>
            <p>Los padres, madres o tutores legales son responsables de supervisar el uso que los menores hagan de Internet y de los servicios digitales.</p>
            <p>Prompt Studio recomienda que los menores utilicen la Plataforma únicamente bajo la supervisión de un adulto cuando resulte apropiado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.4 Solicitudes de eliminación</h3>
            <p>Si un padre, madre o tutor considera que un menor ha proporcionado información personal sin la autorización correspondiente, podrá solicitar la eliminación de dicha información escribiendo a:</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>Prompt Studio adoptará las medidas razonables para verificar la solicitud y atenderla conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.5 Contenido generado mediante IA</h3>
            <p>Las herramientas de Inteligencia Artificial disponibles en Prompt Studio no están diseñadas específicamente para menores de edad.</p>
            <p>Los padres o tutores deberán supervisar el uso de estas herramientas cuando un menor tenga acceso autorizado a la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.6 Compras y suscripciones</h3>
            <p>Los menores no deberán realizar compras ni contratar suscripciones Premium sin la autorización de sus padres o representantes legales cuando así lo exija la legislación aplicable.</p>
            <p>Prompt Studio podrá cancelar operaciones realizadas en incumplimiento de esta disposición cuando resulte procedente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.7 Protección reforzada</h3>
            <p>Cuando Prompt Studio tenga conocimiento de que un usuario es menor de edad y la legislación aplicable otorgue una protección especial, procurará aplicar medidas adicionales destinadas a proteger sus datos personales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.8 Comunicación con menores</h3>
            <p>Prompt Studio no dirige campañas de marketing específicamente a menores de edad ni utiliza deliberadamente sus datos personales con fines publicitarios.</p>
            <p>Cuando sea necesario enviar comunicaciones relacionadas con la cuenta, estas se limitarán a aquellas estrictamente necesarias para la prestación del servicio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 33. Protección de los Pagos
              </h2>
            </section>
            <p>Prompt Studio implementa medidas destinadas a proteger las transacciones realizadas por los usuarios y a reducir el riesgo de fraude durante el proceso de compra de productos digitales y suscripciones.</p>
            <p>El procesamiento de pagos se realiza mediante proveedores especializados que cumplen estándares internacionales de seguridad.</p>
            <p>Prompt Studio no procesa directamente información financiera sensible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.1 Procesamiento seguro de pagos</h3>
            <p>Todos los pagos realizados en Prompt Studio son procesados mediante plataformas especializadas en pagos electrónicos.</p>
            <p>El procesamiento incluye, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras únicas.</li>
              <li>Suscripciones Premium.</li>
              <li>Renovaciones automáticas.</li>
              <li>Reembolsos.</li>
              <li>Cancelaciones.</li>
              <li>Actualización de métodos de pago.</li>
            </ul>
            <p>La información financiera es administrada directamente por el proveedor de pagos correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.2 Información que Prompt Studio no almacena</h3>
            <p>Por motivos de seguridad, Prompt Studio no almacena directamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número completo de tarjetas bancarias.</li>
              <li>Código CVV o CVC.</li>
              <li>PIN bancarios.</li>
              <li>Credenciales del banco.</li>
              <li>Información completa de cuentas bancarias.</li>
              <li>Datos completos de billeteras digitales.</li>
            </ul>
            <p>La información financiera permanece bajo la infraestructura segura del proveedor de pagos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.3 Confirmación de transacciones</h3>
            <p>Una vez que una transacción es procesada, Prompt Studio podrá recibir información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmación del pago.</li>
              <li>Estado de la compra.</li>
              <li>Identificador de la transacción.</li>
              <li>Estado de la suscripción.</li>
              <li>Fecha de pago.</li>
              <li>Información necesaria para activar los productos adquiridos.</li>
            </ul>
            <p>Esta información se utiliza únicamente para prestar el servicio contratado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.4 Prevención del fraude</h3>
            <p>Con el objetivo de proteger tanto a los usuarios como a Prompt Studio, podrán aplicarse mecanismos destinados a detectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras fraudulentas.</li>
              <li>Métodos de pago comprometidos.</li>
              <li>Actividad automatizada.</li>
              <li>Contracargos indebidos.</li>
              <li>Uso indebido de promociones.</li>
              <li>Creación masiva de cuentas.</li>
              <li>Accesos sospechosos.</li>
            </ul>
            <p>Cuando sea necesario, determinadas operaciones podrán ser verificadas antes de su aprobación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.5 Reembolsos</h3>
            <p>Los reembolsos, cuando procedan conforme a los Términos y Condiciones de Prompt Studio, serán procesados utilizando el mismo método de pago empleado por el usuario, salvo que la legislación o el proveedor de pagos dispongan otra solución.</p>
            <p>Los tiempos de acreditación dependerán del proveedor financiero correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.6 Conservación de registros</h3>
            <p>Prompt Studio podrá conservar información relacionada con las transacciones para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones fiscales.</li>
              <li>Atender reclamaciones.</li>
              <li>Resolver disputas.</li>
              <li>Gestionar contracargos.</li>
              <li>Detectar fraude.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>La información se conservará únicamente durante el tiempo necesario para dichas finalidades.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.7 Cumplimiento de estándares de seguridad</h3>
            <p>Prompt Studio procura utilizar proveedores que implementen estándares internacionales de seguridad aplicables al procesamiento de pagos electrónicos, incluyendo, cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>PCI DSS (Payment Card Industry Data Security Standard).</li>
              <li>Cifrado de comunicaciones.</li>
              <li>Monitoreo antifraude.</li>
              <li>Autenticación reforzada.</li>
              <li>Protección frente a accesos no autorizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.8 Responsabilidad del usuario</h3>
            <p>El usuario es responsable de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar métodos de pago autorizados.</li>
              <li>Mantener protegidas sus credenciales bancarias.</li>
              <li>Revisar periódicamente sus movimientos financieros.</li>
              <li>Notificar inmediatamente cualquier operación no autorizada.</li>
            </ul>
            <p>Prompt Studio no será responsable por pérdidas derivadas del uso indebido de credenciales financieras fuera de su control.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 34. Seguridad del Contenido Generado mediante Inteligencia Artificial
              </h2>
            </section>
            <p>Prompt Studio incorpora herramientas de Inteligencia Artificial destinadas a asistir a los usuarios en la creación de prompts y contenido relacionado con modelos generativos.</p>
            <p>Nuestro objetivo es ofrecer un entorno seguro, transparente y respetuoso de la privacidad durante la utilización de dichas herramientas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.1 Protección de las solicitudes</h3>
            <p>Los prompts enviados por los usuarios son procesados utilizando conexiones seguras.</p>
            <p>Prompt Studio adopta medidas razonables para proteger la información transmitida durante la generación de contenido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.2 Información utilizada</h3>
            <p>La información enviada a las herramientas de Inteligencia Artificial podrá incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Texto del prompt.</li>
              <li>Instrucciones.</li>
              <li>Configuración seleccionada.</li>
              <li>Preferencias del usuario.</li>
              <li>Parámetros de generación.</li>
            </ul>
            <p>Esta información se utiliza exclusivamente para generar el contenido solicitado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.3 Contenido confidencial</h3>
            <p>Prompt Studio recomienda a los usuarios no introducir información confidencial, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contraseñas.</li>
              <li>Información bancaria.</li>
              <li>Secretos comerciales.</li>
              <li>Datos médicos.</li>
              <li>Documentos de identidad.</li>
              <li>Información financiera privada.</li>
              <li>Información protegida por acuerdos de confidencialidad.</li>
            </ul>
            <p>Las herramientas de IA no deben utilizarse para procesar información altamente sensible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.4 Limitaciones de la Inteligencia Artificial</h3>
            <p>Los resultados generados por modelos de IA pueden:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contener errores.</li>
              <li>Ser incompletos.</li>
              <li>No reflejar información actualizada.</li>
              <li>Generar resultados similares para distintos usuarios.</li>
              <li>Variar entre ejecuciones.</li>
            </ul>
            <p>Prompt Studio recomienda revisar cuidadosamente cualquier contenido antes de utilizarlo con fines profesionales o comerciales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.5 Protección frente al uso indebido</h3>
            <p>Prompt Studio podrá limitar el acceso a las herramientas de IA cuando detecte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actividad automatizada abusiva.</li>
              <li>Intentos de explotación del sistema.</li>
              <li>Generación de contenido ilícito.</li>
              <li>Violaciones de los Términos y Condiciones.</li>
              <li>Riesgos para la seguridad de la Plataforma.</li>
            </ul>
            <p>Estas medidas buscan proteger tanto a los usuarios como a la infraestructura tecnológica.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.6 Conservación temporal</h3>
            <p>Determinadas solicitudes podrán conservarse temporalmente cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la continuidad del servicio.</li>
              <li>Resolver incidencias técnicas.</li>
              <li>Detectar errores.</li>
              <li>Investigar actividades fraudulentas.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>Cuando la información deje de ser necesaria, será eliminada o anonimizada conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.7 Propiedad del contenido generado</h3>
            <p>Salvo disposición distinta en los Términos y Condiciones o en la legislación aplicable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario conserva los derechos que legalmente le correspondan sobre los prompts que cree.</li>
              <li>Prompt Studio no reclama automáticamente la propiedad del contenido generado por el usuario.</li>
              <li>Los resultados obtenidos mediante IA pueden no ser exclusivos debido al funcionamiento probabilístico de los modelos generativos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.8 Uso responsable</h3>
            <p>El usuario se compromete a utilizar las herramientas de Inteligencia Artificial de manera responsable y conforme a la legislación aplicable.</p>
            <p>Prompt Studio podrá suspender o limitar el acceso a estas herramientas cuando detecte un uso que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vulnere derechos de terceros.</li>
              <li>Infrinja derechos de autor.</li>
              <li>Promueva actividades ilícitas.</li>
              <li>Comprometa la seguridad de la Plataforma.</li>
              <li>Incumpla los presentes Términos y Condiciones.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 35. Propiedad Intelectual de los Prompts y Recursos Digitales
              </h2>
            </section>
            <p>Prompt Studio ofrece recursos digitales destinados a facilitar el trabajo con herramientas de Inteligencia Artificial, incluyendo prompts, plantillas, archivos HTML, ejemplos, imágenes, videos, documentación y otros materiales digitales.</p>
            <p>La presente Política de Privacidad regula únicamente el tratamiento de datos personales y no sustituye las disposiciones sobre propiedad intelectual contenidas en los Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.1 Titularidad de la Plataforma</h3>
            <p>Todos los derechos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El diseño de Prompt Studio.</li>
              <li>La identidad visual.</li>
              <li>Logotipos.</li>
              <li>Marcas.</li>
              <li>Interfaces.</li>
              <li>Código fuente propio.</li>
              <li>Organización del contenido.</li>
              <li>Bases de datos protegidas por la legislación aplicable.</li>
              <li>Documentación original.</li>
            </ul>
            <p>pertenecen a Magzin LLC o a sus respectivos titulares, según corresponda.</p>
            <p>Ninguna disposición de esta Política implica la transferencia de dichos derechos al usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.2 Recursos digitales</h3>
            <p>Prompt Studio puede ofrecer recursos digitales tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para aplicaciones.</li>
              <li>Plantillas.</li>
              <li>Demos HTML.</li>
              <li>Componentes.</li>
              <li>Archivos descargables.</li>
              <li>Recursos gratuitos.</li>
              <li>Recursos Premium.</li>
            </ul>
            <p>Cada recurso podrá estar sujeto a una licencia específica indicada en su página correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.3 Contenido creado por el usuario</h3>
            <p>Los prompts, instrucciones y demás contenido introducido por el usuario siguen perteneciendo a su autor en la medida reconocida por la legislación aplicable.</p>
            <p>Al utilizar Prompt Studio, el usuario conserva los derechos que legalmente le correspondan sobre el contenido que crea.</p>
            <p>Prompt Studio no reclama automáticamente la propiedad intelectual del contenido generado por los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.4 Contenido generado mediante Inteligencia Artificial</h3>
            <p>Los resultados obtenidos mediante herramientas de Inteligencia Artificial pueden depender de modelos generativos proporcionados por terceros.</p>
            <p>Debido a la naturaleza probabilística de dichos modelos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resultados similares pueden ser generados para distintos usuarios.</li>
              <li>Prompt Studio no garantiza la exclusividad de los resultados.</li>
              <li>El usuario es responsable de verificar que el uso del contenido generado no infrinja derechos de terceros.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.5 Licencias de uso</h3>
            <p>La adquisición o descarga de un recurso digital concede únicamente la licencia de uso indicada para dicho recurso.</p>
            <p>Salvo que la licencia establezca expresamente otra cosa, la compra de un recurso no implica la cesión de los derechos de propiedad intelectual.</p>
            <p>El usuario deberá respetar las limitaciones de uso, reproducción, redistribución y comercialización establecidas en la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.6 Infracción de derechos</h3>
            <p>Prompt Studio respeta los derechos de propiedad intelectual de terceros.</p>
            <p>Si una persona considera que algún contenido disponible en la Plataforma infringe sus derechos, podrá comunicarse con:</p>
            <p>user@example.com</p>
            <p>La solicitud deberá incluir información suficiente que permita identificar el contenido y acreditar la titularidad de los derechos invocados.</p>
            <p>Prompt Studio evaluará la solicitud y, cuando corresponda, adoptará las medidas razonables previstas por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.7 Protección del contenido</h3>
            <p>Prompt Studio podrá implementar medidas destinadas a proteger los recursos digitales frente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos no autorizados.</li>
              <li>Descargas automatizadas.</li>
              <li>Redistribución ilícita.</li>
              <li>Uso fraudulento.</li>
              <li>Ingeniería inversa cuando resulte aplicable.</li>
              <li>Explotación no autorizada de los recursos.</li>
            </ul>
            <p>Estas medidas tienen como finalidad proteger tanto a Prompt Studio como a los creadores que publican contenido en la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.8 Contenido de terceros</h3>
            <p>Determinados recursos disponibles en Prompt Studio podrán pertenecer a terceros.</p>
            <p>En esos casos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los derechos de propiedad intelectual seguirán perteneciendo a sus respectivos titulares.</li>
              <li>El usuario deberá respetar las condiciones de uso correspondientes.</li>
              <li>Prompt Studio procurará identificar adecuadamente la autoría o la licencia cuando resulte aplicable.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 36. Modificaciones de la Política de Privacidad
              </h2>
            </section>
            <p>Prompt Studio podrá actualizar esta Política de Privacidad cuando resulte necesario para reflejar cambios legales, tecnológicos, comerciales u operativos.</p>
            <p>Las modificaciones se realizarán procurando mantener un nivel adecuado de transparencia e información hacia los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.1 Motivos de actualización</h3>
            <p>La Política podrá modificarse debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios legislativos.</li>
              <li>Cambios regulatorios.</li>
              <li>Nuevas funcionalidades.</li>
              <li>Nuevos servicios.</li>
              <li>Nuevos proveedores tecnológicos.</li>
              <li>Cambios en la infraestructura.</li>
              <li>Mejoras de seguridad.</li>
              <li>Incorporación de nuevas herramientas de Inteligencia Artificial.</li>
              <li>Cambios en los métodos de pago.</li>
              <li>Cambios en las herramientas analíticas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.2 Publicación de cambios</h3>
            <p>La versión vigente de esta Política estará disponible permanentemente en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización aparecerá al inicio o al final del documento para facilitar su consulta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.3 Notificación de cambios importantes</h3>
            <p>Cuando una modificación afecte de manera significativa el tratamiento de los datos personales, Prompt Studio podrá informar a los usuarios mediante uno o varios de los siguientes mecanismos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aviso destacado en el sitio web.</li>
              <li>Correo electrónico.</li>
              <li>Notificación dentro de la cuenta.</li>
              <li>Banner informativo.</li>
              <li>Otros medios razonables de comunicación.</li>
            </ul>
            <p>Cuando la legislación aplicable lo requiera, se solicitará nuevamente el consentimiento del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.4 Entrada en vigor</h3>
            <p>Las modificaciones entrarán en vigor en la fecha indicada en la versión actualizada de esta Política.</p>
            <p>Cuando no se indique una fecha específica, las modificaciones surtirán efectos desde el momento de su publicación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.5 Uso continuado</h3>
            <p>El uso continuado de Prompt Studio después de la entrada en vigor de una modificación implica la aceptación de la versión actualizada de esta Política, salvo cuando la legislación aplicable exija un consentimiento adicional.</p>
            <p>Si el usuario no está de acuerdo con las modificaciones, podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dejar de utilizar la Plataforma.</li>
              <li>Eliminar su cuenta.</li>
              <li>Cancelar sus suscripciones.</li>
              <li>Solicitar la eliminación de sus datos personales conforme a esta Política.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.6 Versiones anteriores</h3>
            <p>Prompt Studio podrá conservar versiones anteriores de esta Política con fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento legal.</li>
              <li>Auditorías.</li>
              <li>Resolución de controversias.</li>
              <li>Verificación de las condiciones aplicables en un momento determinado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.7 Compatibilidad con otras políticas</h3>
            <p>Esta Política deberá interpretarse conjuntamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los Términos y Condiciones.</li>
              <li>La Política de Cookies.</li>
              <li>Las políticas específicas relacionadas con compras.</li>
              <li>Las condiciones de suscripción Premium.</li>
              <li>Cualquier otro documento legal publicado por Prompt Studio.</li>
            </ul>
            <p>En caso de conflicto respecto al tratamiento de datos personales, prevalecerá esta Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.8 Contacto para consultas</h3>
            <p>Si el usuario tiene preguntas sobre las modificaciones de esta Política o sobre el tratamiento de sus datos personales, podrá comunicarse con:</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>Prompt Studio procurará responder las consultas dentro de un plazo razonable y conforme a la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 37. Contacto y Ejercicio de Derechos
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de los usuarios canales de comunicación para atender consultas relacionadas con la privacidad, el tratamiento de datos personales y el ejercicio de los derechos reconocidos por la legislación aplicable.</p>
            <p>Nuestro objetivo es responder las solicitudes de forma clara, transparente y dentro de los plazos establecidos por la normativa correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.1 Responsable del tratamiento</h3>
            <p>El responsable del tratamiento de los datos personales recopilados a través de Prompt Studio es:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico de soporte</p>
            <p>user@example.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.2 Solicitudes relacionadas con privacidad</h3>
            <p>Los usuarios podrán ponerse en contacto con Prompt Studio para solicitar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso a sus datos personales.</li>
              <li>Corrección de información.</li>
              <li>Eliminación de la cuenta.</li>
              <li>Eliminación de datos personales.</li>
              <li>Portabilidad.</li>
              <li>Oposición al tratamiento.</li>
              <li>Limitación del tratamiento.</li>
              <li>Revocación del consentimiento.</li>
              <li>Cancelación del email marketing.</li>
              <li>Dudas relacionadas con esta Política de Privacidad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.3 Forma de presentar una solicitud</h3>
            <p>Las solicitudes deberán enviarse a:</p>
            <p>Correo electrónico</p>
            <p>user@example.com</p>
            <p>Para proteger la información personal de nuestros usuarios, Prompt Studio podrá solicitar información adicional que permita verificar razonablemente la identidad del solicitante antes de atender la petición.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.4 Información recomendada</h3>
            <p>Para agilizar la atención de la solicitud, recomendamos incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre del titular de la cuenta.</li>
              <li>Dirección de correo electrónico registrada.</li>
              <li>Derecho que desea ejercer.</li>
              <li>Descripción detallada de la solicitud.</li>
              <li>Información adicional que permita localizar la cuenta correspondiente.</li>
            </ul>
            <p>Cuando resulte necesario, Prompt Studio podrá solicitar documentación adicional únicamente para verificar la identidad del solicitante.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.5 Tiempo de respuesta</h3>
            <p>Prompt Studio procurará responder las solicitudes dentro de un plazo razonable.</p>
            <p>Cuando la legislación aplicable establezca plazos específicos, éstos prevalecerán sobre cualquier otro criterio interno.</p>
            <p>Si una solicitud requiere un tiempo adicional debido a su complejidad, Prompt Studio informará oportunamente al usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.6 Coste</h3>
            <p>El ejercicio de los derechos relacionados con la protección de datos será, por regla general, gratuito.</p>
            <p>No obstante, Prompt Studio podrá cobrar un importe razonable cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación lo permita.</li>
              <li>La solicitud sea manifiestamente infundada.</li>
              <li>La solicitud sea excesiva o repetitiva.</li>
              <li>Existan costes administrativos extraordinarios permitidos por la normativa.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.7 Verificación de identidad</h3>
            <p>Antes de atender determinadas solicitudes, Prompt Studio podrá verificar la identidad del solicitante con el fin de evitar accesos no autorizados a información personal.</p>
            <p>Esta verificación podrá realizarse utilizando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El correo electrónico registrado.</li>
              <li>La cuenta autenticada.</li>
              <li>Información de seguridad previamente proporcionada.</li>
              <li>Otros mecanismos razonables y proporcionados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.8 Comunicaciones relacionadas con privacidad</h3>
            <p>Las respuestas relacionadas con solicitudes de privacidad podrán enviarse mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico.</li>
              <li>Notificaciones dentro de la Plataforma.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <p>Prompt Studio procurará utilizar el mismo medio empleado por el usuario para presentar la solicitud, salvo que resulte más adecuado utilizar otro canal.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 38. Autoridades Competentes
              </h2>
            </section>
            <p>Cuando un usuario considere que Prompt Studio no ha tratado adecuadamente sus datos personales, podrá acudir a las autoridades competentes en materia de protección de datos conforme a la legislación aplicable.</p>
            <p>Prompt Studio recomienda contactar previamente con nuestro equipo de soporte para intentar resolver cualquier incidencia de manera amistosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.1 Usuarios de la Unión Europea</h3>
            <p>Los usuarios sujetos al Reglamento General de Protección de Datos (RGPD/GDPR) podrán presentar una reclamación ante la autoridad de control competente del Estado miembro donde:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Residan habitualmente.</li>
              <li>Trabajen.</li>
              <li>Se haya producido la presunta infracción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.2 Usuarios de México</h3>
            <p>Los usuarios ubicados en México podrán ejercer los derechos previstos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
            <p>Si consideran que Prompt Studio ha incumplido dicha legislación, podrán acudir ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI) o la autoridad que legalmente lo sustituya en el futuro.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.3 Usuarios de California</h3>
            <p>Los residentes del Estado de California podrán ejercer los derechos previstos en la California Consumer Privacy Act (CCPA) y la California Privacy Rights Act (CPRA).</p>
            <p>Cuando consideren que sus derechos no han sido respetados, podrán acudir a las autoridades competentes conforme a la legislación vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.4 Otros países</h3>
            <p>Los usuarios ubicados en otros países podrán acudir a las autoridades competentes en materia de protección de datos o protección al consumidor conforme a la legislación aplicable en su jurisdicción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.5 Cooperación con autoridades</h3>
            <p>Prompt Studio cooperará con las autoridades competentes cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exista una obligación legal.</li>
              <li>Sea necesario atender investigaciones oficiales.</li>
              <li>Deban cumplirse requerimientos judiciales.</li>
              <li>Sea necesario proteger derechos propios o de terceros.</li>
            </ul>
            <p>Toda cooperación se realizará respetando los principios de legalidad, necesidad y proporcionalidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.6 Resolución amistosa</h3>
            <p>Antes de acudir a una autoridad competente, invitamos al usuario a comunicarse con Prompt Studio mediante:</p>
            <p>user@example.com</p>
            <p>Nuestro objetivo será resolver cualquier duda, reclamación o incidencia relacionada con la privacidad de manera rápida, transparente y de buena fe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.7 Conservación de evidencia</h3>
            <p>Prompt Studio podrá conservar registros relacionados con solicitudes de privacidad y reclamaciones con el fin de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Demostrar el cumplimiento de la legislación aplicable.</li>
              <li>Atender auditorías.</li>
              <li>Resolver controversias.</li>
              <li>Defender derechos legales.</li>
            </ul>
            <p>La conservación de estos registros se limitará al tiempo necesario conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.8 Buena fe</h3>
            <p>Prompt Studio atenderá todas las solicitudes relacionadas con la privacidad actuando de buena fe, procurando garantizar el respeto de los derechos de los usuarios y el cumplimiento de las obligaciones legales aplicables.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 39. Vigencia
              </h2>
            </section>
            <p>La presente Política de Privacidad entra en vigor a partir de la fecha indicada al final del presente documento y permanecerá vigente hasta que sea sustituida por una versión posterior publicada por Prompt Studio.</p>
            <p>Prompt Studio podrá actualizar esta Política cuando resulte necesario para reflejar cambios legales, tecnológicos, operativos o comerciales, conforme a lo indicado en la Sección 36.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.1 Fecha de entrada en vigor</h3>
            <p>La presente Política de Privacidad entra en vigor el:</p>
            <p>10 de julio de 2026</p>
            <p>La fecha de entrada en vigor podrá actualizarse cuando se publique una nueva versión de este documento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.2 Versión vigente</h3>
            <p>La versión oficial y vigente de esta Política estará disponible permanentemente en:</p>
            <p>https://www.prompstudio.com</p>
            <p>En caso de existir copias o reproducciones de este documento en otros medios, prevalecerá la versión publicada en el sitio oficial.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.3 Sustitución de versiones anteriores</h3>
            <p>Cada nueva versión publicada sustituirá a la anterior desde la fecha de entrada en vigor correspondiente.</p>
            <p>Las versiones anteriores podrán conservarse únicamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento legal.</li>
              <li>Auditorías.</li>
              <li>Resolución de controversias.</li>
              <li>Verificación histórica.</li>
              <li>Cumplimiento de obligaciones regulatorias.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.4 Conservación documental</h3>
            <p>Prompt Studio podrá conservar registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aceptación de la Política.</li>
              <li>Cambios realizados.</li>
              <li>Versiones históricas.</li>
              <li>Consentimientos otorgados.</li>
              <li>Solicitudes relacionadas con privacidad.</li>
            </ul>
            <p>Estos registros podrán utilizarse para demostrar el cumplimiento de la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.5 Disponibilidad permanente</h3>
            <p>Prompt Studio procurará mantener esta Política disponible para consulta permanente desde su sitio web.</p>
            <p>El usuario podrá acceder a ella antes de crear una cuenta, realizar una compra o utilizar cualquiera de los servicios ofrecidos por la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.6 Relación con futuras funcionalidades</h3>
            <p>Cuando Prompt Studio incorpore nuevos servicios o funcionalidades que impliquen un tratamiento adicional de datos personales, esta Política podrá actualizarse para reflejar dichos cambios.</p>
            <p>Cuando la legislación lo requiera, el usuario será informado previamente y, en su caso, se solicitará el consentimiento correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.7 Idioma</h3>
            <p>La presente Política de Privacidad se redacta originalmente en idioma español.</p>
            <p>Si Prompt Studio publica traducciones a otros idiomas, dichas traducciones tendrán únicamente fines informativos, salvo que se indique expresamente lo contrario o la legislación aplicable disponga otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.8 Consulta permanente</h3>
            <p>Prompt Studio recomienda revisar periódicamente esta Política para mantenerse informado sobre la forma en que protegemos los datos personales.</p>
            <p>El uso continuado de la Plataforma implica la aceptación de la versión vigente de esta Política, salvo cuando la legislación exija un consentimiento adicional.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 40. Disposiciones Finales
              </h2>
            </section>
            <p>Las siguientes disposiciones regulan la interpretación general de la presente Política de Privacidad y complementan las obligaciones descritas en las secciones anteriores.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.1 Acuerdo integral</h3>
            <p>La presente Política forma parte integrante del marco legal de Prompt Studio y deberá interpretarse conjuntamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los Términos y Condiciones.</li>
              <li>La Política de Cookies.</li>
              <li>Las condiciones específicas de compra.</li>
              <li>Las condiciones de suscripciones Premium.</li>
              <li>Las políticas particulares relacionadas con promociones o servicios adicionales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.2 Prevalencia</h3>
            <p>Cuando exista una contradicción entre esta Política y cualquier otro documento relacionado con el tratamiento de datos personales, prevalecerá esta Política de Privacidad, salvo que la legislación aplicable disponga otra cosa.</p>
            <p>Las normas imperativas de protección de datos del país de residencia del usuario prevalecerán cuando sean obligatorias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.3 Divisibilidad</h3>
            <p>Si una disposición de esta Política fuese declarada inválida, ilegal o inaplicable por una autoridad competente, dicha circunstancia no afectará la validez de las restantes disposiciones.</p>
            <p>Las cláusulas restantes continuarán plenamente vigentes y producirán todos sus efectos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.4 No renuncia</h3>
            <p>La falta de ejercicio por parte de Prompt Studio de cualquiera de los derechos previstos en esta Política no constituirá una renuncia a dichos derechos.</p>
            <p>Cualquier renuncia deberá realizarse expresamente y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.5 Protección continua</h3>
            <p>Las obligaciones relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confidencialidad.</li>
              <li>Seguridad.</li>
              <li>Conservación de información.</li>
              <li>Cumplimiento legal.</li>
              <li>Protección de datos personales.</li>
            </ul>
            <p>continuarán siendo aplicables incluso después de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La eliminación de la cuenta.</li>
              <li>La cancelación de una suscripción.</li>
              <li>La finalización del uso de la Plataforma.</li>
              <li>La terminación de la relación contractual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.6 Interpretación</h3>
            <p>Los títulos y encabezados utilizados en esta Política tienen únicamente fines organizativos y no modifican el significado jurídico de las disposiciones correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.7 Comunicaciones oficiales</h3>
            <p>Las comunicaciones oficiales relacionadas con la presente Política podrán realizarse mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico.</li>
              <li>Avisos dentro de la Plataforma.</li>
              <li>Publicaciones en el sitio web.</li>
              <li>Otros medios electrónicos razonablemente apropiados.</li>
            </ul>
            <p>Prompt Studio podrá utilizar cualquiera de estos medios cuando resulte necesario para cumplir obligaciones legales o informar cambios importantes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.8 Contacto oficial</h3>
            <p>Para cualquier consulta relacionada con esta Política de Privacidad, los usuarios podrán comunicarse con:</p>
            <p>Prompt Studio</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>user@example.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.9 Compromiso con la privacidad</h3>
            <p>Prompt Studio reafirma su compromiso de tratar los datos personales de manera:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Lícita.</li>
              <li>Leal.</li>
              <li>Transparente.</li>
              <li>Limitada a las finalidades informadas.</li>
              <li>Segura.</li>
              <li>Responsable.</li>
            </ul>
            <p>Nuestro objetivo es ofrecer una plataforma confiable que permita a los usuarios acceder a recursos para Inteligencia Artificial con un alto nivel de protección de su información personal.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.10 Declaración final</h3>
            <p>Al acceder, registrarse o utilizar cualquiera de los servicios ofrecidos por Prompt Studio, el usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha leído la presente Política de Privacidad.</li>
              <li>Comprende su contenido.</li>
              <li>Conoce cómo se tratarán sus datos personales.</li>
              <li>Ha sido informado sobre sus derechos.</li>
              <li>Acepta el tratamiento de sus datos conforme a esta Política y a la legislación aplicable.</li>
            </ul>
            <p>Cuando la normativa vigente requiera un consentimiento expreso, Prompt Studio lo solicitará mediante los mecanismos correspondientes antes de iniciar el tratamiento de los datos.</p>
            <p>© 2026 Prompt Studio. Todos los derechos reservados.</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web: https://www.prompstudio.com</p>
            <p>Correo electrónico: user@example.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
