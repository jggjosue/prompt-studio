import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Prompt Studio',
  description: 'Términos y Condiciones de Prompt Studio.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Términos y Condiciones
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Última actualización: <span className="font-medium text-foreground">2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 1. Introducción
              </h2>
            </section>
            <p>Bienvenido a Prompt Studio (“la Plataforma”, “Prompt Studio”, “nosotros”, “nuestro” o “la Empresa”).</p>
            <p>Estos Términos y Condiciones regulan el acceso, navegación, registro, compra y utilización de todos los servicios ofrecidos a través del sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>La Plataforma es propiedad y está administrada por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Correo electrónico oficial:</p>
            <p>help@prompstudio.com</p>
            <p>Al acceder o utilizar Prompt Studio, el usuario acepta quedar obligado por los presentes Términos y Condiciones.</p>
            <p>Si el usuario no está de acuerdo con cualquiera de estas disposiciones, deberá abstenerse de utilizar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.1 Objeto</h3>
            <p>Prompt Studio es una plataforma especializada en recursos para Inteligencia Artificial que permite a los usuarios acceder, descargar, comprar y utilizar distintos activos digitales relacionados con modelos generativos.</p>
            <p>La Plataforma ofrece, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para aplicaciones.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Componentes web.</li>
              <li>Recursos gratuitos.</li>
              <li>Recursos Premium.</li>
              <li>Herramientas basadas en Inteligencia Artificial.</li>
              <li>Suscripciones Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.2 Finalidad de los Términos</h3>
            <p>Estos Términos tienen como finalidad establecer:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las reglas de uso de la Plataforma.</li>
              <li>Los derechos y obligaciones del usuario.</li>
              <li>Las condiciones de compra.</li>
              <li>Las condiciones de las suscripciones.</li>
              <li>Las licencias de uso de los recursos digitales.</li>
              <li>Las limitaciones de responsabilidad.</li>
              <li>La protección de la propiedad intelectual.</li>
              <li>Las normas relacionadas con el uso de Inteligencia Artificial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.3 Documentos relacionados</h3>
            <p>Estos Términos deberán interpretarse conjuntamente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Política de Privacidad.</li>
              <li>Política de Cookies.</li>
              <li>Política de Reembolsos.</li>
              <li>Política de Licencias de Recursos Digitales (cuando exista).</li>
              <li>Condiciones particulares aplicables a determinados productos o servicios.</li>
            </ul>
            <p>En caso de conflicto respecto al tratamiento de datos personales, prevalecerá la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.4 Servicios disponibles</h3>
            <p>Prompt Studio podrá ofrecer, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recursos gratuitos.</li>
              <li>Recursos Premium.</li>
              <li>Compras individuales.</li>
              <li>Suscripciones.</li>
              <li>Descargas digitales.</li>
              <li>Herramientas de IA.</li>
              <li>Programa de afiliados.</li>
              <li>Recursos exclusivos.</li>
              <li>Actualizaciones.</li>
              <li>Material educativo relacionado con Inteligencia Artificial.</li>
            </ul>
            <p>Los servicios disponibles podrán modificarse con el tiempo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.5 Alcance territorial</h3>
            <p>Prompt Studio puede ser utilizado por personas ubicadas en distintos países.</p>
            <p>No obstante, algunos productos, promociones o servicios podrán no estar disponibles en determinadas jurisdicciones debido a restricciones legales o comerciales.</p>
            <p>Es responsabilidad del usuario verificar que el uso de la Plataforma sea legal conforme a la legislación de su país.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.6 Idioma</h3>
            <p>Los presentes Términos se redactan originalmente en idioma español.</p>
            <p>Prompt Studio podrá publicar traducciones a otros idiomas únicamente para facilitar su comprensión.</p>
            <p>En caso de discrepancia entre versiones, prevalecerá la versión en español, salvo que la legislación aplicable disponga otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.7 Actualizaciones</h3>
            <p>Prompt Studio podrá incorporar nuevas funciones, herramientas o servicios que quedarán sujetos a estos mismos Términos, salvo que se indique expresamente lo contrario.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 2. Definiciones
              </h2>
            </section>
            <p>Para facilitar la interpretación de estos Términos, las siguientes expresiones tendrán el significado indicado a continuación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Plataforma</h3>
            <p>Hace referencia al sitio web https://www.prompstudio.com, sus aplicaciones, servicios, contenido, herramientas y funcionalidades.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Usuario</h3>
            <p>Persona física o jurídica que accede, navega, utiliza, compra productos o crea una cuenta en Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Cuenta</h3>
            <p>Perfil creado por el usuario mediante el sistema de autenticación proporcionado por Clerk, que permite acceder a determinadas funciones de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Recursos digitales</h3>
            <p>Archivos o contenidos disponibles en Prompt Studio, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Plantillas.</li>
              <li>Archivos HTML.</li>
              <li>Componentes.</li>
              <li>Recursos descargables.</li>
              <li>Demos.</li>
              <li>Documentación.</li>
              <li>Otros activos digitales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Recursos gratuitos</h3>
            <p>Contenido disponible sin costo para los usuarios conforme a las condiciones establecidas por Prompt Studio.</p>
            <p>El acceso a algunos recursos gratuitos podrá requerir una cuenta registrada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.6 Recursos Premium</h3>
            <p>Contenido disponible únicamente mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compra individual.</li>
              <li>Suscripción activa.</li>
              <li>Promoción autorizada.</li>
              <li>Acceso especial otorgado por Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.7 Suscripción Premium</h3>
            <p>Servicio de acceso periódico que permite utilizar determinadas funciones o recursos exclusivos durante el tiempo contratado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.8 Inteligencia Artificial</h3>
            <p>Herramientas integradas en Prompt Studio que utilizan modelos de IA para ayudar a generar, optimizar o mejorar prompts y otros contenidos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.9 Compra</h3>
            <p>Operación mediante la cual un usuario adquiere una licencia de uso sobre uno o varios recursos digitales ofrecidos por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.10 Licencia</h3>
            <p>Autorización limitada otorgada al usuario para utilizar determinados recursos digitales conforme a las condiciones establecidas por Prompt Studio.</p>
            <p>La licencia no implica la transferencia de la propiedad intelectual del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.11 Proveedores tecnológicos</h3>
            <p>Servicios externos utilizados para operar la Plataforma, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Servicios de autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Bases de datos.</li>
              <li>Infraestructura en la nube.</li>
              <li>Analítica.</li>
              <li>Inteligencia Artificial.</li>
              <li>Envío de correos electrónicos.</li>
              <li>Almacenamiento de archivos.</li>
            </ul>
            <p>Prompt Studio podrá sustituir estos proveedores por otros equivalentes cuando resulte necesario para mejorar el servicio o mantener la seguridad de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.12 Contenido generado por el usuario</h3>
            <p>Toda información, prompts, instrucciones, comentarios u otros materiales creados o enviados por el usuario durante el uso de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.13 Contenido generado mediante IA</h3>
            <p>Resultado producido por herramientas de Inteligencia Artificial integradas en Prompt Studio como respuesta a las solicitudes realizadas por el usuario.</p>
            <p>Debido al funcionamiento probabilístico de los modelos de IA, estos resultados pueden variar y no ser exclusivos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 3. Aceptación de los Términos
              </h2>
            </section>
            <p>Al acceder, navegar, registrarse, descargar recursos, realizar compras, contratar una suscripción o utilizar cualquiera de los servicios ofrecidos por Prompt Studio, el usuario declara haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones.</p>
            <p>La aceptación constituye un acuerdo legalmente vinculante entre el usuario y Magzin LLC, empresa operadora de Prompt Studio.</p>
            <p>Si el usuario no acepta estos Términos, deberá abstenerse de utilizar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.1 Aceptación expresa</h3>
            <p>La aceptación podrá realizarse mediante cualquiera de las siguientes acciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear una cuenta.</li>
              <li>Iniciar sesión.</li>
              <li>Descargar recursos gratuitos.</li>
              <li>Comprar recursos Premium.</li>
              <li>Contratar una suscripción.</li>
              <li>Utilizar las herramientas de Inteligencia Artificial.</li>
              <li>Navegar por la Plataforma cuando la legislación permita considerar dicho uso como aceptación.</li>
            </ul>
            <p>Cuando la normativa aplicable lo requiera, Prompt Studio solicitará una aceptación expresa mediante casillas de verificación u otros mecanismos equivalentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.2 Capacidad para aceptar</h3>
            <p>El usuario declara que posee la capacidad legal necesaria para celebrar contratos vinculantes conforme a la legislación aplicable.</p>
            <p>Si el usuario actúa en representación de una empresa u organización, declara además que cuenta con la autorización suficiente para obligar jurídicamente a dicha entidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.3 Uso continuo</h3>
            <p>El uso continuado de Prompt Studio después de la publicación de modificaciones en estos Términos constituirá la aceptación de la versión vigente, salvo que la legislación aplicable exija un consentimiento adicional.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.4 Cambios en los servicios</h3>
            <p>Prompt Studio podrá incorporar nuevas funcionalidades, productos o herramientas.</p>
            <p>Salvo que se indique expresamente lo contrario, dichas funcionalidades quedarán automáticamente sujetas a estos Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.5 Aceptación de políticas relacionadas</h3>
            <p>Al utilizar Prompt Studio, el usuario también acepta cumplir, cuando resulten aplicables:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La Política de Privacidad.</li>
              <li>La Política de Cookies.</li>
              <li>La Política de Reembolsos.</li>
              <li>La Política de Licencias.</li>
              <li>Las condiciones específicas de promociones.</li>
              <li>Las condiciones particulares de determinados productos o servicios.</li>
            </ul>
            <p>Estos documentos forman parte integrante del marco legal de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.6 Modificaciones futuras</h3>
            <p>Prompt Studio podrá modificar estos Términos cuando resulte necesario debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios legales.</li>
              <li>Nuevas funcionalidades.</li>
              <li>Nuevos servicios.</li>
              <li>Cambios tecnológicos.</li>
              <li>Requisitos regulatorios.</li>
              <li>Mejoras de seguridad.</li>
            </ul>
            <p>Las modificaciones se publicarán oportunamente en la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.7 Terminación del uso</h3>
            <p>Si el usuario no está de acuerdo con una modificación de estos Términos, podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dejar de utilizar Prompt Studio.</li>
              <li>Eliminar su cuenta.</li>
              <li>Cancelar sus suscripciones activas conforme a las condiciones correspondientes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.8 Independencia de las cláusulas</h3>
            <p>La nulidad o inaplicabilidad de una disposición de estos Términos no afectará la validez de las demás cláusulas, que continuarán plenamente vigentes.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 4. Elegibilidad y Capacidad Legal
              </h2>
            </section>
            <p>Prompt Studio está destinado a personas que tengan capacidad legal para utilizar los servicios ofrecidos y celebrar contratos conforme a la legislación aplicable.</p>
            <p>El acceso a determinadas funcionalidades podrá estar sujeto a requisitos adicionales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.1 Edad mínima</h3>
            <p>El usuario declara que cumple con la edad mínima exigida por la legislación de su país para utilizar servicios digitales y celebrar contratos electrónicos.</p>
            <p>Cuando la normativa requiera autorización de padres o tutores, el usuario deberá contar con dicho consentimiento antes de utilizar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.2 Uso por menores de edad</h3>
            <p>Los menores de edad únicamente podrán utilizar Prompt Studio cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación lo permita.</li>
              <li>Exista autorización expresa de sus padres o tutores legales.</li>
              <li>El uso se realice bajo la supervisión correspondiente.</li>
            </ul>
            <p>Prompt Studio podrá cancelar cuentas cuando tenga conocimiento de que fueron creadas en incumplimiento de estas condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.3 Capacidad jurídica</h3>
            <p>El usuario garantiza que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tiene capacidad para contratar.</li>
              <li>Puede asumir obligaciones legales.</li>
              <li>No existe restricción legal que le impida utilizar los servicios de Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.4 Personas jurídicas</h3>
            <p>Cuando una empresa, institución u organización utilice Prompt Studio mediante uno de sus representantes, dicho representante declara contar con facultades suficientes para aceptar estos Términos en nombre de la entidad correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.5 Restricciones geográficas</h3>
            <p>Prompt Studio podrá limitar o restringir el acceso a determinados servicios en ciertos países o territorios cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Existan restricciones legales.</li>
              <li>Sea necesario cumplir sanciones internacionales.</li>
              <li>Existan limitaciones técnicas o comerciales.</li>
              <li>Lo exijan obligaciones regulatorias.</li>
            </ul>
            <p>La disponibilidad de los servicios podrá variar según la ubicación del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.6 Cumplimiento normativo</h3>
            <p>El usuario se compromete a utilizar Prompt Studio respetando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación aplicable.</li>
              <li>Los derechos de terceros.</li>
              <li>Las normas sobre propiedad intelectual.</li>
              <li>Las normas de protección de datos.</li>
              <li>Las leyes relacionadas con el uso de Inteligencia Artificial cuando existan.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.7 Información veraz</h3>
            <p>El usuario declara que toda la información proporcionada durante el registro o utilización de la Plataforma será:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verdadera.</li>
              <li>Exacta.</li>
              <li>Completa.</li>
              <li>Actualizada.</li>
            </ul>
            <p>El suministro de información falsa podrá dar lugar a la suspensión o cancelación de la cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.8 Verificación</h3>
            <p>Cuando resulte necesario para proteger la seguridad de la Plataforma o cumplir obligaciones legales, Prompt Studio podrá solicitar información adicional para verificar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La identidad del usuario.</li>
              <li>La titularidad de la cuenta.</li>
              <li>La legitimidad de determinadas operaciones.</li>
              <li>El cumplimiento de estos Términos.</li>
            </ul>
            <p>La negativa injustificada a proporcionar dicha información podrá impedir el acceso a determinados servicios.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 5. Registro de Cuenta
              </h2>
            </section>
            <p>Determinadas funcionalidades de Prompt Studio requieren la creación de una cuenta de usuario.</p>
            <p>El registro permite acceder a recursos gratuitos, adquirir contenido Premium, administrar suscripciones, consultar el historial de compras, utilizar herramientas de Inteligencia Artificial y acceder a otras funciones disponibles en la Plataforma.</p>
            <p>La creación de una cuenta es gratuita, salvo que se indique expresamente lo contrario para determinados servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.1 Creación de la cuenta</h3>
            <p>Para registrarse, el usuario deberá proporcionar la información solicitada durante el proceso de registro.</p>
            <p>Dependiendo de la configuración vigente, podrá requerirse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Método de autenticación.</li>
              <li>Información necesaria para verificar la identidad.</li>
              <li>Datos adicionales cuando sean necesarios para determinados servicios.</li>
            </ul>
            <p>El usuario se compromete a proporcionar información veraz, exacta y actualizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.2 Cuenta personal</h3>
            <p>La cuenta es personal e intransferible.</p>
            <p>El usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compartir su cuenta con terceros.</li>
              <li>Permitir el acceso no autorizado.</li>
              <li>Vender su cuenta.</li>
              <li>Alquilar su cuenta.</li>
              <li>Transferir la titularidad sin autorización expresa de Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.3 Información del perfil</h3>
            <p>El usuario podrá actualizar determinada información de su perfil desde la configuración de la cuenta.</p>
            <p>Es responsabilidad del usuario mantener actualizados sus datos de contacto para recibir correctamente comunicaciones importantes relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seguridad.</li>
              <li>Compras.</li>
              <li>Facturación.</li>
              <li>Suscripciones.</li>
              <li>Cambios relevantes en la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.4 Una cuenta por usuario</h3>
            <p>Salvo autorización expresa de Prompt Studio, cada usuario deberá mantener una única cuenta personal.</p>
            <p>La creación masiva de cuentas con fines fraudulentos, automatizados o destinados a obtener ventajas indebidas podrá dar lugar a la suspensión o eliminación de todas las cuentas involucradas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.5 Verificación del correo electrónico</h3>
            <p>Prompt Studio podrá requerir la verificación de la dirección de correo electrónico antes de permitir el acceso a determinadas funcionalidades.</p>
            <p>Hasta que dicha verificación se complete, algunos servicios podrán permanecer limitados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.6 Responsabilidad sobre la cuenta</h3>
            <p>El usuario es responsable de todas las actividades realizadas desde su cuenta.</p>
            <p>Esto incluye, entre otras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras.</li>
              <li>Descargas.</li>
              <li>Uso de herramientas de IA.</li>
              <li>Cambios en el perfil.</li>
              <li>Uso de recursos Premium.</li>
              <li>Actividad del programa de afiliados.</li>
            </ul>
            <p>Si el usuario detecta un acceso no autorizado, deberá comunicarlo inmediatamente a Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.7 Eliminación de la cuenta</h3>
            <p>El usuario podrá eliminar su cuenta en cualquier momento desde la configuración correspondiente o contactando a:</p>
            <p>help@prompstudio.com</p>
            <p>La eliminación de la cuenta se realizará conforme a la Política de Privacidad y podrá implicar la pérdida de acceso a determinados recursos y servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.8 Derecho de rechazo</h3>
            <p>Prompt Studio se reserva el derecho de rechazar el registro o cancelar una cuenta cuando existan motivos razonables, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Información falsa.</li>
              <li>Suplantación de identidad.</li>
              <li>Incumplimiento de estos Términos.</li>
              <li>Actividad fraudulenta.</li>
              <li>Riesgos para la seguridad de la Plataforma.</li>
              <li>Requerimientos legales.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 6. Autenticación mediante Clerk
              </h2>
            </section>
            <p>Prompt Studio utiliza Clerk como proveedor especializado para la autenticación y administración segura de las cuentas de usuario.</p>
            <p>Clerk proporciona la infraestructura necesaria para gestionar el registro, el inicio de sesión, la recuperación de cuentas y otras funciones relacionadas con la identidad del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.1 Proveedor de autenticación</h3>
            <p>La autenticación de los usuarios se realiza mediante Clerk.</p>
            <p>Prompt Studio no desarrolla un sistema propio de autenticación y confía en la infraestructura de seguridad proporcionada por dicho proveedor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.2 Métodos de inicio de sesión</h3>
            <p>Dependiendo de la configuración vigente, Clerk podrá ofrecer uno o varios métodos de autenticación, tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico y contraseña.</li>
              <li>Magic Links.</li>
              <li>Códigos de verificación.</li>
              <li>Proveedores OAuth compatibles.</li>
              <li>Autenticación multifactor (MFA).</li>
              <li>Otros métodos incorporados por Clerk.</li>
            </ul>
            <p>La disponibilidad de estos métodos podrá variar con el tiempo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.3 Seguridad de las credenciales</h3>
            <p>Las credenciales de acceso son administradas directamente por Clerk.</p>
            <p>Prompt Studio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No almacena contraseñas en texto plano.</li>
              <li>No puede visualizar las contraseñas del usuario.</li>
              <li>No recupera credenciales de autenticación.</li>
              <li>No tiene acceso a los métodos de verificación utilizados por Clerk.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.4 Sesiones</h3>
            <p>Clerk administra las sesiones activas del usuario para permitir un acceso seguro a la Plataforma.</p>
            <p>El usuario podrá cerrar sesión desde cualquiera de sus dispositivos cuando dicha funcionalidad esté disponible.</p>
            <p>Prompt Studio podrá cerrar sesiones activas por motivos de seguridad cuando resulte necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.5 Recuperación de acceso</h3>
            <p>Cuando el usuario olvide sus credenciales, podrá utilizar los mecanismos de recuperación proporcionados por Clerk.</p>
            <p>Prompt Studio no interviene directamente en el restablecimiento de contraseñas, salvo para brindar asistencia general sobre el proceso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.6 Protección de la cuenta</h3>
            <p>El usuario deberá adoptar medidas razonables para proteger su cuenta, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la confidencialidad de sus credenciales.</li>
              <li>Utilizar contraseñas seguras cuando corresponda.</li>
              <li>No compartir códigos de verificación.</li>
              <li>Cerrar sesión en dispositivos públicos o compartidos.</li>
              <li>Notificar inmediatamente cualquier acceso sospechoso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.7 Integración con la Plataforma</h3>
            <p>La información de autenticación administrada por Clerk podrá sincronizarse con Prompt Studio para permitir, entre otras funciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso a recursos gratuitos.</li>
              <li>Acceso a recursos Premium.</li>
              <li>Gestión del perfil.</li>
              <li>Historial de compras.</li>
              <li>Estado de la suscripción.</li>
              <li>Programa de afiliados.</li>
              <li>Preferencias del usuario.</li>
            </ul>
            <p>La sincronización se limita a la información estrictamente necesaria para prestar los servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.8 Cambios en el proveedor</h3>
            <p>Prompt Studio podrá sustituir Clerk por otro proveedor de autenticación equivalente cuando existan razones técnicas, comerciales, operativas o de seguridad.</p>
            <p>En caso de realizarse dicho cambio, Prompt Studio procurará mantener un nivel de seguridad igual o superior para proteger las cuentas de los usuarios.</p>
            <p>TÉRMINOS Y CONDICIONES DE SERVICIO</p>
            <p>Página 4</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 7. Seguridad de la Cuenta
              </h2>
            </section>
            <p>Prompt Studio implementa medidas técnicas y organizativas destinadas a proteger las cuentas de los usuarios frente a accesos no autorizados, pérdida de información, uso indebido y actividades fraudulentas.</p>
            <p>No obstante, la seguridad de una cuenta también depende del comportamiento responsable del usuario.</p>
            <p>El usuario es responsable de mantener la confidencialidad de sus credenciales y de adoptar medidas razonables para proteger el acceso a su cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 Responsabilidad del usuario</h3>
            <p>El usuario será responsable de todas las actividades realizadas desde su cuenta, incluyendo, entre otras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras de recursos digitales.</li>
              <li>Contratación de suscripciones.</li>
              <li>Descarga de contenido.</li>
              <li>Uso de herramientas de Inteligencia Artificial.</li>
              <li>Modificaciones del perfil.</li>
              <li>Participación en el programa de afiliados.</li>
              <li>Configuración de preferencias.</li>
            </ul>
            <p>El usuario deberá informar inmediatamente a Prompt Studio si sospecha que un tercero ha obtenido acceso no autorizado a su cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Protección de credenciales</h3>
            <p>El usuario se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener en secreto sus credenciales de acceso.</li>
              <li>No compartir su contraseña con terceros.</li>
              <li>No compartir códigos de verificación.</li>
              <li>No revelar enlaces de autenticación (“Magic Links”).</li>
              <li>Utilizar contraseñas seguras cuando el método de autenticación lo requiera.</li>
              <li>Cambiar sus credenciales cuando sospeche un acceso no autorizado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Accesos no autorizados</h3>
            <p>Si Prompt Studio detecta actividad que pueda indicar un acceso no autorizado, podrá adoptar medidas preventivas, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Solicitar una nueva autenticación.</li>
              <li>Cerrar sesiones activas.</li>
              <li>Suspender temporalmente el acceso.</li>
              <li>Bloquear determinadas funciones.</li>
              <li>Solicitar información adicional para verificar la identidad del usuario.</li>
            </ul>
            <p>Estas medidas tienen como finalidad proteger tanto al usuario como a la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Dispositivos</h3>
            <p>El usuario es responsable de proteger los dispositivos utilizados para acceder a Prompt Studio.</p>
            <p>Se recomienda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener actualizado el sistema operativo.</li>
              <li>Utilizar software antivirus cuando corresponda.</li>
              <li>Evitar acceder desde dispositivos públicos o inseguros.</li>
              <li>Cerrar sesión al finalizar el uso en equipos compartidos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Ingeniería social</h3>
            <p>Prompt Studio nunca solicitará al usuario por correo electrónico o por otros medios:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Su contraseña.</li>
              <li>Códigos de autenticación.</li>
              <li>Códigos MFA.</li>
              <li>Información bancaria completa.</li>
            </ul>
            <p>Si el usuario recibe una solicitud sospechosa haciéndose pasar por Prompt Studio, deberá comunicarlo inmediatamente a:</p>
            <p>help@prompstudio.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Actividad sospechosa</h3>
            <p>Prompt Studio podrá supervisar determinados eventos de seguridad para detectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Intentos repetidos de inicio de sesión.</li>
              <li>Accesos desde ubicaciones inusuales.</li>
              <li>Uso automatizado de cuentas.</li>
              <li>Intentos de fraude.</li>
              <li>Actividad incompatible con el uso normal de la Plataforma.</li>
            </ul>
            <p>La supervisión se realiza exclusivamente con fines de seguridad y protección del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Suspensión preventiva</h3>
            <p>Cuando existan indicios razonables de que una cuenta ha sido comprometida, Prompt Studio podrá suspender temporalmente el acceso hasta verificar la identidad del usuario.</p>
            <p>Esta medida busca evitar el uso indebido de la cuenta y proteger los recursos asociados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Notificación de incidentes</h3>
            <p>Cuando el usuario detecte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos desconocidos.</li>
              <li>Compras no autorizadas.</li>
              <li>Cambios inesperados en su perfil.</li>
              <li>Actividad sospechosa.</li>
            </ul>
            <p>deberá notificarlo lo antes posible mediante:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio colaborará razonablemente para investigar el incidente y restaurar la seguridad de la cuenta cuando sea posible.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 8. Uso Permitido de la Plataforma
              </h2>
            </section>
            <p>Prompt Studio concede al usuario una licencia limitada, personal, no exclusiva, revocable e intransferible para utilizar la Plataforma conforme a los presentes Términos y Condiciones.</p>
            <p>El uso deberá realizarse de forma lícita, responsable y respetando los derechos de Prompt Studio, de otros usuarios y de terceros.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.1 Uso autorizado</h3>
            <p>El usuario podrá utilizar Prompt Studio para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consultar recursos gratuitos.</li>
              <li>Comprar recursos Premium.</li>
              <li>Descargar los recursos adquiridos.</li>
              <li>Utilizar herramientas de Inteligencia Artificial.</li>
              <li>Administrar su cuenta.</li>
              <li>Gestionar sus suscripciones.</li>
              <li>Participar en el programa de afiliados cuando esté disponible.</li>
              <li>Acceder a los servicios ofrecidos conforme a estos Términos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.2 Uso personal y comercial</h3>
            <p>Salvo que la licencia específica del recurso establezca otra cosa, el usuario podrá utilizar los recursos adquiridos únicamente dentro del alcance permitido por la licencia correspondiente.</p>
            <p>La compra de un recurso no implica automáticamente el derecho a redistribuirlo, revenderlo o sublicenciarlo.</p>
            <p>Las condiciones de uso comercial estarán determinadas por la licencia aplicable a cada recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.3 Cumplimiento de la ley</h3>
            <p>El usuario se compromete a utilizar Prompt Studio respetando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación aplicable.</li>
              <li>Los derechos de propiedad intelectual.</li>
              <li>Las normas sobre protección de datos personales.</li>
              <li>Las normas relacionadas con el uso de Inteligencia Artificial.</li>
              <li>Los derechos de terceros.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.4 Uso responsable de la IA</h3>
            <p>Las herramientas de Inteligencia Artificial disponibles en Prompt Studio deberán utilizarse de manera responsable.</p>
            <p>El usuario será responsable del contenido que genere, publique o utilice mediante dichas herramientas.</p>
            <p>Prompt Studio no sustituye el criterio profesional del usuario y recomienda revisar cuidadosamente los resultados obtenidos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.5 Uso automatizado</h3>
            <p>Salvo autorización expresa de Prompt Studio, no está permitido utilizar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bots.</li>
              <li>Scripts automatizados.</li>
              <li>Sistemas de scraping.</li>
              <li>Crawlers.</li>
              <li>Herramientas de extracción masiva.</li>
              <li>Automatizaciones destinadas a descargar contenido de forma masiva.</li>
            </ul>
            <p>Estas actividades podrán dar lugar a la suspensión inmediata de la cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.6 Disponibilidad del servicio</h3>
            <p>Prompt Studio realiza esfuerzos razonables para mantener la Plataforma disponible.</p>
            <p>No obstante, el usuario reconoce que podrán producirse interrupciones derivadas de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento.</li>
              <li>Actualizaciones.</li>
              <li>Fallos técnicos.</li>
              <li>Problemas de infraestructura.</li>
              <li>Incidentes de seguridad.</li>
              <li>Circunstancias de fuerza mayor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.7 Uso conforme a la licencia</h3>
            <p>Cada recurso disponible en Prompt Studio podrá estar sujeto a condiciones particulares de uso.</p>
            <p>El usuario acepta respetar dichas condiciones antes de utilizar cualquier recurso descargado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.8 Reserva de derechos</h3>
            <p>Todos los derechos que no sean expresamente concedidos al usuario mediante estos Términos o mediante la licencia específica del recurso permanecerán reservados a Prompt Studio o a los respectivos titulares de los derechos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 9. Conductas Prohibidas
              </h2>
            </section>
            <p>Con el fin de proteger la seguridad, disponibilidad e integridad de Prompt Studio y de sus usuarios, queda estrictamente prohibido utilizar la Plataforma para actividades ilícitas, fraudulentas o contrarias a estos Términos y Condiciones.</p>
            <p>Prompt Studio podrá suspender o cancelar cuentas que incumplan cualquiera de las disposiciones establecidas en esta sección, sin perjuicio de las acciones legales que correspondan.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.1 Uso ilícito</h3>
            <p>El usuario no podrá utilizar Prompt Studio para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violar cualquier ley o reglamento aplicable.</li>
              <li>Facilitar actividades ilegales.</li>
              <li>Promover conductas delictivas.</li>
              <li>Eludir restricciones legales.</li>
              <li>Obtener beneficios mediante fraude.</li>
              <li>Realizar actividades contrarias al orden público.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.2 Acceso no autorizado</h3>
            <p>Queda prohibido intentar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a cuentas ajenas.</li>
              <li>Obtener acceso no autorizado a servidores.</li>
              <li>Eludir mecanismos de autenticación.</li>
              <li>Descifrar sistemas de seguridad.</li>
              <li>Obtener información restringida.</li>
              <li>Vulnerar la infraestructura tecnológica de Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.3 Ingeniería inversa</h3>
            <p>Salvo que la legislación aplicable lo permita expresamente, el usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descompilar.</li>
              <li>Desensamblar.</li>
              <li>Realizar ingeniería inversa.</li>
              <li>Intentar descubrir el código fuente.</li>
              <li>Extraer algoritmos internos.</li>
              <li>Analizar los mecanismos internos de funcionamiento de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.4 Scraping y extracción automatizada</h3>
            <p>Queda prohibido utilizar herramientas automatizadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extraer prompts.</li>
              <li>Descargar recursos masivamente.</li>
              <li>Copiar bases de datos.</li>
              <li>Obtener catálogos completos.</li>
              <li>Extraer metadatos.</li>
              <li>Replicar la Plataforma.</li>
            </ul>
            <p>Esta prohibición incluye, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bots.</li>
              <li>Crawlers.</li>
              <li>Scrapers.</li>
              <li>Automatizaciones.</li>
              <li>Scripts masivos.</li>
              <li>Herramientas de inteligencia artificial destinadas a copiar el contenido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.5 Redistribución no autorizada</h3>
            <p>El usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender recursos digitales sin autorización.</li>
              <li>Compartir recursos Premium públicamente.</li>
              <li>Publicar enlaces de descarga privados.</li>
              <li>Distribuir archivos protegidos.</li>
              <li>Comercializar contenido adquirido cuando la licencia no lo permita.</li>
              <li>Eliminar avisos de propiedad intelectual.</li>
            </ul>
            <p>Cada recurso está sujeto a la licencia específica indicada en su página correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.6 Uso indebido de la Inteligencia Artificial</h3>
            <p>Las herramientas de IA de Prompt Studio no podrán utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generar contenido ilícito.</li>
              <li>Crear malware.</li>
              <li>Desarrollar software malicioso.</li>
              <li>Suplantar identidades.</li>
              <li>Difundir información falsa con fines fraudulentos.</li>
              <li>Infringir derechos de terceros.</li>
              <li>Crear contenido que vulnere derechos de autor.</li>
              <li>Promover actividades ilegales.</li>
            </ul>
            <p>Prompt Studio podrá limitar o suspender el acceso a estas herramientas cuando detecte un uso indebido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.7 Interferencia con la Plataforma</h3>
            <p>Queda prohibido realizar acciones destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Saturar los servidores.</li>
              <li>Interrumpir el funcionamiento del sitio.</li>
              <li>Provocar ataques de denegación de servicio (DoS o DDoS).</li>
              <li>Alterar la disponibilidad de los servicios.</li>
              <li>Manipular métricas.</li>
              <li>Afectar el rendimiento de otros usuarios.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.8 Consecuencias del incumplimiento</h3>
            <p>Cuando Prompt Studio detecte un incumplimiento de estos Términos, podrá adoptar una o varias de las siguientes medidas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Advertencia.</li>
              <li>Suspensión temporal.</li>
              <li>Cancelación definitiva de la cuenta.</li>
              <li>Cancelación de suscripciones.</li>
              <li>Revocación de licencias.</li>
              <li>Bloqueo de descargas.</li>
              <li>Retención de pagos cuando exista fraude.</li>
              <li>Inicio de acciones legales.</li>
              <li>Colaboración con autoridades competentes.</li>
            </ul>
            <p>La medida adoptada dependerá de la gravedad de la infracción.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 10. Contenido Gratuito
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de los usuarios una selección de recursos digitales gratuitos con el objetivo de facilitar el aprendizaje, la experimentación y el desarrollo de proyectos relacionados con la Inteligencia Artificial.</p>
            <p>El acceso a estos recursos no implica la adquisición de derechos de propiedad intelectual sobre los mismos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.1 Recursos disponibles</h3>
            <p>Los recursos gratuitos podrán incluir, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Plantillas.</li>
              <li>Archivos HTML.</li>
              <li>Componentes.</li>
              <li>Demos.</li>
              <li>Ejemplos.</li>
              <li>Documentación.</li>
              <li>Recursos educativos.</li>
            </ul>
            <p>La disponibilidad de estos recursos podrá modificarse en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.2 Registro</h3>
            <p>Algunos recursos gratuitos podrán descargarse sin necesidad de crear una cuenta.</p>
            <p>Otros podrán requerir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registro previo.</li>
              <li>Inicio de sesión.</li>
              <li>Verificación del correo electrónico.</li>
              <li>Aceptación de estos Términos.</li>
            </ul>
            <p>Prompt Studio podrá modificar estos requisitos cuando resulte necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.3 Licencia de uso</h3>
            <p>Salvo que se indique expresamente otra cosa, los recursos gratuitos se proporcionan mediante una licencia limitada, personal, no exclusiva, revocable e intransferible.</p>
            <p>El usuario únicamente podrá utilizarlos conforme a las condiciones indicadas para cada recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.4 Modificaciones</h3>
            <p>Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actualizar.</li>
              <li>Corregir.</li>
              <li>Mejorar.</li>
              <li>Sustituir.</li>
              <li>Retirar.</li>
            </ul>
            <p>cualquier recurso gratuito sin previo aviso.</p>
            <p>La eliminación de un recurso gratuito no genera derecho a compensación alguna.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.5 Disponibilidad</h3>
            <p>Prompt Studio no garantiza que un recurso gratuito permanezca disponible de manera permanente.</p>
            <p>Los recursos podrán ser retirados por razones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Técnicas.</li>
              <li>Comerciales.</li>
              <li>Contractuales.</li>
              <li>Legales.</li>
              <li>Editoriales.</li>
              <li>De mantenimiento.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.6 Calidad del contenido</h3>
            <p>Prompt Studio realiza esfuerzos razonables para ofrecer recursos útiles y de calidad.</p>
            <p>Sin embargo, los recursos gratuitos se proporcionan “tal cual” (“as is”), sin garantías de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exactitud absoluta.</li>
              <li>Idoneidad para un propósito específico.</li>
              <li>Ausencia de errores.</li>
              <li>Compatibilidad con todos los sistemas.</li>
              <li>Disponibilidad permanente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.7 Uso comercial</h3>
            <p>Algunos recursos gratuitos podrán utilizarse con fines comerciales cuando la licencia correspondiente así lo permita.</p>
            <p>Otros podrán limitarse exclusivamente al uso personal o educativo.</p>
            <p>El usuario deberá revisar la licencia específica aplicable antes de utilizar cualquier recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.8 Derechos reservados</h3>
            <p>Todos los derechos que no sean expresamente concedidos mediante la licencia correspondiente permanecerán reservados a Prompt Studio o a los titulares de los derechos de propiedad intelectual.</p>
            <p>La descarga de un recurso gratuito no implica la cesión de la propiedad intelectual sobre dicho recurso.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 11. Contenido Premium
              </h2>
            </section>
            <p>Prompt Studio ofrece una selección de recursos digitales Premium destinados a usuarios que adquieran una licencia de uso mediante compra individual o a través de una suscripción activa.</p>
            <p>Los recursos Premium proporcionan acceso a contenido exclusivo, herramientas avanzadas y materiales desarrollados para mejorar la productividad en el uso de Inteligencia Artificial.</p>
            <p>La adquisición de un recurso Premium concede únicamente una licencia de uso, y no implica la transferencia de los derechos de propiedad intelectual sobre dicho recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.1 Recursos Premium disponibles</h3>
            <p>Los recursos Premium podrán incluir, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para aplicaciones.</li>
              <li>Colecciones exclusivas.</li>
              <li>Plantillas Premium.</li>
              <li>Componentes HTML.</li>
              <li>Recursos descargables.</li>
              <li>Demos avanzadas.</li>
              <li>Paquetes especializados.</li>
              <li>Actualizaciones exclusivas.</li>
            </ul>
            <p>Prompt Studio podrá ampliar, modificar o retirar el catálogo de recursos Premium en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.2 Acceso al contenido Premium</h3>
            <p>El acceso al contenido Premium estará disponible únicamente para usuarios que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hayan realizado la compra correspondiente.</li>
              <li>Mantengan una suscripción Premium activa.</li>
              <li>Hayan recibido acceso mediante una promoción autorizada.</li>
              <li>Dispongan de una licencia válida otorgada por Prompt Studio.</li>
            </ul>
            <p>El acceso será administrado automáticamente mediante la integración entre Clerk, Stripe y MongoDB Atlas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.3 Activación automática</h3>
            <p>Una vez confirmado el pago por Stripe, Prompt Studio activará automáticamente el acceso correspondiente.</p>
            <p>El usuario podrá visualizar el estado de sus compras desde su cuenta cuando dicha funcionalidad esté disponible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.4 Disponibilidad</h3>
            <p>Prompt Studio realiza esfuerzos razonables para mantener disponibles los recursos Premium.</p>
            <p>No obstante, determinados recursos podrán:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ser actualizados.</li>
              <li>Mejorarse.</li>
              <li>Corregirse.</li>
              <li>Reemplazarse.</li>
              <li>Retirarse cuando existan motivos técnicos, legales o comerciales.</li>
            </ul>
            <p>Cuando un recurso sea sustituido por una versión más reciente, Prompt Studio podrá ofrecer acceso a la nueva versión conforme a la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.5 Licencia de uso</h3>
            <p>La compra de un recurso Premium concede una licencia limitada que permite utilizar dicho recurso conforme a las condiciones específicas indicadas en su página.</p>
            <p>Salvo disposición expresa en contrario, la licencia será:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal.</li>
              <li>No exclusiva.</li>
              <li>No transferible.</li>
              <li>Revocable en caso de incumplimiento de estos Términos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.6 Restricciones</h3>
            <p>El usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender el recurso.</li>
              <li>Redistribuir el archivo original.</li>
              <li>Compartir enlaces privados de descarga.</li>
              <li>Publicar el contenido en repositorios públicos.</li>
              <li>Eliminar avisos de propiedad intelectual.</li>
              <li>Comercializar el recurso como propio.</li>
            </ul>
            <p>Estas restricciones no impiden el uso permitido por la licencia específica de cada producto.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.7 Actualizaciones</h3>
            <p>Cuando Prompt Studio publique mejoras o correcciones de un recurso Premium, podrá poner dichas actualizaciones a disposición de los usuarios que posean una licencia válida, siempre que así se indique en la descripción del producto.</p>
            <p>Prompt Studio no garantiza que todos los recursos Premium reciban actualizaciones futuras.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.8 Reserva de derechos</h3>
            <p>Todos los derechos no concedidos expresamente al usuario permanecerán reservados a Prompt Studio o a los respectivos titulares de los derechos de propiedad intelectual.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 12. Compra de Productos Digitales
              </h2>
            </section>
            <p>Prompt Studio permite la adquisición de productos digitales mediante compras individuales realizadas a través de proveedores de pago seguros.</p>
            <p>Cada compra concede únicamente una licencia de uso conforme a estos Términos y a las condiciones específicas del producto adquirido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.1 Productos disponibles</h3>
            <p>Los productos digitales podrán incluir, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Colecciones de prompts.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Componentes.</li>
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Recursos descargables.</li>
              <li>Archivos ZIP.</li>
              <li>Demos.</li>
              <li>Documentación.</li>
            </ul>
            <p>La disponibilidad de cada producto podrá variar con el tiempo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.2 Confirmación de la compra</h3>
            <p>Una compra se considerará completada únicamente cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El pago haya sido autorizado.</li>
              <li>Stripe confirme correctamente la transacción.</li>
              <li>Prompt Studio active el acceso correspondiente.</li>
            </ul>
            <p>Hasta ese momento, la operación podrá permanecer en estado pendiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.3 Descarga de recursos</h3>
            <p>Una vez confirmada la compra, el usuario podrá acceder a los recursos adquiridos mediante su cuenta.</p>
            <p>Prompt Studio podrá establecer límites razonables relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de descargas.</li>
              <li>Protección contra fraude.</li>
              <li>Disponibilidad técnica.</li>
              <li>Seguridad de la Plataforma.</li>
            </ul>
            <p>Estos límites tienen como finalidad proteger tanto a los usuarios como a los creadores de contenido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.4 Acceso posterior</h3>
            <p>Cuando la licencia del producto así lo permita, Prompt Studio procurará mantener disponible el historial de compras para que el usuario pueda volver a descargar los recursos adquiridos.</p>
            <p>No obstante, Prompt Studio no garantiza la disponibilidad permanente de todos los productos, especialmente cuando existan restricciones legales, contractuales o técnicas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.5 Exactitud del contenido</h3>
            <p>Prompt Studio realiza esfuerzos razonables para describir correctamente cada producto.</p>
            <p>Sin embargo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las imágenes ilustrativas pueden diferir del resultado final.</li>
              <li>Los resultados obtenidos mediante Inteligencia Artificial pueden variar.</li>
              <li>El funcionamiento de un prompt dependerá del modelo de IA utilizado por el usuario.</li>
              <li>La compatibilidad con plataformas de terceros puede cambiar con el tiempo.</li>
            </ul>
            <p>El usuario reconoce estas limitaciones antes de realizar una compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.6 Licencia concedida</h3>
            <p>La compra concede únicamente una licencia de uso conforme a la descripción del producto.</p>
            <p>Salvo que la licencia indique expresamente otra cosa, el usuario no adquiere la propiedad intelectual del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.7 Errores en precios</h3>
            <p>Prompt Studio procura mantener actualizados los precios publicados.</p>
            <p>No obstante, si debido a un error técnico un producto muestra un precio manifiestamente incorrecto, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancelar la compra.</li>
              <li>Reembolsar el importe pagado.</li>
              <li>Solicitar confirmación antes de completar la operación.</li>
            </ul>
            <p>Esta medida se aplicará únicamente cuando el error sea evidente y objetivo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.8 Derecho de rechazo</h3>
            <p>Prompt Studio podrá rechazar una compra cuando existan motivos razonables, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sospecha de fraude.</li>
              <li>Incumplimiento de estos Términos.</li>
              <li>Errores técnicos.</li>
              <li>Problemas con el método de pago.</li>
              <li>Restricciones legales.</li>
              <li>Actividad automatizada no autorizada.</li>
            </ul>
            <p>En estos casos, cuando corresponda, el usuario recibirá el reembolso conforme a las políticas aplicables.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 13. Suscripciones Premium
              </h2>
            </section>
            <p>Prompt Studio ofrece planes de suscripción Premium que permiten a los usuarios acceder a funciones exclusivas, recursos digitales adicionales y herramientas avanzadas relacionadas con Inteligencia Artificial.</p>
            <p>Las suscripciones constituyen un servicio de acceso periódico y estarán sujetas a los presentes Términos y Condiciones.</p>
            <p>La contratación de una suscripción implica la aceptación de las condiciones específicas del plan seleccionado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.1 Planes disponibles</h3>
            <p>Prompt Studio podrá ofrecer uno o varios planes de suscripción, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plan Mensual.</li>
              <li>Plan Anual.</li>
              <li>Plan Profesional.</li>
              <li>Plan Empresarial.</li>
              <li>Planes promocionales.</li>
              <li>Otros planes que puedan incorporarse en el futuro.</li>
            </ul>
            <p>Las características de cada plan estarán descritas en la Plataforma antes de la contratación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.2 Beneficios</h3>
            <p>Dependiendo del plan contratado, el usuario podrá acceder a beneficios como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts Premium.</li>
              <li>Colecciones exclusivas.</li>
              <li>Recursos HTML Premium.</li>
              <li>Descargas ampliadas.</li>
              <li>Herramientas avanzadas de IA.</li>
              <li>Acceso anticipado a nuevos productos.</li>
              <li>Descuentos exclusivos.</li>
              <li>Funciones experimentales.</li>
            </ul>
            <p>Los beneficios podrán modificarse con el tiempo para mejorar la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.3 Inicio de la suscripción</h3>
            <p>La suscripción comenzará una vez que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El pago haya sido aprobado por Stripe.</li>
              <li>Prompt Studio reciba la confirmación correspondiente.</li>
              <li>El acceso Premium sea activado automáticamente.</li>
            </ul>
            <p>El acceso podrá habilitarse de manera inmediata o dentro de un plazo razonable cuando existan procesos técnicos pendientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.4 Renovación automática</h3>
            <p>Salvo que se indique expresamente lo contrario, las suscripciones se renovarán automáticamente al finalizar cada período contratado utilizando el método de pago registrado.</p>
            <p>La renovación continuará hasta que el usuario la cancele conforme a estos Términos.</p>
            <p>Cuando la legislación aplicable lo requiera, Prompt Studio informará previamente sobre la existencia de la renovación automática.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.5 Cancelación</h3>
            <p>El usuario podrá cancelar la renovación automática en cualquier momento mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Portal del Cliente de Stripe.</li>
              <li>La configuración de su cuenta.</li>
              <li>Los mecanismos disponibles dentro de Prompt Studio.</li>
              <li>Contactando a:</li>
            </ul>
            <p>help@prompstudio.com</p>
            <p>La cancelación impedirá futuras renovaciones, pero no afectará el acceso correspondiente al período previamente pagado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.6 Cambios de plan</h3>
            <p>Cuando la Plataforma lo permita, el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actualizar su plan.</li>
              <li>Reducir su plan.</li>
              <li>Cambiar la periodicidad de pago.</li>
              <li>Reactivar una suscripción previamente cancelada.</li>
            </ul>
            <p>Los cambios podrán aplicarse inmediatamente o al finalizar el período vigente, según la configuración del plan correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.7 Suspensión de beneficios</h3>
            <p>Prompt Studio podrá suspender temporalmente el acceso a las funciones Premium cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exista un pago pendiente.</li>
              <li>El método de pago sea rechazado.</li>
              <li>Se detecte fraude.</li>
              <li>Se incumplan estos Términos.</li>
              <li>Existan requerimientos legales.</li>
            </ul>
            <p>Una vez regularizada la situación, el acceso podrá restablecerse cuando resulte procedente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.8 Finalización de la suscripción</h3>
            <p>Cuando una suscripción finalice:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario conservará su cuenta gratuita, si dicha modalidad continúa disponible.</li>
              <li>Se desactivará el acceso a las funciones Premium.</li>
              <li>Los recursos adquiridos mediante compras individuales seguirán disponibles conforme a la licencia correspondiente.</li>
              <li>La información relacionada con la cuenta permanecerá protegida conforme a la Política de Privacidad.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 14. Pagos mediante Stripe
              </h2>
            </section>
            <p>Prompt Studio utiliza Stripe como proveedor oficial para procesar pagos relacionados con compras individuales, suscripciones y demás operaciones económicas realizadas dentro de la Plataforma.</p>
            <p>Stripe actúa como proveedor independiente de servicios de pago y procesa la información financiera conforme a sus propios términos y políticas.</p>
            <p>Prompt Studio no almacena información completa de tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.1 Métodos de pago</h3>
            <p>Los métodos de pago disponibles dependerán de Stripe y de la ubicación del usuario.</p>
            <p>Podrán incluir, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tarjetas de crédito.</li>
              <li>Tarjetas de débito.</li>
              <li>Carteras digitales compatibles.</li>
              <li>Métodos de pago locales soportados por Stripe.</li>
            </ul>
            <p>La disponibilidad podrá variar según el país.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.2 Procesamiento de pagos</h3>
            <p>Todas las transacciones son procesadas directamente por Stripe.</p>
            <p>Prompt Studio únicamente recibe la información necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar el pago.</li>
              <li>Activar la compra.</li>
              <li>Gestionar la suscripción.</li>
              <li>Emitir comprobantes cuando corresponda.</li>
              <li>Resolver incidencias relacionadas con la transacción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.3 Seguridad</h3>
            <p>Stripe implementa medidas de seguridad destinadas a proteger la información financiera del usuario.</p>
            <p>Prompt Studio no tiene acceso a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número completo de tarjeta.</li>
              <li>Código CVV/CVC.</li>
              <li>PIN bancarios.</li>
              <li>Credenciales de acceso a instituciones financieras.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.4 Confirmación del pago</h3>
            <p>Una compra o suscripción únicamente se considerará confirmada cuando Stripe comunique a Prompt Studio que la transacción ha sido aprobada.</p>
            <p>Hasta ese momento, el acceso al contenido podrá permanecer bloqueado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.5 Pagos rechazados</h3>
            <p>Si una transacción es rechazada, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Solicitar un método de pago alternativo.</li>
              <li>Reintentar el cobro cuando corresponda.</li>
              <li>Suspender temporalmente la activación del servicio.</li>
              <li>Cancelar la operación si el pago no puede completarse.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.6 Facturación</h3>
            <p>Cuando corresponda, Stripe podrá generar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facturas.</li>
              <li>Recibos.</li>
              <li>Comprobantes de pago.</li>
              <li>Historial de transacciones.</li>
            </ul>
            <p>El usuario es responsable de proporcionar información de facturación correcta cuando resulte necesaria.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.7 Reembolsos</h3>
            <p>Los reembolsos estarán sujetos a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La Política de Reembolsos de Prompt Studio.</li>
              <li>La legislación aplicable.</li>
              <li>Las condiciones específicas del producto adquirido.</li>
            </ul>
            <p>Cuando un reembolso sea aprobado, Stripe procesará la devolución utilizando el método de pago correspondiente, salvo que exista una limitación legal o técnica.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.8 Fraude y verificación</h3>
            <p>Prompt Studio podrá rechazar o suspender transacciones cuando existan indicios razonables de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraude.</li>
              <li>Robo de identidad.</li>
              <li>Uso no autorizado del método de pago.</li>
              <li>Contracargos reiterados.</li>
              <li>Actividad automatizada.</li>
              <li>Manipulación del sistema de pagos.</li>
            </ul>
            <p>Estas medidas buscan proteger tanto a los usuarios como a la Plataforma y podrán incluir verificaciones adicionales antes de aprobar determinadas operaciones.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 15. Facturación e Impuestos
              </h2>
            </section>
            <p>Prompt Studio utiliza proveedores especializados para procesar pagos y generar la documentación relacionada con las transacciones realizadas dentro de la Plataforma.</p>
            <p>Los precios mostrados en Prompt Studio podrán incluir o excluir impuestos, dependiendo de la legislación aplicable y del país de residencia del usuario.</p>
            <p>Es responsabilidad del usuario revisar cuidadosamente el importe total antes de confirmar una compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.1 Moneda</h3>
            <p>Los precios de los productos y suscripciones podrán mostrarse en una o varias monedas, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dólares estadounidenses (USD).</li>
              <li>Euros (EUR).</li>
              <li>Pesos mexicanos (MXN).</li>
              <li>Otras monedas soportadas por Stripe.</li>
            </ul>
            <p>La moneda aplicable dependerá de la configuración de la Plataforma y de la ubicación del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.2 Impuestos</h3>
            <p>Cuando la legislación aplicable lo requiera, Prompt Studio podrá calcular y recaudar los impuestos correspondientes, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Impuesto al Valor Agregado (IVA).</li>
              <li>Impuesto sobre Bienes y Servicios (GST).</li>
              <li>Impuesto sobre Ventas (Sales Tax).</li>
              <li>Otros impuestos indirectos exigidos por la legislación correspondiente.</li>
            </ul>
            <p>El importe de los impuestos podrá mostrarse antes de finalizar la compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.3 Información de facturación</h3>
            <p>El usuario es responsable de proporcionar información de facturación correcta y actualizada, incluyendo cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre o razón social.</li>
              <li>Dirección fiscal.</li>
              <li>País.</li>
              <li>Código postal.</li>
              <li>Número de identificación fiscal, cuando sea aplicable.</li>
            </ul>
            <p>Prompt Studio no será responsable por errores derivados de información incorrecta proporcionada por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.4 Facturas y comprobantes</h3>
            <p>Cuando corresponda, el usuario podrá recibir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facturas.</li>
              <li>Recibos.</li>
              <li>Confirmaciones de pago.</li>
              <li>Comprobantes electrónicos.</li>
            </ul>
            <p>Estos documentos podrán ser emitidos directamente por Stripe o por Prompt Studio, según el tipo de operación y la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.5 Errores de facturación</h3>
            <p>Si el usuario detecta un error en una factura o comprobante, deberá comunicarlo a Prompt Studio lo antes posible mediante:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio realizará las verificaciones necesarias y, cuando corresponda, emitirá la documentación corregida conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.6 Obligaciones fiscales del usuario</h3>
            <p>El usuario será responsable de cumplir con las obligaciones fiscales derivadas del uso comercial de los recursos adquiridos, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Declaración de ingresos.</li>
              <li>Pago de impuestos.</li>
              <li>Cumplimiento de obligaciones tributarias.</li>
              <li>Conservación de documentación fiscal.</li>
            </ul>
            <p>Prompt Studio no proporciona asesoría fiscal, contable ni jurídica.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.7 Cambios de precios</h3>
            <p>Prompt Studio podrá modificar los precios de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Productos digitales.</li>
              <li>Suscripciones.</li>
              <li>Servicios Premium.</li>
              <li>Nuevas funcionalidades.</li>
            </ul>
            <p>Los cambios no afectarán las compras ya completadas.</p>
            <p>En el caso de suscripciones con renovación automática, cualquier modificación del precio será comunicada previamente cuando la legislación aplicable así lo exija.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.8 Errores de precio</h3>
            <p>Aunque Prompt Studio procura mantener información precisa, podrán producirse errores involuntarios en los precios publicados.</p>
            <p>Si un producto aparece con un precio manifiestamente incorrecto debido a un error técnico o humano, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancelar la operación.</li>
              <li>Notificar al usuario.</li>
              <li>Reembolsar el importe pagado.</li>
              <li>Solicitar la confirmación antes de completar la compra.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 16. Reembolsos y Cancelaciones
              </h2>
            </section>
            <p>Prompt Studio comercializa principalmente productos digitales, cuyo acceso puede concederse de forma inmediata tras la confirmación del pago.</p>
            <p>Por esta razón, los reembolsos estarán sujetos a las condiciones establecidas en esta sección, en la Política de Reembolsos y en la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.1 Naturaleza de los productos digitales</h3>
            <p>Los productos vendidos por Prompt Studio consisten principalmente en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Recursos HTML.</li>
              <li>Plantillas.</li>
              <li>Componentes.</li>
              <li>Archivos digitales.</li>
              <li>Recursos Premium.</li>
              <li>Descargas electrónicas.</li>
            </ul>
            <p>Una vez habilitado el acceso al recurso, el usuario reconoce que el producto ha comenzado a ejecutarse digitalmente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.2 Regla general</h3>
            <p>Salvo disposición legal en contrario, las compras de productos digitales son finales y no reembolsables una vez que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El pago haya sido confirmado.</li>
              <li>El acceso al contenido haya sido habilitado.</li>
              <li>El recurso pueda descargarse o utilizarse.</li>
            </ul>
            <p>Esta limitación existe debido a la naturaleza digital e inmediatamente accesible de los productos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.3 Excepciones</h3>
            <p>Prompt Studio podrá conceder un reembolso cuando, entre otros supuestos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El producto no pueda descargarse debido a un error atribuible exclusivamente a Prompt Studio.</li>
              <li>Se produzca un cobro duplicado.</li>
              <li>Exista un error técnico grave que impida utilizar el recurso adquirido.</li>
              <li>La legislación aplicable reconozca expresamente el derecho al reembolso.</li>
              <li>Prompt Studio decida concederlo de forma excepcional.</li>
            </ul>
            <p>Cada solicitud será evaluada individualmente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.4 Solicitud de reembolso</h3>
            <p>Las solicitudes deberán enviarse a:</p>
            <p>help@prompstudio.com</p>
            <p>La solicitud deberá incluir, cuando sea posible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre del comprador.</li>
              <li>Correo electrónico de la cuenta.</li>
              <li>Número o identificador de la compra.</li>
              <li>Descripción del problema.</li>
              <li>Evidencia que permita analizar la situación.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.5 Tiempo de respuesta</h3>
            <p>Prompt Studio procurará responder las solicitudes de reembolso dentro de un plazo razonable.</p>
            <p>Cuando un reembolso sea aprobado, Stripe procesará la devolución utilizando el método de pago correspondiente.</p>
            <p>El tiempo de acreditación dependerá del banco o institución financiera del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.6 Cancelación de suscripciones</h3>
            <p>El usuario podrá cancelar una suscripción Premium en cualquier momento.</p>
            <p>La cancelación:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Evitará futuras renovaciones automáticas.</li>
              <li>No implicará el reembolso del período ya pagado, salvo que la legislación aplicable disponga lo contrario.</li>
              <li>Permitirá conservar el acceso Premium hasta el final del período contratado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.7 Compras fraudulentas</h3>
            <p>Prompt Studio podrá cancelar pedidos o reembolsar automáticamente una operación cuando existan indicios razonables de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Robo de tarjetas.</li>
              <li>Suplantación de identidad.</li>
              <li>Uso fraudulento del método de pago.</li>
              <li>Actividad automatizada.</li>
              <li>Manipulación del sistema de pagos.</li>
            </ul>
            <p>Asimismo, podrá suspender la cuenta correspondiente mientras se realiza la investigación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.8 Política complementaria</h3>
            <p>La presente sección deberá interpretarse conjuntamente con la Política de Reembolsos publicada por Prompt Studio.</p>
            <p>En caso de conflicto, prevalecerá la disposición que otorgue mayor protección al consumidor cuando así lo exija la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 17. Licencias de Uso de los Prompts
              </h2>
            </section>
            <p>Prompt Studio comercializa prompts desarrollados para facilitar la interacción con modelos de Inteligencia Artificial.</p>
            <p>Los prompts constituyen obras protegidas por las leyes de propiedad intelectual cuando cumplen los requisitos legales correspondientes.</p>
            <p>La adquisición de un prompt concede únicamente una licencia de uso, sin transferir la propiedad intelectual del mismo, salvo que se indique expresamente lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.1 Naturaleza de la licencia</h3>
            <p>Salvo que un producto indique expresamente otra modalidad, Prompt Studio concede al usuario una licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal.</li>
              <li>Limitada.</li>
              <li>No exclusiva.</li>
              <li>No sublicenciable.</li>
              <li>No transferible.</li>
              <li>Revocable en caso de incumplimiento de estos Términos.</li>
            </ul>
            <p>La licencia únicamente autoriza los usos expresamente permitidos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.2 Uso permitido</h3>
            <p>El usuario podrá utilizar los prompts adquiridos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generar imágenes mediante herramientas de IA.</li>
              <li>Generar videos mediante herramientas de IA.</li>
              <li>Crear páginas web.</li>
              <li>Crear aplicaciones.</li>
              <li>Desarrollar proyectos personales.</li>
              <li>Desarrollar proyectos comerciales cuando la licencia correspondiente lo permita.</li>
              <li>Modificar los prompts para adaptarlos a sus necesidades.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.3 Uso comercial</h3>
            <p>Cuando un prompt indique que incluye Licencia Comercial, el usuario podrá utilizar los resultados obtenidos mediante dicho prompt en proyectos comerciales.</p>
            <p>No obstante, ello no autoriza la reventa, redistribución o comercialización del prompt original, salvo autorización expresa y por escrito de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.4 Prohibiciones</h3>
            <p>Salvo autorización expresa, el usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender prompts adquiridos.</li>
              <li>Compartir los archivos originales.</li>
              <li>Publicar colecciones completas de prompts.</li>
              <li>Distribuir los prompts en repositorios públicos.</li>
              <li>Ofrecer los prompts como contenido descargable.</li>
              <li>Comercializar el prompt como propio.</li>
              <li>Eliminar avisos de propiedad intelectual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.5 Modificaciones</h3>
            <p>El usuario podrá modificar un prompt para adaptarlo a sus necesidades internas.</p>
            <p>Sin embargo, una modificación del prompt no convierte al usuario en titular de la propiedad intelectual del prompt original.</p>
            <p>Las versiones derivadas continúan sujetas a las limitaciones establecidas por la licencia correspondiente, salvo que la legislación aplicable disponga otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.6 Resultados generados</h3>
            <p>Los resultados obtenidos mediante un prompt dependerán de factores como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El modelo de Inteligencia Artificial utilizado.</li>
              <li>La versión del modelo.</li>
              <li>Los parámetros configurados.</li>
              <li>El contexto proporcionado por el usuario.</li>
              <li>La evolución tecnológica de los sistemas de IA.</li>
            </ul>
            <p>Por ello, Prompt Studio no garantiza resultados idénticos ni uniformes entre diferentes usuarios o plataformas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.7 Actualizaciones</h3>
            <p>Cuando Prompt Studio publique mejoras o nuevas versiones de un prompt, podrá ponerlas a disposición de los usuarios conforme a las condiciones indicadas para dicho producto.</p>
            <p>La disponibilidad de actualizaciones dependerá del tipo de licencia adquirida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.8 Reserva de derechos</h3>
            <p>Todos los derechos no concedidos expresamente permanecerán reservados a Prompt Studio o a los titulares correspondientes.</p>
            <p>Nada de lo establecido en estos Términos implica una cesión total de derechos de propiedad intelectual sobre los prompts comercializados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 18. Licencias de Imágenes, Videos y Recursos HTML
              </h2>
            </section>
            <p>Además de prompts, Prompt Studio ofrece otros recursos digitales destinados a facilitar el desarrollo de proyectos relacionados con Inteligencia Artificial y desarrollo web.</p>
            <p>Cada recurso estará sujeto a la licencia indicada en su página correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.1 Recursos incluidos</h3>
            <p>Las licencias reguladas por esta sección podrán aplicarse, entre otros, a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Recursos HTML.</li>
              <li>Componentes.</li>
              <li>Plantillas.</li>
              <li>Archivos CSS.</li>
              <li>Archivos JavaScript.</li>
              <li>Recursos descargables.</li>
              <li>Demos.</li>
              <li>Ejemplos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.2 Licencia de uso</h3>
            <p>Salvo indicación expresa en contrario, Prompt Studio concede una licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal.</li>
              <li>No exclusiva.</li>
              <li>No transferible.</li>
              <li>Revocable.</li>
              <li>Limitada al uso autorizado.</li>
            </ul>
            <p>La licencia permite utilizar el recurso conforme a las condiciones específicas del producto.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.3 Uso comercial</h3>
            <p>Cuando un recurso indique expresamente que permite uso comercial, el usuario podrá incorporarlo en proyectos destinados a clientes o actividades comerciales.</p>
            <p>Ello no autoriza:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender el recurso original.</li>
              <li>Redistribuir el archivo fuente.</li>
              <li>Comercializar el recurso como producto independiente.</li>
              <li>Publicarlo en bibliotecas públicas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.4 Modificaciones</h3>
            <p>El usuario podrá modificar los recursos para adaptarlos a sus proyectos.</p>
            <p>Las modificaciones realizadas por el usuario no eliminan los derechos de propiedad intelectual existentes sobre el recurso original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.5 Proyectos derivados</h3>
            <p>El usuario podrá integrar los recursos licenciados en proyectos finales tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitios web.</li>
              <li>Aplicaciones.</li>
              <li>Plataformas.</li>
              <li>Productos digitales.</li>
              <li>Material publicitario.</li>
              <li>Presentaciones.</li>
              <li>Sistemas internos.</li>
            </ul>
            <p>Siempre que dicho uso esté permitido por la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.6 Restricciones</h3>
            <p>Queda prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender los archivos originales.</li>
              <li>Compartir enlaces privados de descarga.</li>
              <li>Publicar recursos Premium gratuitamente.</li>
              <li>Distribuir los recursos en marketplaces competidores.</li>
              <li>Utilizar los recursos para crear bibliotecas equivalentes a Prompt Studio.</li>
              <li>Eliminar marcas de agua o avisos de propiedad intelectual cuando existan.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.7 Compatibilidad</h3>
            <p>Prompt Studio procura ofrecer recursos compatibles con las tecnologías descritas en cada producto.</p>
            <p>Sin embargo, no garantiza compatibilidad permanente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Versiones futuras de software.</li>
              <li>Herramientas de terceros.</li>
              <li>Frameworks externos.</li>
              <li>Navegadores específicos.</li>
              <li>Modelos de IA determinados.</li>
            </ul>
            <p>La evolución tecnológica puede afectar el funcionamiento de algunos recursos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.8 Derechos reservados</h3>
            <p>Todos los derechos que no hayan sido expresamente concedidos mediante la licencia correspondiente permanecerán reservados a Prompt Studio o a los respectivos titulares de los derechos.</p>
            <p>El usuario reconoce que la adquisición de un recurso digital no implica la transferencia de la propiedad intelectual sobre dicho recurso.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 19. Restricciones de Uso
              </h2>
            </section>
            <p>Prompt Studio concede al usuario una licencia limitada para utilizar la Plataforma y los recursos digitales disponibles conforme a estos Términos y Condiciones.</p>
            <p>El usuario acepta utilizar la Plataforma de manera responsable, ética y conforme a la legislación aplicable.</p>
            <p>Cualquier uso no autorizado podrá dar lugar a la suspensión inmediata de la cuenta, la revocación de las licencias concedidas y, cuando corresponda, al inicio de acciones legales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.1 Uso permitido</h3>
            <p>El usuario podrá utilizar Prompt Studio exclusivamente para los fines autorizados por estos Términos y por la licencia específica de cada recurso.</p>
            <p>Entre otros, podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargar recursos autorizados.</li>
              <li>Utilizar prompts.</li>
              <li>Crear contenido mediante IA.</li>
              <li>Desarrollar proyectos personales.</li>
              <li>Desarrollar proyectos comerciales cuando la licencia lo permita.</li>
              <li>Administrar sus compras.</li>
              <li>Gestionar sus suscripciones.</li>
              <li>Acceder a las funciones contratadas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.2 Prohibición de copia masiva</h3>
            <p>Queda estrictamente prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Copiar el catálogo completo de Prompt Studio.</li>
              <li>Replicar la estructura de la Plataforma.</li>
              <li>Descargar masivamente los recursos.</li>
              <li>Crear bases de datos utilizando el contenido de Prompt Studio.</li>
              <li>Extraer automáticamente metadatos.</li>
              <li>Reproducir sistemáticamente el contenido del sitio.</li>
            </ul>
            <p>Estas actividades constituyen una infracción de los derechos de propiedad intelectual y podrán dar lugar a acciones legales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.3 Uso automatizado</h3>
            <p>Salvo autorización expresa y por escrito de Prompt Studio, el usuario no podrá utilizar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bots.</li>
              <li>Crawlers.</li>
              <li>Scrapers.</li>
              <li>Scripts automatizados.</li>
              <li>Herramientas de minería de datos.</li>
              <li>Sistemas de extracción masiva.</li>
              <li>Agentes automatizados destinados a copiar contenido.</li>
              <li>Sistemas de IA para reconstruir el catálogo de Prompt Studio.</li>
            </ul>
            <p>El uso automatizado no autorizado podrá provocar el bloqueo inmediato de la cuenta y de la dirección IP correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.4 Uso indebido de recursos Premium</h3>
            <p>Los recursos Premium únicamente podrán utilizarse conforme a la licencia adquirida.</p>
            <p>Está prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compartir archivos Premium con terceros.</li>
              <li>Publicar enlaces privados de descarga.</li>
              <li>Revender recursos Premium.</li>
              <li>Distribuir recursos en redes sociales.</li>
              <li>Compartir colecciones completas.</li>
              <li>Comercializar recursos sin autorización.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.5 Interferencia con la Plataforma</h3>
            <p>El usuario no podrá realizar acciones destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Interrumpir el funcionamiento del sitio.</li>
              <li>Saturar la infraestructura.</li>
              <li>Alterar el rendimiento.</li>
              <li>Manipular estadísticas.</li>
              <li>Intentar vulnerar medidas de seguridad.</li>
              <li>Obtener acceso no autorizado a servidores.</li>
            </ul>
            <p>Prompt Studio podrá adoptar medidas técnicas para impedir estas conductas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.6 Ingeniería inversa</h3>
            <p>Salvo que la legislación aplicable lo permita expresamente, queda prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descompilar.</li>
              <li>Desensamblar.</li>
              <li>Analizar el código fuente.</li>
              <li>Descubrir algoritmos internos.</li>
              <li>Extraer modelos de funcionamiento.</li>
              <li>Intentar reconstruir los servicios internos de Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.7 Derechos de terceros</h3>
            <p>El usuario se compromete a respetar los derechos de terceros, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Derechos de autor.</li>
              <li>Marcas registradas.</li>
              <li>Patentes.</li>
              <li>Diseños industriales.</li>
              <li>Derechos de imagen.</li>
              <li>Derechos sobre bases de datos.</li>
              <li>Secretos comerciales.</li>
            </ul>
            <p>El usuario será el único responsable por cualquier infracción derivada del uso que haga de los recursos adquiridos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.8 Medidas frente al incumplimiento</h3>
            <p>Cuando Prompt Studio detecte un incumplimiento de estas restricciones, podrá adoptar una o varias de las siguientes medidas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Advertencia.</li>
              <li>Suspensión temporal.</li>
              <li>Revocación de licencias.</li>
              <li>Cancelación de la cuenta.</li>
              <li>Bloqueo permanente.</li>
              <li>Retención de pagos relacionados con fraude.</li>
              <li>Inicio de procedimientos judiciales.</li>
              <li>Comunicación a las autoridades competentes cuando resulte necesario.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 20. Herramientas de Inteligencia Artificial (Google Gemini / Genkit)
              </h2>
            </section>
            <p>Prompt Studio integra herramientas de Inteligencia Artificial utilizando tecnologías como Google Gemini y Google Genkit para ayudar a los usuarios a crear, optimizar y mejorar prompts y otros contenidos.</p>
            <p>Estas herramientas tienen como finalidad asistir al usuario y no sustituyen el criterio humano ni constituyen asesoría profesional.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.1 Finalidad</h3>
            <p>Las herramientas de IA disponibles en Prompt Studio permiten, entre otras funciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generar prompts.</li>
              <li>Optimizar prompts existentes.</li>
              <li>Crear estructuras para imágenes.</li>
              <li>Crear estructuras para video.</li>
              <li>Crear estructuras para páginas web.</li>
              <li>Crear estructuras para aplicaciones.</li>
              <li>Generar ideas creativas.</li>
              <li>Asistir en tareas relacionadas con Inteligencia Artificial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.2 Naturaleza del servicio</h3>
            <p>Las respuestas generadas por los modelos de IA son el resultado de procesos automatizados y probabilísticos.</p>
            <p>En consecuencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los resultados pueden variar.</li>
              <li>Distintos usuarios pueden obtener respuestas similares.</li>
              <li>No existe garantía de exclusividad.</li>
              <li>Los resultados pueden contener errores o imprecisiones.</li>
            </ul>
            <p>El usuario deberá revisar cuidadosamente cualquier contenido generado antes de utilizarlo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.3 Responsabilidad del usuario</h3>
            <p>El usuario es el único responsable de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revisar los resultados obtenidos.</li>
              <li>Verificar la exactitud del contenido.</li>
              <li>Confirmar el cumplimiento de la legislación aplicable.</li>
              <li>Asegurar que el contenido generado no infrinja derechos de terceros.</li>
            </ul>
            <p>Prompt Studio no garantiza que el contenido generado sea adecuado para un propósito específico.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.4 Información enviada a la IA</h3>
            <p>Cuando el usuario utilice las herramientas de IA, podrá enviar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Texto.</li>
              <li>Instrucciones.</li>
              <li>Prompts.</li>
              <li>Parámetros.</li>
              <li>Preferencias.</li>
              <li>Contexto adicional.</li>
            </ul>
            <p>Esta información será procesada únicamente con la finalidad de generar la respuesta solicitada y conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.5 Prohibiciones</h3>
            <p>El usuario no podrá utilizar las herramientas de IA para generar contenido que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sea ilegal.</li>
              <li>Promueva actividades delictivas.</li>
              <li>Vulnere derechos de autor.</li>
              <li>Suplante identidades.</li>
              <li>Difame a terceros.</li>
              <li>Contenga malware.</li>
              <li>Facilite ataques informáticos.</li>
              <li>Promueva violencia o discriminación.</li>
              <li>Infrinja la legislación aplicable.</li>
            </ul>
            <p>Prompt Studio podrá limitar o suspender el acceso a estas herramientas cuando detecte un uso contrario a estos Términos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.6 Disponibilidad</h3>
            <p>Prompt Studio realiza esfuerzos razonables para mantener disponibles las herramientas de IA.</p>
            <p>Sin embargo, su funcionamiento podrá verse afectado por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento.</li>
              <li>Cambios en los proveedores.</li>
              <li>Limitaciones técnicas.</li>
              <li>Interrupciones de servicios externos.</li>
              <li>Actualizaciones de modelos.</li>
              <li>Circunstancias de fuerza mayor.</li>
            </ul>
            <p>Prompt Studio no garantiza la disponibilidad continua de estos servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.7 Evolución tecnológica</h3>
            <p>Los modelos de Inteligencia Artificial evolucionan constantemente.</p>
            <p>Por ello:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Un mismo prompt puede producir resultados diferentes con el paso del tiempo.</li>
              <li>Las funcionalidades disponibles pueden modificarse.</li>
              <li>Determinados modelos podrán ser sustituidos por versiones más recientes o por otros proveedores.</li>
            </ul>
            <p>Prompt Studio podrá realizar estas modificaciones para mejorar la calidad y seguridad del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.8 Limitación de responsabilidad</h3>
            <p>Prompt Studio no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Decisiones tomadas por el usuario basadas en contenido generado por IA.</li>
              <li>Pérdidas derivadas del uso de los resultados obtenidos.</li>
              <li>Errores propios de los modelos de Inteligencia Artificial.</li>
              <li>Cambios realizados por proveedores externos.</li>
              <li>Resultados inesperados o incompatibles con las expectativas del usuario.</li>
            </ul>
            <p>Las herramientas de IA constituyen un servicio de asistencia y no reemplazan la revisión humana.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 21. Propiedad Intelectual
              </h2>
            </section>
            <p>Todos los derechos de propiedad intelectual relacionados con Prompt Studio, incluyendo su diseño, estructura, software, documentación, recursos digitales, contenido editorial, interfaces y demás elementos protegidos, pertenecen a Magzin LLC o a sus respectivos titulares y se encuentran protegidos por la legislación nacional e internacional sobre propiedad intelectual.</p>
            <p>El uso de la Plataforma no implica la transferencia de ningún derecho de propiedad intelectual al usuario, salvo la licencia limitada expresamente concedida conforme a estos Términos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.1 Titularidad de la Plataforma</h3>
            <p>Son propiedad de Prompt Studio o de sus licenciantes, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El nombre “Prompt Studio”.</li>
              <li>Logotipos.</li>
              <li>Marcas.</li>
              <li>Identidad visual.</li>
              <li>Diseño gráfico.</li>
              <li>Código fuente propio.</li>
              <li>Arquitectura del sitio.</li>
              <li>Interfaces de usuario.</li>
              <li>Bases de datos protegidas.</li>
              <li>Documentación.</li>
              <li>Material educativo.</li>
              <li>Organización del contenido.</li>
            </ul>
            <p>Todos estos elementos se encuentran protegidos por las leyes aplicables sobre propiedad intelectual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.2 Recursos digitales</h3>
            <p>Los recursos disponibles en Prompt Studio pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Colecciones de prompts.</li>
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Recursos HTML.</li>
              <li>Componentes.</li>
              <li>Plantillas.</li>
              <li>Archivos descargables.</li>
              <li>Demos.</li>
              <li>Documentación.</li>
              <li>Contenido educativo.</li>
            </ul>
            <p>Cada recurso mantiene la protección correspondiente conforme a su licencia y a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.3 Marcas registradas</h3>
            <p>Las marcas, nombres comerciales, logotipos y signos distintivos utilizados en Prompt Studio pertenecen a Magzin LLC o a sus respectivos titulares.</p>
            <p>Nada de lo dispuesto en estos Términos concede al usuario autorización para utilizar dichas marcas sin consentimiento previo y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.4 Derechos reservados</h3>
            <p>Todos los derechos que no hayan sido expresamente concedidos al usuario permanecen reservados.</p>
            <p>La adquisición de un producto digital no implica la venta de la propiedad intelectual, sino únicamente una licencia limitada de uso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.5 Protección del contenido</h3>
            <p>El usuario reconoce que Prompt Studio realiza inversiones significativas en el desarrollo de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recursos digitales.</li>
              <li>Bases de datos.</li>
              <li>Herramientas de IA.</li>
              <li>Interfaces.</li>
              <li>Documentación.</li>
              <li>Contenido Premium.</li>
            </ul>
            <p>En consecuencia, queda prohibida cualquier reproducción sistemática destinada a crear un servicio competidor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.6 Infracciones</h3>
            <p>Cuando Prompt Studio tenga conocimiento de una posible infracción de sus derechos de propiedad intelectual, podrá adoptar las medidas que considere necesarias, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminación del acceso al contenido.</li>
              <li>Suspensión de cuentas.</li>
              <li>Revocación de licencias.</li>
              <li>Requerimientos extrajudiciales.</li>
              <li>Inicio de acciones judiciales.</li>
              <li>Solicitudes de retirada de contenido (“takedown notices”).</li>
              <li>Colaboración con autoridades competentes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.7 Derechos de terceros</h3>
            <p>Determinados recursos podrán contener materiales cuyos derechos pertenezcan a terceros.</p>
            <p>En dichos casos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los derechos continuarán perteneciendo a sus respectivos titulares.</li>
              <li>El usuario deberá respetar las licencias correspondientes.</li>
              <li>Prompt Studio procurará identificar adecuadamente la autoría cuando resulte aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.8 Solicitudes relacionadas con propiedad intelectual</h3>
            <p>Las consultas o reclamaciones relacionadas con derechos de autor, marcas o propiedad intelectual podrán enviarse a:</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio analizará cada solicitud conforme a la legislación aplicable y podrá solicitar información adicional para verificar la titularidad de los derechos invocados.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 22. Contenido Generado por los Usuarios
              </h2>
            </section>
            <p>Prompt Studio permite que los usuarios introduzcan información, instrucciones, prompts y otros contenidos para utilizar determinadas funcionalidades de la Plataforma.</p>
            <p>El usuario conserva los derechos que legalmente le correspondan sobre el contenido que cree o cargue, sin perjuicio de las licencias limitadas necesarias para la prestación del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.1 Contenido del usuario</h3>
            <p>Se considera contenido generado por el usuario, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts personalizados.</li>
              <li>Instrucciones.</li>
              <li>Comentarios.</li>
              <li>Valoraciones.</li>
              <li>Opiniones.</li>
              <li>Archivos cargados.</li>
              <li>Configuraciones personalizadas.</li>
              <li>Información introducida durante el uso de herramientas de IA.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.2 Titularidad</h3>
            <p>El usuario conserva la propiedad intelectual del contenido que genere o aporte, en la medida reconocida por la legislación aplicable.</p>
            <p>Prompt Studio no reclama automáticamente la propiedad del contenido creado por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.3 Licencia otorgada a Prompt Studio</h3>
            <p>Con el único propósito de prestar los servicios contratados, el usuario concede a Prompt Studio una licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Limitada.</li>
              <li>No exclusiva.</li>
              <li>Mundial.</li>
              <li>Libre de regalías.</li>
              <li>Revocable cuando resulte compatible con la naturaleza del servicio.</li>
            </ul>
            <p>Esta licencia permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Almacenar el contenido.</li>
              <li>Procesarlo.</li>
              <li>Mostrarlo al propio usuario.</li>
              <li>Sincronizarlo entre dispositivos.</li>
              <li>Generar respuestas mediante Inteligencia Artificial.</li>
              <li>Realizar copias de seguridad.</li>
              <li>Mantener la continuidad operativa de la Plataforma.</li>
            </ul>
            <p>Prompt Studio no utilizará el contenido del usuario para fines distintos de la prestación del servicio, salvo que el usuario otorgue un consentimiento adicional o exista una obligación legal.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.4 Declaraciones del usuario</h3>
            <p>El usuario declara y garantiza que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Es titular del contenido que incorpora.</li>
              <li>O cuenta con las autorizaciones necesarias para utilizarlo.</li>
              <li>Su contenido no infringe derechos de terceros.</li>
              <li>El contenido cumple con la legislación aplicable.</li>
              <li>La información proporcionada es lícita.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.5 Contenido prohibido</h3>
            <p>El usuario no podrá publicar, generar o cargar contenido que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Infrinja derechos de autor.</li>
              <li>Vulnere marcas registradas.</li>
              <li>Contenga software malicioso.</li>
              <li>Promueva actividades ilícitas.</li>
              <li>Contenga material difamatorio.</li>
              <li>Incluya información obtenida ilegalmente.</li>
              <li>Vulnere derechos fundamentales de terceros.</li>
              <li>Contenga material discriminatorio, violento o ilegal.</li>
            </ul>
            <p>Prompt Studio podrá eliminar dicho contenido sin previo aviso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.6 Moderación</h3>
            <p>Prompt Studio se reserva el derecho, pero no la obligación, de revisar, limitar o eliminar contenido generado por los usuarios cuando existan motivos razonables para considerar que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incumple estos Términos.</li>
              <li>Vulnera derechos de terceros.</li>
              <li>Compromete la seguridad de la Plataforma.</li>
              <li>Puede generar responsabilidad legal para Prompt Studio.</li>
            </ul>
            <p>La ausencia de revisión previa no implica aprobación del contenido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.7 Eliminación del contenido</h3>
            <p>El usuario podrá eliminar determinado contenido desde las funcionalidades disponibles en la Plataforma.</p>
            <p>No obstante, Prompt Studio podrá conservar copias cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Detectar fraude.</li>
              <li>Mantener copias de seguridad.</li>
              <li>Cumplir la Política de Privacidad.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.8 Responsabilidad del usuario</h3>
            <p>El usuario será el único responsable del contenido que publique, cargue o genere mediante Prompt Studio.</p>
            <p>Prompt Studio no asume responsabilidad por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La veracidad del contenido del usuario.</li>
              <li>Su legalidad.</li>
              <li>Su exactitud.</li>
              <li>Las consecuencias derivadas de su utilización por terceros.</li>
            </ul>
            <p>El usuario mantendrá indemne a Prompt Studio frente a reclamaciones derivadas del contenido que aporte o genere.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 23. Programa de Afiliados
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer un Programa de Afiliados que permita a determinados usuarios obtener comisiones por recomendar productos, suscripciones o servicios disponibles en la Plataforma.</p>
            <p>La participación en este programa es opcional y estará sujeta a estos Términos, así como a las condiciones particulares que Prompt Studio publique para el Programa de Afiliados.</p>
            <p>La participación en el Programa no crea una relación laboral, societaria, de representación, franquicia o agencia entre el afiliado y Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.1 Elegibilidad</h3>
            <p>Podrán participar en el Programa de Afiliados los usuarios que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posean una cuenta válida en Prompt Studio.</li>
              <li>Cumplan estos Términos y Condiciones.</li>
              <li>No hayan sido suspendidos previamente por fraude o incumplimientos.</li>
              <li>Cumplan los requisitos adicionales publicados por Prompt Studio.</li>
            </ul>
            <p>Prompt Studio podrá aprobar o rechazar cualquier solicitud de participación a su exclusiva discreción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.2 Enlaces de afiliado</h3>
            <p>Cuando un usuario sea aceptado en el Programa, Prompt Studio podrá asignarle:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Un enlace personalizado.</li>
              <li>Un código de referencia.</li>
              <li>Un identificador único.</li>
              <li>Herramientas promocionales.</li>
            </ul>
            <p>Estos elementos servirán para identificar correctamente las conversiones atribuibles al afiliado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.3 Comisiones</h3>
            <p>Las comisiones, cuando existan, dependerán de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El producto adquirido.</li>
              <li>El tipo de suscripción.</li>
              <li>Las campañas promocionales.</li>
              <li>Las condiciones publicadas en cada momento.</li>
            </ul>
            <p>Prompt Studio podrá modificar las tasas de comisión notificándolo previamente a los afiliados cuando resulte necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.4 Conversión válida</h3>
            <p>Una comisión únicamente será considerada válida cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El pago haya sido confirmado.</li>
              <li>No exista fraude.</li>
              <li>No se produzca un reembolso.</li>
              <li>La compra cumpla las condiciones del Programa.</li>
              <li>La conversión pueda atribuirse correctamente al enlace del afiliado.</li>
            </ul>
            <p>Prompt Studio podrá rechazar conversiones fraudulentas o inválidas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.5 Conductas prohibidas</h3>
            <p>Queda prohibido, entre otras conductas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Auto-referirse para generar comisiones.</li>
              <li>Utilizar publicidad engañosa.</li>
              <li>Crear cuentas falsas.</li>
              <li>Utilizar bots.</li>
              <li>Generar clics artificiales.</li>
              <li>Utilizar malware.</li>
              <li>Comprar tráfico fraudulento.</li>
              <li>Suplantar a Prompt Studio.</li>
              <li>Utilizar marcas registradas sin autorización.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.6 Suspensión del Programa</h3>
            <p>Prompt Studio podrá suspender o cancelar la participación de un afiliado cuando detecte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraude.</li>
              <li>Incumplimiento de estos Términos.</li>
              <li>Manipulación del sistema.</li>
              <li>Actividad sospechosa.</li>
              <li>Incumplimiento de la legislación aplicable.</li>
            </ul>
            <p>La cancelación podrá implicar la pérdida de comisiones pendientes cuando exista fraude comprobado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.7 Pagos</h3>
            <p>Cuando el Programa contemple el pago de comisiones, éstas podrán realizarse utilizando los métodos habilitados por Prompt Studio.</p>
            <p>Los pagos estarán sujetos a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Umbrales mínimos.</li>
              <li>Verificación de identidad.</li>
              <li>Validación de conversiones.</li>
              <li>Cumplimiento de obligaciones fiscales.</li>
            </ul>
            <p>El afiliado será responsable de declarar los ingresos obtenidos conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.8 Modificaciones</h3>
            <p>Prompt Studio podrá modificar o finalizar el Programa de Afiliados en cualquier momento.</p>
            <p>Las modificaciones no afectarán las comisiones ya aprobadas, salvo cuando existan actividades fraudulentas o incumplimientos de estos Términos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 24. Servicios de Terceros
              </h2>
            </section>
            <p>Prompt Studio utiliza servicios proporcionados por terceros para ofrecer determinadas funcionalidades de la Plataforma.</p>
            <p>Cada proveedor opera conforme a sus propios términos de servicio y políticas de privacidad.</p>
            <p>Prompt Studio selecciona cuidadosamente a sus proveedores tecnológicos, pero no controla directamente sus plataformas externas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.1 Autenticación</h3>
            <p>La autenticación y administración de cuentas de usuario se realiza mediante Clerk.</p>
            <p>Clerk gestiona aspectos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inicio de sesión.</li>
              <li>Sesiones.</li>
              <li>Verificación de identidad.</li>
              <li>Métodos de autenticación.</li>
              <li>Seguridad de las cuentas.</li>
            </ul>
            <p>El uso de estos servicios queda sujeto tanto a estos Términos como a las condiciones del proveedor correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.2 Procesamiento de pagos</h3>
            <p>Las compras, suscripciones y demás operaciones económicas son procesadas mediante Stripe.</p>
            <p>Stripe administra, entre otras funciones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pagos.</li>
              <li>Facturación.</li>
              <li>Renovaciones.</li>
              <li>Reembolsos.</li>
              <li>Métodos de pago.</li>
              <li>Portal del Cliente.</li>
            </ul>
            <p>Prompt Studio no almacena información completa de tarjetas bancarias.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.3 Base de datos</h3>
            <p>La información necesaria para operar la Plataforma podrá almacenarse utilizando MongoDB Atlas.</p>
            <p>Entre otros datos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perfiles.</li>
              <li>Preferencias.</li>
              <li>Historial de compras.</li>
              <li>Actividad.</li>
              <li>Programa de afiliados.</li>
              <li>Configuraciones.</li>
            </ul>
            <p>El tratamiento de dichos datos se realiza conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.4 Inteligencia Artificial</h3>
            <p>Las herramientas de Inteligencia Artificial disponibles en Prompt Studio utilizan tecnologías como Google Gemini y Google Genkit.</p>
            <p>Estas herramientas permiten generar contenido basado en las instrucciones proporcionadas por el usuario.</p>
            <p>Prompt Studio no garantiza que los resultados generados sean:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exactos.</li>
              <li>Exclusivos.</li>
              <li>Completos.</li>
              <li>Adecuados para un propósito específico.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.5 Analítica</h3>
            <p>Prompt Studio utiliza herramientas analíticas con la finalidad de comprender el uso de la Plataforma y mejorar la experiencia del usuario.</p>
            <p>Estas herramientas podrán recopilar información estadística relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Navegación.</li>
              <li>Rendimiento.</li>
              <li>Eventos de interacción.</li>
              <li>Conversión.</li>
              <li>Estabilidad del sitio.</li>
            </ul>
            <p>La recopilación de estos datos se realiza conforme a la Política de Privacidad y la Política de Cookies.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.6 Infraestructura</h3>
            <p>Prompt Studio utiliza servicios especializados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hospedaje del sitio.</li>
              <li>Distribución de contenido.</li>
              <li>Almacenamiento de archivos.</li>
              <li>Optimización del rendimiento.</li>
              <li>Seguridad de la infraestructura.</li>
            </ul>
            <p>La disponibilidad de la Plataforma podrá depender parcialmente de estos proveedores externos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.7 Cambios de proveedores</h3>
            <p>Prompt Studio podrá sustituir cualquiera de sus proveedores tecnológicos por otros equivalentes cuando resulte necesario por razones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Técnicas.</li>
              <li>Comerciales.</li>
              <li>Operativas.</li>
              <li>De seguridad.</li>
              <li>De cumplimiento normativo.</li>
            </ul>
            <p>Dichos cambios no alterarán la validez de estos Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.8 Limitación de responsabilidad</h3>
            <p>Prompt Studio no será responsable por interrupciones, errores o limitaciones originadas exclusivamente por servicios de terceros, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fallos de infraestructura.</li>
              <li>Interrupciones de proveedores.</li>
              <li>Cambios en APIs.</li>
              <li>Modificaciones de plataformas externas.</li>
              <li>Problemas de conectividad ajenos a Prompt Studio.</li>
            </ul>
            <p>No obstante, Prompt Studio realizará esfuerzos razonables para restablecer el funcionamiento de la Plataforma cuando sea posible.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 25. Disponibilidad del Servicio
              </h2>
            </section>
            <p>Prompt Studio realiza esfuerzos razonables para mantener la Plataforma disponible de forma continua y segura. No obstante, debido a la naturaleza de los servicios en línea, no garantiza que el acceso sea ininterrumpido, libre de errores o disponible en todo momento.</p>
            <p>El usuario reconoce que determinadas interrupciones pueden producirse por motivos técnicos, operativos, legales o de seguridad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.1 Disponibilidad general</h3>
            <p>Prompt Studio procura mantener la Plataforma accesible las veinticuatro (24) horas del día, los siete (7) días de la semana.</p>
            <p>Sin embargo, la disponibilidad podrá verse afectada por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento programado.</li>
              <li>Actualizaciones.</li>
              <li>Fallos de infraestructura.</li>
              <li>Problemas de proveedores externos.</li>
              <li>Incidentes de seguridad.</li>
              <li>Circunstancias de fuerza mayor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.2 Mantenimiento programado</h3>
            <p>Prompt Studio podrá realizar tareas de mantenimiento destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar el rendimiento.</li>
              <li>Corregir errores.</li>
              <li>Actualizar componentes.</li>
              <li>Reforzar la seguridad.</li>
              <li>Incorporar nuevas funcionalidades.</li>
            </ul>
            <p>Siempre que sea razonablemente posible, los mantenimientos programados se realizarán procurando minimizar el impacto para los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.3 Interrupciones no programadas</h3>
            <p>Podrán producirse interrupciones imprevistas como consecuencia de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fallos eléctricos.</li>
              <li>Problemas de conectividad.</li>
              <li>Incidentes de ciberseguridad.</li>
              <li>Errores de software.</li>
              <li>Fallos en servicios de terceros.</li>
              <li>Problemas de infraestructura.</li>
            </ul>
            <p>Prompt Studio realizará esfuerzos razonables para restablecer el servicio lo antes posible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.4 Dependencia de terceros</h3>
            <p>El funcionamiento de Prompt Studio depende parcialmente de proveedores tecnológicos externos, incluyendo servicios de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Bases de datos.</li>
              <li>Inteligencia Artificial.</li>
              <li>Analítica.</li>
              <li>Correo electrónico.</li>
              <li>Almacenamiento de archivos.</li>
              <li>Infraestructura en la nube.</li>
            </ul>
            <p>Las interrupciones ocasionadas exclusivamente por dichos proveedores podrán afectar temporalmente la disponibilidad de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.5 Suspensión temporal</h3>
            <p>Prompt Studio podrá suspender temporalmente parte o la totalidad de los servicios cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger la seguridad de la Plataforma.</li>
              <li>Investigar incidentes.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Prevenir fraudes.</li>
              <li>Implementar mejoras críticas.</li>
            </ul>
            <p>Cuando sea posible, se informará previamente a los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.6 Cambios en funcionalidades</h3>
            <p>Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incorporar nuevas funciones.</li>
              <li>Eliminar funciones obsoletas.</li>
              <li>Modificar herramientas existentes.</li>
              <li>Reorganizar el catálogo.</li>
              <li>Mejorar la experiencia de usuario.</li>
            </ul>
            <p>Estas modificaciones forman parte del proceso normal de evolución de la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.7 Copias de seguridad</h3>
            <p>Prompt Studio podrá realizar copias de seguridad de la información necesaria para garantizar la continuidad operativa y facilitar la recuperación ante incidentes.</p>
            <p>La existencia de copias de seguridad no constituye una garantía absoluta frente a la pérdida de datos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.8 Sin garantía de disponibilidad permanente</h3>
            <p>Salvo que la legislación aplicable disponga otra cosa, Prompt Studio no garantiza:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Disponibilidad ininterrumpida.</li>
              <li>Funcionamiento permanente.</li>
              <li>Ausencia total de errores.</li>
              <li>Compatibilidad con todos los dispositivos o navegadores.</li>
              <li>Funcionamiento continuo de servicios proporcionados por terceros.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 26. Actualizaciones de la Plataforma
              </h2>
            </section>
            <p>Prompt Studio evoluciona continuamente con el objetivo de ofrecer una mejor experiencia, incorporar nuevas tecnologías y mantener altos estándares de seguridad.</p>
            <p>En consecuencia, la Plataforma podrá ser actualizada de manera periódica.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.1 Mejoras continuas</h3>
            <p>Prompt Studio podrá realizar mejoras relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Diseño de la interfaz.</li>
              <li>Rendimiento.</li>
              <li>Seguridad.</li>
              <li>Inteligencia Artificial.</li>
              <li>Catálogo de recursos.</li>
              <li>Sistema de búsqueda.</li>
              <li>Herramientas Premium.</li>
              <li>Programa de afiliados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.2 Nuevas funcionalidades</h3>
            <p>Prompt Studio podrá incorporar nuevas funcionalidades, incluyendo, entre otras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nuevos generadores de prompts.</li>
              <li>Nuevos modelos de IA.</li>
              <li>Nuevos tipos de recursos digitales.</li>
              <li>Integraciones con servicios externos.</li>
              <li>Herramientas colaborativas.</li>
              <li>Automatizaciones.</li>
              <li>Funciones experimentales.</li>
            </ul>
            <p>El acceso a estas funcionalidades podrá depender del tipo de cuenta o suscripción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.3 Funciones experimentales</h3>
            <p>Algunas funciones podrán identificarse como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Beta.</li>
              <li>Experimental.</li>
              <li>Acceso anticipado.</li>
              <li>Vista previa.</li>
            </ul>
            <p>Estas funciones podrán contener errores, cambiar con frecuencia o ser retiradas sin previo aviso.</p>
            <p>El uso de dichas funciones será bajo la responsabilidad del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.4 Compatibilidad</h3>
            <p>Las actualizaciones podrán requerir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Navegadores compatibles.</li>
              <li>Versiones recientes del sistema operativo.</li>
              <li>Dispositivos compatibles.</li>
              <li>Conexión estable a Internet.</li>
            </ul>
            <p>Prompt Studio no garantiza compatibilidad permanente con software o hardware obsoleto.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.5 Cambios en recursos digitales</h3>
            <p>Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actualizar prompts.</li>
              <li>Mejorar plantillas.</li>
              <li>Corregir recursos HTML.</li>
              <li>Optimizar imágenes.</li>
              <li>Sustituir demos.</li>
              <li>Incorporar nuevas versiones de recursos digitales.</li>
            </ul>
            <p>Cuando corresponda, estas actualizaciones podrán ponerse a disposición de los usuarios conforme a la licencia adquirida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.6 Cambios tecnológicos</h3>
            <p>Prompt Studio podrá sustituir o actualizar tecnologías utilizadas en la Plataforma, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proveedores de Inteligencia Artificial.</li>
              <li>Infraestructura.</li>
              <li>Sistemas de autenticación.</li>
              <li>Herramientas analíticas.</li>
              <li>Bases de datos.</li>
              <li>Sistemas de almacenamiento.</li>
            </ul>
            <p>Estas modificaciones podrán realizarse sin afectar la validez de los presentes Términos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.7 Notificaciones</h3>
            <p>Cuando una actualización tenga un impacto significativo sobre el funcionamiento de la Plataforma, Prompt Studio podrá informar a los usuarios mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico.</li>
              <li>Notificaciones dentro de la cuenta.</li>
              <li>Avisos en el sitio web.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.8 Aceptación de las actualizaciones</h3>
            <p>El uso continuado de Prompt Studio después de la implementación de una actualización implica la aceptación de los cambios realizados, siempre que no sea necesario un consentimiento adicional conforme a la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 27. Eliminación de Cuentas
              </h2>
            </section>
            <p>Prompt Studio permite a los usuarios eliminar su cuenta en cualquier momento, sin necesidad de indicar una causa, conforme a estos Términos, la Política de Privacidad y la legislación aplicable.</p>
            <p>La eliminación de una cuenta implica la finalización del acceso a los servicios asociados, sin perjuicio de la conservación de la información que deba mantenerse por obligación legal o para la defensa de derechos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.1 Eliminación voluntaria</h3>
            <p>El usuario podrá solicitar la eliminación de su cuenta mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La configuración de su perfil, cuando dicha funcionalidad esté disponible.</li>
              <li>Los mecanismos proporcionados por el sistema de autenticación.</li>
              <li>El correo electrónico oficial de soporte.</li>
            </ul>
            <p>Las solicitudes deberán enviarse a:</p>
            <p>help@prompstudio.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.2 Eliminación mediante Clerk</h3>
            <p>Prompt Studio utiliza Clerk como proveedor de autenticación.</p>
            <p>Cuando el usuario elimine su cuenta:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se cerrarán las sesiones activas.</li>
              <li>Se eliminarán los datos administrados por Clerk conforme a sus políticas.</li>
              <li>Se notificará a Prompt Studio mediante los mecanismos técnicos correspondientes.</li>
              <li>Se iniciará el proceso interno de eliminación o anonimización de la información asociada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.3 Información conservada</h3>
            <p>La eliminación de la cuenta no implica necesariamente la eliminación inmediata de toda la información.</p>
            <p>Prompt Studio podrá conservar determinados datos cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Detectar fraude.</li>
              <li>Atender requerimientos de autoridades competentes.</li>
              <li>Cumplir obligaciones fiscales y contables.</li>
              <li>Defender derechos legales.</li>
            </ul>
            <p>La conservación se limitará al tiempo estrictamente necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.4 Recursos adquiridos</h3>
            <p>Una vez eliminada la cuenta:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario perderá el acceso a los recursos asociados a dicha cuenta.</li>
              <li>Las licencias vinculadas a la cuenta dejarán de estar disponibles mientras la cuenta permanezca eliminada.</li>
              <li>La eliminación de la cuenta no genera automáticamente derecho a reembolso.</li>
            </ul>
            <p>Cuando la legislación aplicable lo permita, Prompt Studio podrá conservar registros mínimos relacionados con las compras realizadas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.5 Suscripciones activas</h3>
            <p>Antes de eliminar la cuenta, el usuario deberá cancelar cualquier suscripción activa.</p>
            <p>Si la cuenta se elimina mientras existe una suscripción vigente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La renovación automática será cancelada cuando resulte técnicamente posible.</li>
              <li>El acceso Premium finalizará conforme al período previamente pagado o según las condiciones aplicables del proveedor de pagos.</li>
              <li>La eliminación de la cuenta no implica el reembolso del período ya abonado, salvo disposición legal en contrario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.6 Eliminación de datos personales</h3>
            <p>El tratamiento de los datos personales tras la eliminación de la cuenta se realizará conforme a la Política de Privacidad de Prompt Studio.</p>
            <p>Cuando el usuario solicite expresamente la supresión de sus datos personales, Prompt Studio atenderá dicha solicitud conforme a la legislación aplicable, incluyendo el Reglamento General de Protección de Datos (RGPD) y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.7 Reactivación</h3>
            <p>Una cuenta eliminada podrá no ser recuperable.</p>
            <p>Cuando la recuperación sea técnicamente posible, Prompt Studio decidirá, a su exclusiva discreción, si procede la reactivación.</p>
            <p>No se garantiza la conservación de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras.</li>
              <li>Preferencias.</li>
              <li>Configuraciones.</li>
              <li>Historial.</li>
              <li>Recursos asociados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.8 Derecho de Prompt Studio</h3>
            <p>Prompt Studio podrá conservar la información estrictamente necesaria para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplir obligaciones legales.</li>
              <li>Proteger la seguridad de la Plataforma.</li>
              <li>Resolver reclamaciones.</li>
              <li>Defender derechos legales.</li>
              <li>Cumplir requerimientos judiciales o administrativos.</li>
            </ul>
            <p>Estas obligaciones continuarán vigentes incluso después de la eliminación de la cuenta.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 28. Suspensión y Terminación del Servicio
              </h2>
            </section>
            <p>Prompt Studio podrá suspender, limitar o finalizar el acceso a la Plataforma cuando existan motivos razonables relacionados con la seguridad, el cumplimiento de estos Términos o la legislación aplicable.</p>
            <p>Las medidas adoptadas serán proporcionales a la gravedad de la situación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.1 Suspensión temporal</h3>
            <p>Prompt Studio podrá suspender temporalmente una cuenta cuando detecte, entre otras circunstancias:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actividad sospechosa.</li>
              <li>Intentos de acceso no autorizado.</li>
              <li>Riesgos para la seguridad.</li>
              <li>Incumplimiento de estos Términos.</li>
              <li>Pagos pendientes.</li>
              <li>Investigaciones por fraude.</li>
            </ul>
            <p>Durante la suspensión podrán limitarse determinadas funcionalidades.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.2 Terminación definitiva</h3>
            <p>Prompt Studio podrá cancelar definitivamente una cuenta cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exista fraude comprobado.</li>
              <li>Se utilicen métodos de pago robados.</li>
              <li>Se distribuya contenido Premium sin autorización.</li>
              <li>Se utilicen bots para copiar la Plataforma.</li>
              <li>Se infrinjan derechos de propiedad intelectual.</li>
              <li>Se produzcan incumplimientos graves o reiterados de estos Términos.</li>
            </ul>
            <p>La terminación podrá realizarse sin previo aviso cuando la gravedad de la conducta lo justifique.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.3 Efectos de la terminación</h3>
            <p>Cuando una cuenta sea cancelada:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se revocará el acceso a la Plataforma.</li>
              <li>Se cancelarán las licencias concedidas cuando resulte procedente.</li>
              <li>Se desactivarán las funciones Premium.</li>
              <li>Podrán eliminarse los datos conforme a la Política de Privacidad.</li>
              <li>Se conservará la información necesaria para cumplir obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.4 Incumplimientos reiterados</h3>
            <p>Prompt Studio podrá considerar como agravantes, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reincidencia.</li>
              <li>Uso de múltiples cuentas para eludir sanciones.</li>
              <li>Actividad automatizada reiterada.</li>
              <li>Intentos continuos de vulnerar la seguridad.</li>
              <li>Distribución masiva de recursos protegidos.</li>
            </ul>
            <p>Estos supuestos podrán dar lugar al bloqueo permanente del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.5 Sin derecho a indemnización</h3>
            <p>La suspensión o cancelación de una cuenta realizada conforme a estos Términos no generará derecho a indemnización, compensación o reembolso, salvo que la legislación aplicable disponga expresamente lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.6 Conservación de derechos</h3>
            <p>La terminación de la cuenta no afectará:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las obligaciones de pago pendientes.</li>
              <li>Las obligaciones de confidencialidad.</li>
              <li>Las disposiciones sobre propiedad intelectual.</li>
              <li>Las limitaciones de responsabilidad.</li>
              <li>Las cláusulas de resolución de controversias.</li>
            </ul>
            <p>Estas continuarán vigentes cuando por su naturaleza deban subsistir.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.7 Recursos legales</h3>
            <p>Prompt Studio podrá ejercer todas las acciones legales disponibles para proteger:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sus derechos.</li>
              <li>Su propiedad intelectual.</li>
              <li>La seguridad de la Plataforma.</li>
              <li>Los intereses de sus usuarios.</li>
              <li>Sus relaciones comerciales.</li>
            </ul>
            <p>La suspensión o terminación de la cuenta no limita el ejercicio de dichas acciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.8 Solicitudes de revisión</h3>
            <p>Cuando un usuario considere que su cuenta ha sido suspendida o cancelada por error, podrá solicitar una revisión enviando un correo a:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio revisará la solicitud de buena fe y comunicará su decisión dentro de un plazo razonable. La presentación de una solicitud de revisión no garantiza el restablecimiento de la cuenta.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 29. Descargos de Responsabilidad
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de los usuarios una plataforma destinada a facilitar el acceso a recursos digitales, herramientas de Inteligencia Artificial y contenido relacionado con la creación de imágenes, videos, aplicaciones y sitios web.</p>
            <p>Salvo que la legislación aplicable disponga expresamente lo contrario, la Plataforma y todos sus servicios se ofrecen “tal cual” (“as is”) y “según disponibilidad” (“as available”), sin garantías de ningún tipo, expresas o implícitas.</p>
            <p>El usuario utiliza la Plataforma bajo su propia responsabilidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.1 Exactitud del contenido</h3>
            <p>Prompt Studio realiza esfuerzos razonables para ofrecer contenido útil y actualizado.</p>
            <p>No obstante, no garantiza que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los prompts sean adecuados para todos los modelos de IA.</li>
              <li>Los recursos estén libres de errores.</li>
              <li>El contenido permanezca actualizado permanentemente.</li>
              <li>Los resultados obtenidos sean idénticos en todas las plataformas.</li>
              <li>La información publicada sea completa para todos los casos de uso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.2 Resultados de Inteligencia Artificial</h3>
            <p>Los resultados obtenidos mediante herramientas de Inteligencia Artificial dependen de múltiples factores externos, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El modelo utilizado.</li>
              <li>La versión del modelo.</li>
              <li>La configuración del usuario.</li>
              <li>La evolución tecnológica.</li>
              <li>Las instrucciones proporcionadas.</li>
            </ul>
            <p>Por ello, Prompt Studio no garantiza:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exactitud absoluta.</li>
              <li>Exclusividad.</li>
              <li>Originalidad.</li>
              <li>Calidad determinada.</li>
              <li>Resultados específicos.</li>
              <li>Compatibilidad con todos los servicios de IA.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.3 Decisiones del usuario</h3>
            <p>El usuario es el único responsable de las decisiones que adopte utilizando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Recursos digitales.</li>
              <li>Contenido generado mediante IA.</li>
              <li>Plantillas.</li>
              <li>Componentes.</li>
              <li>Recursos HTML.</li>
            </ul>
            <p>Prompt Studio no sustituye el criterio profesional del usuario ni presta asesoría jurídica, financiera, médica, técnica o de cualquier otra naturaleza.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.4 Disponibilidad</h3>
            <p>Prompt Studio no garantiza que la Plataforma permanezca disponible de manera continua.</p>
            <p>Podrán producirse interrupciones derivadas de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento.</li>
              <li>Actualizaciones.</li>
              <li>Problemas técnicos.</li>
              <li>Servicios de terceros.</li>
              <li>Ataques informáticos.</li>
              <li>Fuerza mayor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.5 Compatibilidad</h3>
            <p>Prompt Studio procura desarrollar recursos compatibles con las tecnologías indicadas en cada producto.</p>
            <p>Sin embargo, no garantiza compatibilidad permanente con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Versiones futuras de software.</li>
              <li>Modelos de Inteligencia Artificial.</li>
              <li>Frameworks.</li>
              <li>Navegadores.</li>
              <li>Sistemas operativos.</li>
              <li>Servicios externos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.6 Servicios de terceros</h3>
            <p>Determinadas funcionalidades dependen de proveedores externos.</p>
            <p>Prompt Studio no controla directamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plataformas de autenticación.</li>
              <li>Procesadores de pago.</li>
              <li>Servicios de Inteligencia Artificial.</li>
              <li>Infraestructura en la nube.</li>
              <li>Servicios analíticos.</li>
              <li>Correo electrónico.</li>
            </ul>
            <p>Las incidencias originadas exclusivamente por dichos proveedores quedan fuera del control razonable de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.7 Enlaces externos</h3>
            <p>La Plataforma podrá contener enlaces a sitios web o servicios operados por terceros.</p>
            <p>Prompt Studio no controla dichos sitios y no asume responsabilidad por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Su contenido.</li>
              <li>Sus políticas.</li>
              <li>Su disponibilidad.</li>
              <li>Sus prácticas comerciales.</li>
              <li>Su tratamiento de datos personales.</li>
            </ul>
            <p>El acceso a dichos sitios será responsabilidad exclusiva del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.8 Sin garantías implícitas</h3>
            <p>En la máxima medida permitida por la legislación aplicable, Prompt Studio excluye cualquier garantía implícita relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comercialización.</li>
              <li>Idoneidad para un propósito específico.</li>
              <li>Disponibilidad permanente.</li>
              <li>Funcionamiento ininterrumpido.</li>
              <li>Ausencia de errores.</li>
              <li>Compatibilidad universal.</li>
            </ul>
            <p>Cuando alguna legislación limite estas exclusiones, dichas limitaciones se aplicarán únicamente en la medida exigida por la ley.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 30. Limitación de Responsabilidad
              </h2>
            </section>
            <p>En la máxima medida permitida por la legislación aplicable, la responsabilidad total de Prompt Studio y de Magzin LLC derivada del uso de la Plataforma estará limitada conforme a las disposiciones establecidas en esta sección.</p>
            <p>Nada de lo dispuesto en estos Términos limita la responsabilidad cuando la legislación aplicable prohíba expresamente dicha limitación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.1 Daños indirectos</h3>
            <p>Prompt Studio no será responsable por daños indirectos, incidentales, especiales, ejemplares o consecuenciales, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pérdida de ingresos.</li>
              <li>Pérdida de beneficios.</li>
              <li>Pérdida de oportunidades comerciales.</li>
              <li>Pérdida de información.</li>
              <li>Pérdida de clientes.</li>
              <li>Interrupción de actividades.</li>
              <li>Daños reputacionales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.2 Pérdida de datos</h3>
            <p>Aunque Prompt Studio adopta medidas razonables para proteger la información, no será responsable por pérdidas de datos ocasionadas por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fallos de terceros.</li>
              <li>Ataques informáticos.</li>
              <li>Problemas de infraestructura.</li>
              <li>Errores del usuario.</li>
              <li>Fuerza mayor.</li>
            </ul>
            <p>El usuario es responsable de mantener copias de seguridad de la información que considere importante.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.3 Uso del contenido</h3>
            <p>Prompt Studio no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El uso que el usuario haga de los prompts.</li>
              <li>El contenido generado mediante IA.</li>
              <li>La utilización de recursos descargados.</li>
              <li>La publicación de contenido generado.</li>
              <li>Las decisiones tomadas con base en dichos recursos.</li>
            </ul>
            <p>El usuario asume toda la responsabilidad derivada de su utilización.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.4 Responsabilidad por terceros</h3>
            <p>Prompt Studio no responderá por daños ocasionados exclusivamente por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clerk.</li>
              <li>Stripe.</li>
              <li>Google Gemini.</li>
              <li>Google Genkit.</li>
              <li>MongoDB Atlas.</li>
              <li>Cloudflare R2.</li>
              <li>Resend.</li>
              <li>Google Analytics.</li>
              <li>Firebase Analytics.</li>
              <li>Vercel Analytics.</li>
              <li>Vercel.</li>
              <li>Cualquier otro proveedor externo.</li>
            </ul>
            <p>Cada proveedor opera bajo sus propios términos y condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.5 Límite económico</h3>
            <p>En la máxima medida permitida por la legislación aplicable, la responsabilidad total acumulada de Prompt Studio frente al usuario por cualquier reclamación relacionada con la Plataforma no excederá el importe efectivamente pagado por el usuario a Prompt Studio durante los doce (12) meses inmediatamente anteriores al hecho que origine la reclamación.</p>
            <p>Esta limitación no será aplicable cuando una norma imperativa establezca un límite diferente o prohíba dicha limitación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.6 Fuerza mayor</h3>
            <p>Prompt Studio no será responsable por incumplimientos derivados de circunstancias fuera de su control razonable, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Desastres naturales.</li>
              <li>Incendios.</li>
              <li>Inundaciones.</li>
              <li>Terremotos.</li>
              <li>Conflictos armados.</li>
              <li>Actos terroristas.</li>
              <li>Huelgas.</li>
              <li>Fallos masivos de Internet.</li>
              <li>Cortes de energía.</li>
              <li>Pandemias.</li>
              <li>Decisiones gubernamentales.</li>
              <li>Fallos generalizados de proveedores tecnológicos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.7 Legislación aplicable</h3>
            <p>Algunas jurisdicciones no permiten excluir determinadas garantías o limitar ciertos tipos de responsabilidad.</p>
            <p>En esos casos, las limitaciones establecidas en esta sección se aplicarán únicamente en la medida permitida por la legislación correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.8 Aceptación del riesgo</h3>
            <p>El usuario reconoce que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comprende la naturaleza de los servicios digitales.</li>
              <li>Comprende las limitaciones inherentes a la Inteligencia Artificial.</li>
              <li>Acepta utilizar Prompt Studio bajo su propia responsabilidad.</li>
              <li>Asume los riesgos razonablemente asociados al uso de la Plataforma.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 31. Indemnización
              </h2>
            </section>
            <p>El usuario acepta defender, indemnizar y mantener indemne a Magzin LLC, a Prompt Studio, sus directivos, administradores, empleados, contratistas, representantes, afiliadas, proveedores tecnológicos y colaboradores frente a cualquier reclamación, demanda, procedimiento, daño, pérdida, responsabilidad, sanción, costo o gasto (incluyendo honorarios razonables de abogados) que se derive del incumplimiento de estos Términos o del uso indebido de la Plataforma.</p>
            <p>Esta obligación permanecerá vigente incluso después de la cancelación de la cuenta o de la finalización de la relación entre el usuario y Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.1 Incumplimiento de los Términos</h3>
            <p>El usuario deberá indemnizar a Prompt Studio cuando una reclamación derive, entre otros supuestos, de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incumplimiento de estos Términos.</li>
              <li>Violación de la legislación aplicable.</li>
              <li>Uso indebido de los recursos digitales.</li>
              <li>Distribución no autorizada de contenido Premium.</li>
              <li>Incumplimiento de las licencias de uso.</li>
              <li>Utilización fraudulenta de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.2 Reclamaciones de terceros</h3>
            <p>El usuario será responsable de cualquier reclamación presentada por terceros derivada de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts creados por el usuario.</li>
              <li>Contenido publicado.</li>
              <li>Archivos cargados.</li>
              <li>Recursos compartidos.</li>
              <li>Uso de Inteligencia Artificial.</li>
              <li>Infracción de derechos de autor.</li>
              <li>Violación de marcas registradas.</li>
              <li>Vulneración de otros derechos de propiedad intelectual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.3 Contenido generado mediante IA</h3>
            <p>El usuario reconoce que es el único responsable del uso que haga del contenido generado mediante las herramientas de Inteligencia Artificial disponibles en Prompt Studio.</p>
            <p>En consecuencia, asumirá toda responsabilidad cuando dicho contenido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vulnere derechos de terceros.</li>
              <li>Sea utilizado con fines ilícitos.</li>
              <li>Infrinja la legislación aplicable.</li>
              <li>Cause daños a terceros.</li>
              <li>Sea utilizado sin las verificaciones necesarias.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.4 Información proporcionada</h3>
            <p>El usuario garantiza que toda la información que proporcione a Prompt Studio será:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Veraz.</li>
              <li>Exacta.</li>
              <li>Completa.</li>
              <li>Actualizada.</li>
              <li>Lícitamente obtenida.</li>
            </ul>
            <p>Prompt Studio no será responsable por las consecuencias derivadas de información falsa o inexacta proporcionada por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.5 Costos legales</h3>
            <p>La obligación de indemnización podrá comprender, cuando resulte procedente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Honorarios razonables de abogados.</li>
              <li>Costas judiciales.</li>
              <li>Gastos administrativos.</li>
              <li>Indemnizaciones.</li>
              <li>Sanciones impuestas por autoridades cuando sean consecuencia directa de la conducta del usuario.</li>
              <li>Gastos derivados de investigaciones relacionadas con el incumplimiento.</li>
            </ul>
            <p>Todo ello en la medida permitida por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.6 Cooperación</h3>
            <p>El usuario acepta colaborar razonablemente con Prompt Studio en la defensa de cualquier reclamación relacionada con su conducta o con el uso que haya realizado de la Plataforma.</p>
            <p>Prompt Studio podrá asumir la dirección exclusiva de la defensa cuando lo considere necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.7 Alcance</h3>
            <p>Las obligaciones previstas en esta sección continuarán vigentes incluso después de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La eliminación de la cuenta.</li>
              <li>La cancelación de una suscripción.</li>
              <li>La finalización de una licencia.</li>
              <li>La terminación de la relación contractual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">31.8 Limitaciones</h3>
            <p>Nada de lo dispuesto en esta sección obligará al usuario a indemnizar a Prompt Studio cuando una reclamación sea consecuencia exclusiva de una conducta dolosa o gravemente negligente atribuible directamente a Prompt Studio, en aquellos casos en que la legislación aplicable así lo determine.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 32. Protección de Datos Personales
              </h2>
            </section>
            <p>Prompt Studio trata los datos personales de los usuarios conforme a la legislación aplicable y a su Política de Privacidad, la cual forma parte integrante de estos Términos y Condiciones.</p>
            <p>El uso de la Plataforma implica el tratamiento de determinados datos personales necesarios para prestar los servicios contratados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.1 Política de Privacidad</h3>
            <p>Toda la información relacionada con el tratamiento de datos personales se encuentra descrita en la Política de Privacidad de Prompt Studio.</p>
            <p>Dicha Política regula, entre otros aspectos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Datos recopilados.</li>
              <li>Finalidades del tratamiento.</li>
              <li>Conservación.</li>
              <li>Derechos del usuario.</li>
              <li>Transferencias internacionales.</li>
              <li>Medidas de seguridad.</li>
              <li>Uso de cookies.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.2 Tratamiento de datos</h3>
            <p>Prompt Studio podrá tratar datos personales con las siguientes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear cuentas.</li>
              <li>Autenticar usuarios.</li>
              <li>Gestionar compras.</li>
              <li>Administrar suscripciones.</li>
              <li>Procesar pagos.</li>
              <li>Enviar correos electrónicos.</li>
              <li>Brindar soporte.</li>
              <li>Detectar fraude.</li>
              <li>Mejorar la Plataforma.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p>El tratamiento se realizará únicamente cuando exista una base jurídica válida conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.3 Proveedores especializados</h3>
            <p>Para prestar sus servicios, Prompt Studio utiliza proveedores especializados que pueden tratar información personal por cuenta de la Plataforma.</p>
            <p>Entre ellos podrán encontrarse proveedores relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación.</li>
              <li>Procesamiento de pagos.</li>
              <li>Infraestructura.</li>
              <li>Bases de datos.</li>
              <li>Inteligencia Artificial.</li>
              <li>Analítica.</li>
              <li>Envío de correos electrónicos.</li>
              <li>Almacenamiento de archivos.</li>
            </ul>
            <p>Estos proveedores actuarán conforme a sus propias obligaciones legales y contractuales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.4 Seguridad</h3>
            <p>Prompt Studio implementa medidas técnicas y organizativas razonables destinadas a proteger la información personal frente a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accesos no autorizados.</li>
              <li>Alteración.</li>
              <li>Divulgación.</li>
              <li>Pérdida.</li>
              <li>Destrucción.</li>
              <li>Uso indebido.</li>
            </ul>
            <p>No obstante, ningún sistema de seguridad puede garantizar protección absoluta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.5 Derechos del usuario</h3>
            <p>Dependiendo de la legislación aplicable, el usuario podrá ejercer derechos relacionados con sus datos personales, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso.</li>
              <li>Rectificación.</li>
              <li>Supresión.</li>
              <li>Cancelación.</li>
              <li>Oposición.</li>
              <li>Limitación del tratamiento.</li>
              <li>Portabilidad.</li>
              <li>Revocación del consentimiento.</li>
            </ul>
            <p>Los procedimientos para ejercer estos derechos se describen en la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.6 Conservación</h3>
            <p>Los datos personales se conservarán únicamente durante el tiempo necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prestar los servicios.</li>
              <li>Cumplir obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Detectar fraude.</li>
              <li>Proteger derechos legales.</li>
            </ul>
            <p>Una vez finalizado dicho período, los datos serán eliminados o anonimizados cuando resulte procedente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.7 Comunicaciones electrónicas</h3>
            <p>Prompt Studio podrá enviar comunicaciones relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seguridad.</li>
              <li>Compras.</li>
              <li>Facturación.</li>
              <li>Cambios importantes.</li>
              <li>Actualizaciones del servicio.</li>
              <li>Soporte técnico.</li>
            </ul>
            <p>Las comunicaciones promocionales únicamente se enviarán cuando exista una base legal para ello y el usuario podrá darse de baja conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">32.8 Legislación aplicable</h3>
            <p>El tratamiento de los datos personales se realizará procurando cumplir, cuando resulte aplicable, con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Reglamento General de Protección de Datos (RGPD/GDPR).</li>
              <li>La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>La California Consumer Privacy Act (CCPA).</li>
              <li>La California Privacy Rights Act (CPRA).</li>
              <li>Las demás normas de protección de datos que resulten aplicables según la jurisdicción correspondiente.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 33. Seguridad de la Plataforma
              </h2>
            </section>
            <p>Prompt Studio implementa medidas técnicas, organizativas y administrativas razonables para proteger la confidencialidad, integridad y disponibilidad de la Plataforma, así como de la información procesada durante la prestación de sus servicios.</p>
            <p>No obstante, debido a la naturaleza de Internet y de los sistemas informáticos, ningún mecanismo de seguridad puede garantizar una protección absoluta frente a todos los riesgos existentes.</p>
            <p>El usuario reconoce que utiliza la Plataforma bajo su propia responsabilidad y que colaborará activamente en la protección de su cuenta y de su información.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.1 Medidas de seguridad</h3>
            <p>Prompt Studio podrá implementar, entre otras, las siguientes medidas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado de comunicaciones mediante HTTPS/TLS.</li>
              <li>Protección contra accesos no autorizados.</li>
              <li>Sistemas de autenticación segura.</li>
              <li>Gestión de sesiones.</li>
              <li>Monitoreo de actividad sospechosa.</li>
              <li>Copias de seguridad.</li>
              <li>Controles de acceso internos.</li>
              <li>Actualizaciones periódicas de seguridad.</li>
            </ul>
            <p>Estas medidas podrán modificarse conforme evolucione la tecnología o cambien los riesgos de seguridad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.2 Infraestructura tecnológica</h3>
            <p>La Plataforma utiliza servicios especializados para garantizar la estabilidad y seguridad del servicio.</p>
            <p>Entre otras funciones, dichos servicios permiten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Alojamiento de la Plataforma.</li>
              <li>Distribución de contenido.</li>
              <li>Almacenamiento de información.</li>
              <li>Protección frente a ataques.</li>
              <li>Balanceo de carga.</li>
              <li>Optimización del rendimiento.</li>
              <li>Recuperación ante incidentes.</li>
            </ul>
            <p>Prompt Studio selecciona proveedores reconocidos por sus estándares de seguridad, sin garantizar que estén libres de interrupciones o incidentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.3 Seguridad de la cuenta</h3>
            <p>El usuario es responsable de adoptar medidas razonables para proteger el acceso a su cuenta, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantener la confidencialidad de sus credenciales.</li>
              <li>Utilizar contraseñas seguras cuando corresponda.</li>
              <li>No compartir códigos de autenticación.</li>
              <li>Cerrar sesión en dispositivos públicos.</li>
              <li>Mantener actualizado el software de sus dispositivos.</li>
            </ul>
            <p>La negligencia del usuario en la protección de sus credenciales será de su exclusiva responsabilidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.4 Detección de actividad sospechosa</h3>
            <p>Prompt Studio podrá supervisar determinados eventos relacionados con la seguridad con el fin de detectar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Intentos reiterados de inicio de sesión.</li>
              <li>Accesos inusuales.</li>
              <li>Actividad automatizada.</li>
              <li>Intentos de fraude.</li>
              <li>Uso indebido de recursos.</li>
              <li>Ataques contra la Plataforma.</li>
            </ul>
            <p>Cuando resulte necesario, Prompt Studio podrá limitar temporalmente el acceso mientras investiga el incidente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.5 Incidentes de seguridad</h3>
            <p>En caso de detectar un incidente que pueda comprometer la seguridad de la Plataforma o de los datos personales, Prompt Studio adoptará las medidas razonables para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contener el incidente.</li>
              <li>Evaluar su alcance.</li>
              <li>Restaurar el funcionamiento normal.</li>
              <li>Cumplir las obligaciones legales de notificación cuando correspondan.</li>
              <li>Reducir el riesgo de nuevos incidentes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.6 Responsabilidad del usuario</h3>
            <p>El usuario deberá abstenerse de realizar cualquier acción que comprometa la seguridad de la Plataforma, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Intentar vulnerar sistemas de protección.</li>
              <li>Distribuir software malicioso.</li>
              <li>Utilizar herramientas automatizadas no autorizadas.</li>
              <li>Acceder a información de terceros.</li>
              <li>Alterar el funcionamiento normal del servicio.</li>
            </ul>
            <p>Estas conductas podrán dar lugar a la suspensión inmediata de la cuenta y a las acciones legales correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.7 Actualizaciones de seguridad</h3>
            <p>Prompt Studio podrá implementar actualizaciones de seguridad sin previo aviso cuando resulte necesario para proteger:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La infraestructura.</li>
              <li>Los datos personales.</li>
              <li>Las cuentas de usuario.</li>
              <li>Los recursos digitales.</li>
              <li>Las herramientas de Inteligencia Artificial.</li>
            </ul>
            <p>Estas actualizaciones podrán implicar interrupciones temporales del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">33.8 Sin garantía absoluta</h3>
            <p>Aunque Prompt Studio aplica medidas razonables de seguridad, no garantiza que la Plataforma sea completamente inmune a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ataques informáticos.</li>
              <li>Malware.</li>
              <li>Phishing.</li>
              <li>Vulnerabilidades desconocidas.</li>
              <li>Fallos de terceros.</li>
              <li>Errores humanos.</li>
              <li>Circunstancias imprevisibles.</li>
            </ul>
            <p>El usuario reconoce estas limitaciones inherentes a cualquier servicio prestado a través de Internet.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 34. Fuerza Mayor
              </h2>
            </section>
            <p>Prompt Studio no será responsable por el incumplimiento o retraso en el cumplimiento de sus obligaciones cuando dicho incumplimiento sea consecuencia de acontecimientos fuera de su control razonable.</p>
            <p>Estas circunstancias podrán afectar temporal o permanentemente la prestación de los servicios ofrecidos por la Plataforma.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.1 Definición</h3>
            <p>Se considerarán eventos de fuerza mayor aquellos acontecimientos extraordinarios, imprevisibles o inevitables que impidan total o parcialmente la prestación del servicio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.2 Ejemplos</h3>
            <p>Entre otros, podrán considerarse eventos de fuerza mayor:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Desastres naturales.</li>
              <li>Terremotos.</li>
              <li>Huracanes.</li>
              <li>Inundaciones.</li>
              <li>Incendios.</li>
              <li>Tormentas severas.</li>
              <li>Pandemias.</li>
              <li>Epidemias.</li>
              <li>Conflictos armados.</li>
              <li>Terrorismo.</li>
              <li>Disturbios civiles.</li>
              <li>Huelgas generales.</li>
              <li>Cortes masivos de energía.</li>
              <li>Fallos generalizados de Internet.</li>
              <li>Restricciones gubernamentales.</li>
              <li>Sanciones internacionales.</li>
              <li>Ataques cibernéticos de gran escala.</li>
              <li>Fallos críticos de proveedores tecnológicos.</li>
            </ul>
            <p>Esta lista es meramente enunciativa y no limitativa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.3 Suspensión de obligaciones</h3>
            <p>Mientras subsista el evento de fuerza mayor, Prompt Studio podrá suspender temporalmente el cumplimiento de las obligaciones afectadas, sin que ello constituya un incumplimiento contractual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.4 Reanudación del servicio</h3>
            <p>Una vez desaparecidas las circunstancias que motivaron la suspensión, Prompt Studio realizará esfuerzos razonables para restablecer los servicios afectados dentro de un plazo adecuado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.5 Proveedores externos</h3>
            <p>Cuando un evento de fuerza mayor afecte a proveedores tecnológicos indispensables para el funcionamiento de Prompt Studio, las limitaciones o interrupciones derivadas de dichos proveedores también se considerarán comprendidas en esta cláusula.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.6 Comunicaciones</h3>
            <p>Cuando resulte posible, Prompt Studio procurará informar a los usuarios sobre los eventos que afecten significativamente la disponibilidad del servicio mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avisos en la Plataforma.</li>
              <li>Correos electrónicos.</li>
              <li>Notificaciones dentro de la cuenta.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <p>La imposibilidad de realizar dichas comunicaciones debido al propio evento de fuerza mayor no generará responsabilidad para Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.7 Limitación de responsabilidad</h3>
            <p>Durante un evento de fuerza mayor, Prompt Studio no será responsable por pérdidas, retrasos o interrupciones que sean consecuencia directa de dicho acontecimiento, en la medida permitida por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">34.8 Continuidad del contrato</h3>
            <p>La existencia de un evento de fuerza mayor no extinguirá automáticamente estos Términos y Condiciones.</p>
            <p>Las obligaciones afectadas permanecerán suspendidas únicamente durante el tiempo en que subsista el evento y se reanudarán una vez que resulte razonablemente posible.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 35. Modificaciones de los Términos y Condiciones
              </h2>
            </section>
            <p>Prompt Studio podrá modificar los presentes Términos y Condiciones cuando resulte necesario para reflejar cambios legales, regulatorios, tecnológicos, comerciales u operativos.</p>
            <p>Las modificaciones tendrán como finalidad mantener la Plataforma actualizada y garantizar el cumplimiento de la legislación aplicable, así como mejorar la experiencia de los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.1 Derecho de modificación</h3>
            <p>Prompt Studio se reserva el derecho de actualizar, modificar, sustituir o complementar estos Términos y Condiciones en cualquier momento.</p>
            <p>Las modificaciones podrán realizarse, entre otros motivos, por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios en la legislación.</li>
              <li>Nuevos requisitos regulatorios.</li>
              <li>Incorporación de nuevos servicios.</li>
              <li>Cambios tecnológicos.</li>
              <li>Mejoras de seguridad.</li>
              <li>Integración de nuevos proveedores.</li>
              <li>Actualizaciones de las herramientas de Inteligencia Artificial.</li>
              <li>Evolución del modelo de negocio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.2 Publicación</h3>
            <p>La versión vigente de estos Términos estará disponible permanentemente en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización aparecerá al inicio o al final del documento para facilitar su identificación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.3 Notificación de cambios importantes</h3>
            <p>Cuando una modificación afecte de manera significativa los derechos u obligaciones de los usuarios, Prompt Studio podrá comunicar dichos cambios mediante uno o varios de los siguientes medios:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avisos visibles en la Plataforma.</li>
              <li>Correos electrónicos.</li>
              <li>Notificaciones dentro de la cuenta.</li>
              <li>Mensajes emergentes (“pop-ups”).</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <p>Cuando la legislación aplicable exija un consentimiento adicional, Prompt Studio solicitará dicha aceptación antes de aplicar las modificaciones correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.4 Entrada en vigor</h3>
            <p>Salvo que se indique expresamente otra fecha, las modificaciones entrarán en vigor desde el momento de su publicación en la Plataforma.</p>
            <p>Las nuevas condiciones se aplicarán a partir de dicha fecha para todos los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.5 Uso continuado</h3>
            <p>El acceso o uso continuado de Prompt Studio después de la entrada en vigor de una modificación constituirá la aceptación de la versión actualizada de estos Términos, salvo cuando la legislación aplicable requiera un consentimiento expreso adicional.</p>
            <p>Si el usuario no está de acuerdo con las modificaciones, deberá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dejar de utilizar la Plataforma.</li>
              <li>Cancelar su suscripción, si corresponde.</li>
              <li>Eliminar su cuenta cuando así lo desee.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.6 Versiones anteriores</h3>
            <p>Prompt Studio podrá conservar versiones anteriores de estos Términos con fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento legal.</li>
              <li>Auditorías.</li>
              <li>Resolución de controversias.</li>
              <li>Investigación de incidentes.</li>
              <li>Conservación de evidencia contractual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.7 Servicios nuevos</h3>
            <p>Cuando Prompt Studio incorpore nuevos productos o funcionalidades, podrá publicar condiciones específicas aplicables exclusivamente a dichos servicios.</p>
            <p>En caso de conflicto entre una condición específica y estos Términos, prevalecerá la condición particular respecto del servicio correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">35.8 Separación de modificaciones</h3>
            <p>Si una autoridad competente declarara inválida alguna modificación realizada a estos Términos, el resto de las disposiciones continuará plenamente vigente, salvo que dicha autoridad determine expresamente lo contrario.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 36. Comunicaciones Electrónicas
              </h2>
            </section>
            <p>El usuario acepta que Prompt Studio pueda realizar comunicaciones relacionadas con la Plataforma mediante medios electrónicos.</p>
            <p>Estas comunicaciones tendrán la misma validez jurídica que las realizadas por escrito cuando la legislación aplicable así lo permita.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.1 Medios de comunicación</h3>
            <p>Prompt Studio podrá comunicarse con el usuario mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correo electrónico.</li>
              <li>Notificaciones dentro de la Plataforma.</li>
              <li>Avisos en el sitio web.</li>
              <li>Panel de usuario.</li>
              <li>Mensajes relacionados con la cuenta.</li>
              <li>Otros medios electrónicos razonablemente apropiados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.2 Comunicaciones obligatorias</h3>
            <p>Prompt Studio podrá enviar comunicaciones relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seguridad de la cuenta.</li>
              <li>Confirmación de compras.</li>
              <li>Renovaciones de suscripciones.</li>
              <li>Facturación.</li>
              <li>Cambios importantes en los servicios.</li>
              <li>Modificaciones de estos Términos.</li>
              <li>Cambios en la Política de Privacidad.</li>
              <li>Actualizaciones críticas de seguridad.</li>
            </ul>
            <p>Estas comunicaciones podrán enviarse incluso cuando el usuario haya cancelado el envío de mensajes promocionales, siempre que sean necesarias para la prestación del servicio o el cumplimiento de obligaciones legales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.3 Comunicaciones comerciales</h3>
            <p>Prompt Studio podrá enviar información promocional, boletines informativos, novedades y ofertas comerciales únicamente cuando exista una base legal para ello.</p>
            <p>El usuario podrá dejar de recibir estas comunicaciones utilizando el enlace de cancelación incluido en los correos electrónicos o mediante la configuración de su cuenta, cuando dicha funcionalidad esté disponible.</p>
            <p>La cancelación de comunicaciones comerciales no afectará el envío de comunicaciones operativas esenciales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.4 Exactitud del correo electrónico</h3>
            <p>El usuario es responsable de mantener actualizada la dirección de correo electrónico asociada a su cuenta.</p>
            <p>Prompt Studio no será responsable por la falta de recepción de comunicaciones cuando el usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcione un correo electrónico incorrecto.</li>
              <li>No actualice su dirección de correo.</li>
              <li>Bloquee los mensajes enviados por Prompt Studio.</li>
              <li>Configure filtros que impidan la recepción de los correos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.5 Validez de las notificaciones</h3>
            <p>Se considerará que una comunicación ha sido correctamente realizada cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Haya sido enviada al correo electrónico registrado por el usuario.</li>
              <li>Se publique en la cuenta del usuario cuando corresponda.</li>
              <li>Se publique en la Plataforma en los casos previstos por estos Términos.</li>
            </ul>
            <p>La falta de lectura por parte del usuario no invalidará la comunicación cuando ésta haya sido enviada conforme a estos procedimientos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.6 Conservación de comunicaciones</h3>
            <p>Prompt Studio podrá conservar registros relacionados con comunicaciones enviadas a los usuarios para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Demostrar el cumplimiento de obligaciones legales.</li>
              <li>Resolver controversias.</li>
              <li>Investigar incidentes de seguridad.</li>
              <li>Atender reclamaciones.</li>
              <li>Cumplir obligaciones regulatorias.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.7 Idioma de las comunicaciones</h3>
            <p>Las comunicaciones oficiales podrán realizarse en español o en otros idiomas disponibles en la Plataforma.</p>
            <p>En caso de discrepancia entre versiones traducidas, prevalecerá la versión originalmente publicada por Prompt Studio, salvo que la legislación aplicable disponga otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">36.8 Contacto oficial</h3>
            <p>Para cualquier consulta relacionada con estos Términos y Condiciones, el usuario podrá comunicarse con:</p>
            <p>Prompt Studio</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 37. Ley Aplicable
              </h2>
            </section>
            <p>Los presentes Términos y Condiciones se regirán e interpretarán conforme a la legislación aplicable al operador de la Plataforma, sin perjuicio de los derechos irrenunciables que las leyes de protección al consumidor o de protección de datos personales otorguen a los usuarios en su jurisdicción de residencia.</p>
            <p>Prompt Studio procura cumplir con la normativa aplicable en los países donde presta sus servicios, especialmente en materia de comercio electrónico, protección de datos personales y propiedad intelectual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.1 Legislación principal</h3>
            <p>Salvo disposición legal imperativa en contrario, estos Términos y Condiciones se regirán por las leyes del Estado de Nueva York, Estados Unidos de América, sin aplicación de sus normas sobre conflicto de leyes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.2 Derechos del consumidor</h3>
            <p>Nada de lo dispuesto en estos Términos limitará los derechos irrenunciables que correspondan a los consumidores conforme a la legislación obligatoria de su país de residencia.</p>
            <p>Cuando una norma de protección al consumidor establezca mayores garantías, dicha normativa prevalecerá en la medida exigida por la ley.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.3 Protección de datos</h3>
            <p>El tratamiento de datos personales continuará regulándose por la Política de Privacidad de Prompt Studio y por la legislación aplicable, incluyendo cuando corresponda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reglamento General de Protección de Datos (RGPD/GDPR).</li>
              <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</li>
              <li>California Consumer Privacy Act (CCPA).</li>
              <li>California Privacy Rights Act (CPRA).</li>
              <li>Otras normas obligatorias de protección de datos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.4 Propiedad intelectual</h3>
            <p>Las cuestiones relacionadas con derechos de autor, licencias, marcas registradas y demás derechos de propiedad intelectual se regirán por la legislación aplicable en la jurisdicción competente y por los tratados internacionales vigentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.5 Comercio electrónico</h3>
            <p>Las operaciones realizadas a través de Prompt Studio estarán sujetas a la legislación aplicable en materia de comercio electrónico, contratación electrónica y protección del consumidor.</p>
            <p>Las compras efectuadas mediante la Plataforma tendrán plena validez jurídica cuando cumplan los requisitos legales correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.6 Interpretación</h3>
            <p>Estos Términos deberán interpretarse de buena fe y conforme a su finalidad.</p>
            <p>Los títulos utilizados en cada sección tienen únicamente fines organizativos y no modificarán el significado jurídico de las disposiciones correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.7 Nulidad parcial</h3>
            <p>Si alguna disposición de estos Términos fuese declarada inválida, ilegal o inaplicable por una autoridad competente, dicha circunstancia no afectará la validez del resto del documento.</p>
            <p>Las disposiciones restantes continuarán plenamente vigentes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">37.8 Aplicación internacional</h3>
            <p>Prompt Studio presta servicios a usuarios ubicados en distintos países.</p>
            <p>Cuando la legislación local del usuario establezca normas obligatorias que no puedan ser excluidas mediante contrato, dichas normas prevalecerán únicamente en el alcance exigido por la ley.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 38. Resolución de Controversias
              </h2>
            </section>
            <p>Prompt Studio busca resolver cualquier desacuerdo con sus usuarios de manera rápida, transparente y amistosa.</p>
            <p>Antes de iniciar procedimientos judiciales o administrativos, las partes procurarán resolver la controversia mediante comunicación directa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.1 Contacto previo</h3>
            <p>Si el usuario considera que existe un problema relacionado con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Su cuenta.</li>
              <li>Una compra.</li>
              <li>Una suscripción.</li>
              <li>Un recurso digital.</li>
              <li>La propiedad intelectual.</li>
              <li>La privacidad.</li>
              <li>El funcionamiento de la Plataforma.</li>
            </ul>
            <p>deberá contactar inicialmente a Prompt Studio mediante:</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio realizará esfuerzos razonables para responder dentro de un plazo adecuado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.2 Negociación amistosa</h3>
            <p>Las partes procurarán resolver cualquier controversia mediante negociaciones de buena fe antes de acudir a procedimientos judiciales.</p>
            <p>El objetivo será encontrar una solución rápida y razonable para ambas partes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.3 Jurisdicción competente</h3>
            <p>Salvo que una norma imperativa establezca otra competencia obligatoria, cualquier controversia derivada de estos Términos será sometida a los tribunales competentes del Estado de Nueva York, Estados Unidos de América.</p>
            <p>Nada de lo anterior limitará los derechos irrenunciables que la legislación de protección al consumidor otorgue al usuario en su lugar de residencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.4 Protección al consumidor</h3>
            <p>Cuando el usuario tenga la condición de consumidor y la legislación aplicable le permita presentar reclamaciones ante los tribunales de su lugar de residencia, dicha posibilidad no quedará limitada por estos Términos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.5 Medidas cautelares</h3>
            <p>Prompt Studio podrá solicitar medidas cautelares o de protección urgente cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger su propiedad intelectual.</li>
              <li>Evitar el uso fraudulento de la Plataforma.</li>
              <li>Prevenir daños irreparables.</li>
              <li>Proteger información confidencial.</li>
              <li>Salvaguardar la seguridad de los usuarios.</li>
            </ul>
            <p>Estas medidas podrán solicitarse ante cualquier autoridad competente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.6 Costas</h3>
            <p>Cada parte asumirá sus propios gastos relacionados con la resolución de una controversia, salvo que una resolución judicial o la legislación aplicable dispongan expresamente otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.7 Conservación de evidencia</h3>
            <p>Prompt Studio podrá conservar registros relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras.</li>
              <li>Accesos.</li>
              <li>Comunicaciones.</li>
              <li>Actividad de la cuenta.</li>
              <li>Historial de suscripciones.</li>
              <li>Registros de seguridad.</li>
            </ul>
            <p>Estos registros podrán utilizarse como evidencia en procedimientos administrativos o judiciales cuando resulte legalmente procedente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">38.8 Supervivencia</h3>
            <p>Las disposiciones relativas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Propiedad intelectual.</li>
              <li>Limitación de responsabilidad.</li>
              <li>Indemnización.</li>
              <li>Protección de datos.</li>
              <li>Resolución de controversias.</li>
            </ul>
            <p>continuarán vigentes incluso después de la cancelación de la cuenta o de la terminación de la relación contractual entre el usuario y Prompt Studio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 39. Vigencia
              </h2>
            </section>
            <p>Los presentes Términos y Condiciones entrarán en vigor desde el momento en que el usuario acceda, navegue, cree una cuenta, utilice cualquiera de los servicios de Prompt Studio o realice una compra dentro de la Plataforma.</p>
            <p>La aceptación de estos Términos constituye un acuerdo legalmente vinculante entre el usuario y Magzin LLC.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.1 Entrada en vigor</h3>
            <p>Estos Términos serán aplicables desde la fecha de su publicación oficial en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización se indicará al inicio o al final del presente documento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.2 Duración</h3>
            <p>Estos Términos permanecerán vigentes mientras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario mantenga una cuenta activa.</li>
              <li>Utilice cualquier servicio de Prompt Studio.</li>
              <li>Posea licencias válidas sobre recursos digitales.</li>
              <li>Existan obligaciones legales pendientes entre las partes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.3 Terminación</h3>
            <p>La vigencia de estos Términos respecto de un usuario finalizará cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario elimine definitivamente su cuenta.</li>
              <li>Prompt Studio cancele la cuenta conforme a estos Términos.</li>
              <li>Finalicen todas las obligaciones contractuales entre las partes.</li>
            </ul>
            <p>No obstante, determinadas cláusulas continuarán vigentes por su naturaleza.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.4 Cláusulas que sobreviven</h3>
            <p>Continuarán produciendo efectos incluso después de la terminación del contrato, entre otras, las disposiciones relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Propiedad intelectual.</li>
              <li>Licencias.</li>
              <li>Protección de datos.</li>
              <li>Confidencialidad.</li>
              <li>Limitación de responsabilidad.</li>
              <li>Indemnización.</li>
              <li>Resolución de controversias.</li>
              <li>Conservación de registros.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.5 Cambios legislativos</h3>
            <p>Cuando una modificación legislativa haga necesario adaptar estos Términos, Prompt Studio podrá actualizarlos conforme a la Sección 35.</p>
            <p>Las nuevas disposiciones entrarán en vigor conforme a lo establecido en dichos procedimientos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.6 Continuidad del servicio</h3>
            <p>La finalización de un servicio específico no implicará necesariamente la terminación del resto de los servicios ofrecidos por Prompt Studio.</p>
            <p>Cada producto, suscripción o funcionalidad podrá tener condiciones particulares de vigencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.7 Versiones oficiales</h3>
            <p>Prompt Studio podrá publicar estos Términos en diferentes idiomas.</p>
            <p>Salvo disposición legal en contrario, la versión publicada originalmente en español será la versión oficial para efectos de interpretación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">39.8 Aceptación continua</h3>
            <p>El uso continuado de Prompt Studio después de la entrada en vigor de estos Términos o de sus modificaciones implicará la aceptación de su versión vigente, salvo que la legislación aplicable requiera un consentimiento adicional.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 40. Disposiciones Finales
              </h2>
            </section>
            <p>Las siguientes disposiciones complementan y cierran los presentes Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.1 Acuerdo completo</h3>
            <p>Estos Términos y Condiciones, junto con la Política de Privacidad, la Política de Cookies, la Política de Reembolsos y cualquier otra política publicada por Prompt Studio, constituyen el acuerdo completo entre el usuario y Prompt Studio respecto al uso de la Plataforma.</p>
            <p>Sustituyen cualquier acuerdo, comunicación o entendimiento previo relacionado con los mismos servicios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.2 No renuncia de derechos</h3>
            <p>La falta de ejercicio o demora por parte de Prompt Studio en exigir el cumplimiento de cualquier disposición de estos Términos no constituirá una renuncia a sus derechos.</p>
            <p>Cualquier renuncia deberá realizarse expresamente y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.3 Cesión</h3>
            <p>El usuario no podrá ceder ni transferir los derechos u obligaciones derivados de estos Términos sin autorización previa y por escrito de Prompt Studio.</p>
            <p>Prompt Studio podrá ceder sus derechos u obligaciones en caso de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reestructuración empresarial.</li>
              <li>Fusión.</li>
              <li>Adquisición.</li>
              <li>Venta de activos.</li>
              <li>Cambio de control.</li>
              <li>Reorganización corporativa.</li>
            </ul>
            <p>Siempre respetando los derechos reconocidos al usuario por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.4 Independencia de las cláusulas</h3>
            <p>Si una autoridad competente declara inválida, ilegal o inaplicable alguna disposición de estos Términos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dicha disposición se interpretará en la medida necesaria para cumplir con la legislación aplicable.</li>
              <li>El resto de las cláusulas continuará plenamente vigente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.5 Idioma</h3>
            <p>Prompt Studio podrá ofrecer traducciones de estos Términos.</p>
            <p>En caso de discrepancia entre distintas versiones, prevalecerá la versión oficial publicada en español, salvo que una legislación imperativa establezca otra interpretación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.6 Contacto</h3>
            <p>Para cualquier consulta relacionada con estos Términos y Condiciones, el usuario podrá contactar a:</p>
            <p>Prompt Studio</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.7 Fecha de entrada en vigor</h3>
            <p>Fecha de entrada en vigor: 1 de enero de 2026 (o la fecha que determine Prompt Studio).</p>
            <p>Última actualización: 2026.</p>
            <p>Prompt Studio podrá actualizar este documento conforme a la Sección 35.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">40.8 Declaración final</h3>
            <p>Al acceder, registrarse, realizar compras, contratar suscripciones o utilizar cualquiera de los servicios de Prompt Studio, el usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha leído íntegramente estos Términos y Condiciones.</li>
              <li>Comprende su contenido.</li>
              <li>Acepta quedar legalmente vinculado por ellos.</li>
              <li>Se compromete a utilizarlos de buena fe.</li>
              <li>Cumplirá la legislación aplicable y las políticas de la Plataforma.</li>
            </ul>
            <p>Declaración Oficial</p>
            <p>Estos Términos y Condiciones regulan el uso de Prompt Studio, plataforma operada por Magzin LLC, dedicada a la distribución de recursos digitales, prompts, herramientas de Inteligencia Artificial, suscripciones y servicios relacionados con la creación de contenido.</p>
            <p>Todos los derechos no concedidos expresamente al usuario quedan reservados a Magzin LLC y a los respectivos titulares de los derechos de propiedad intelectual.</p>
            <p>Prompt Studio agradece la confianza depositada por sus usuarios y se compromete a mantener una plataforma segura, transparente y en constante evolución, respetando la legislación aplicable en materia de comercio electrónico, protección de datos personales, propiedad intelectual y derechos del consumidor.</p>
            <p>© 2026 Prompt Studio</p>
            <p>Operado por Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web: https://www.prompstudio.com</p>
            <p>Correo electrónico: help@prompstudio.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
