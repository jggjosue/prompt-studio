import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Política de Licencias | Prompt Studio',
  description: 'Política de Licencias de Prompt Studio.',
  alternates: {
    canonical: '/licenses',
  },
};

export default function LicensesPolicyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Política de Licencias
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Última actualización: <span className="font-medium text-foreground">2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>Bienvenido a Prompt Studio, disponible en https://www.prompstudio.com, operado por Magzin LLC, con domicilio en:</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Correo electrónico oficial:</p>
            <p>support@prompstudio.com</p>
            <p>La presente Política de Licencias regula el uso autorizado de todos los recursos digitales comercializados por Prompt Studio.</p>
            <p>Esta Política forma parte integrante de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Términos y Condiciones.</li>
              <li>Política de Privacidad.</li>
              <li>Política de No Reembolsos.</li>
              <li>Política de Cookies.</li>
              <li>Acuerdo de Suscripción Premium.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 1. Introducción
              </h2>
            </section>
            <p>Prompt Studio comercializa recursos digitales protegidos por derechos de propiedad intelectual.</p>
            <p>Entre ellos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para Inteligencia Artificial.</li>
              <li>Prompts para ChatGPT.</li>
              <li>Prompts para Google Gemini.</li>
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para programación.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Componentes visuales.</li>
              <li>Recursos descargables.</li>
              <li>Colecciones Premium.</li>
              <li>Bibliotecas digitales.</li>
            </ul>
            <p>La compra de cualquiera de estos productos no implica la transferencia de la propiedad intelectual.</p>
            <p>Únicamente concede una licencia limitada de uso conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.1 Objetivo</h3>
            <p>Esta Política tiene como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger la propiedad intelectual.</li>
              <li>Definir claramente los derechos del comprador.</li>
              <li>Establecer los usos permitidos.</li>
              <li>Establecer los usos prohibidos.</li>
              <li>Regular las licencias comerciales.</li>
              <li>Evitar la redistribución ilegal.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.2 Alcance</h3>
            <p>Esta Política aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Productos gratuitos.</li>
              <li>Productos Premium.</li>
              <li>Recursos descargables.</li>
              <li>Recursos HTML.</li>
              <li>Prompts.</li>
              <li>Videos.</li>
              <li>Imágenes.</li>
              <li>Colecciones.</li>
              <li>Recursos obtenidos mediante suscripción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.3 Propiedad</h3>
            <p>Todos los recursos publicados en Prompt Studio pertenecen a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Magzin LLC</li>
              <li>Prompt Studio</li>
              <li>Sus respectivos autores</li>
              <li>O los licenciantes correspondientes.</li>
            </ul>
            <p>Salvo que se indique expresamente otra cosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.4 Compra</h3>
            <p>Cuando el usuario adquiere un recurso obtiene:</p>
            <p>Una licencia de uso.</p>
            <p>No adquiere:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Derechos de autor.</li>
              <li>Derechos exclusivos.</li>
              <li>Marcas.</li>
              <li>Patentes.</li>
              <li>Propiedad intelectual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.5 Derechos reservados</h3>
            <p>Todos los derechos que no hayan sido concedidos expresamente mediante esta Política permanecen reservados a:</p>
            <p>Magzin LLC</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.6 Buena fe</h3>
            <p>El usuario utilizará los recursos adquiridos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Legalmente.</li>
              <li>Éticamente.</li>
              <li>Conforme a esta Política.</li>
              <li>Conforme a la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.7 Relación con otros documentos</h3>
            <p>Esta Política deberá interpretarse junto con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Términos y Condiciones.</li>
              <li>Política de Privacidad.</li>
              <li>Política de No Reembolsos.</li>
              <li>Política de Cookies.</li>
              <li>Acuerdo de Suscripción Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.8 Contacto</h3>
            <p>Para cualquier consulta relacionada con licencias:</p>
            <p>Prompt Studio</p>
            <p>https://www.prompstudio.com</p>
            <p>support@prompstudio.com</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 2. Definiciones
              </h2>
            </section>
            <p>Para efectos de esta Política:</p>
            <p>Licencia</p>
            <p>Permiso limitado para utilizar un recurso digital.</p>
            <p>Producto Digital</p>
            <p>Cualquier recurso distribuido electrónicamente mediante Prompt Studio.</p>
            <p>Prompt</p>
            <p>Conjunto de instrucciones destinadas a un modelo de Inteligencia Artificial.</p>
            <p>Contenido</p>
            <p>Todo recurso disponible dentro de Prompt Studio.</p>
            <p>Usuario</p>
            <p>Persona que utiliza Prompt Studio.</p>
            <p>Comprador</p>
            <p>Usuario que adquiere un recurso.</p>
            <p>Licencia Comercial</p>
            <p>Licencia que permite determinados usos con fines comerciales conforme a esta Política.</p>
            <p>Redistribución</p>
            <p>Entrega, venta, publicación o compartición de un recurso con terceros.</p>
            <p>Obra Derivada</p>
            <p>Contenido creado utilizando un recurso adquirido.</p>
            <p>Inteligencia Artificial</p>
            <p>Modelos capaces de generar texto, imágenes, video, audio o código a partir de instrucciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Interpretación</h3>
            <p>Las definiciones contenidas en esta Política se utilizarán para interpretar correctamente los derechos y obligaciones relacionados con el uso de los recursos digitales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Neutralidad tecnológica</h3>
            <p>Las referencias realizadas a modelos de Inteligencia Artificial incluyen tanto tecnologías actuales como futuras que permitan generar contenido mediante instrucciones o prompts.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Licencia y propiedad</h3>
            <p>En ningún caso una licencia otorgará la propiedad intelectual del recurso.</p>
            <p>La propiedad permanecerá siempre en poder de su titular.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Recursos gratuitos</h3>
            <p>Los recursos gratuitos continúan protegidos por derechos de autor y están sujetos a esta Política, salvo que se indique expresamente una licencia diferente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Recursos Premium</h3>
            <p>Los recursos Premium únicamente podrán utilizarse conforme a la licencia adquirida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.6 Terceros</h3>
            <p>Cuando un recurso incorpore contenido licenciado por terceros, también deberán respetarse las condiciones establecidas por dichos titulares.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.7 Actualizaciones</h3>
            <p>Las definiciones podrán ampliarse cuando Prompt Studio incorpore nuevos tipos de recursos digitales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.8 Prevalencia</h3>
            <p>En caso de conflicto entre esta Política y la descripción específica de un producto, prevalecerán las condiciones particulares publicadas para dicho producto.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 3. Tipos de Licencias Disponibles
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer distintos tipos de licencias para adaptarse a las necesidades de cada usuario, empresa o proyecto.</p>
            <p>La licencia aplicable a cada recurso será la que se indique expresamente en la página del producto al momento de la compra.</p>
            <p>Salvo que se indique lo contrario, todas las licencias son:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No exclusivas.</li>
              <li>No transferibles.</li>
              <li>Revocables en los casos previstos en los Términos y Condiciones.</li>
              <li>Limitadas al alcance expresamente autorizado.</li>
            </ul>
            <p>La compra de un recurso no transfiere la propiedad intelectual, únicamente concede un permiso de uso conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.1 Licencias disponibles</h3>
            <p>Prompt Studio podrá ofrecer una o varias de las siguientes modalidades:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Licencia Gratuita (Free License)</li>
              <li>Licencia Personal (Personal License)</li>
              <li>Licencia Comercial (Commercial License)</li>
              <li>Licencia Agencia (Agency License)</li>
              <li>Licencia Empresarial (Enterprise License)</li>
            </ul>
            <p>No todos los productos estarán disponibles bajo todas las modalidades.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.2 Licencia Gratuita</h3>
            <p>Los recursos gratuitos podrán utilizarse conforme a las condiciones específicas indicadas para cada producto.</p>
            <p>Salvo autorización expresa, los recursos gratuitos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No podrán revenderse.</li>
              <li>No podrán redistribuirse.</li>
              <li>No podrán publicarse como propios.</li>
              <li>No podrán utilizarse para crear un marketplace competidor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.3 Licencia Personal</h3>
            <p>La Licencia Personal permite utilizar el recurso únicamente para proyectos propios del comprador y sin fines de redistribución del recurso original.</p>
            <p>Esta licencia está orientada a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Estudiantes.</li>
              <li>Creadores individuales.</li>
              <li>Freelancers.</li>
              <li>Usuarios particulares.</li>
              <li>Personas que desean aprender o experimentar con Inteligencia Artificial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.4 Licencia Comercial</h3>
            <p>La Licencia Comercial permite utilizar el recurso en actividades con fines lucrativos, respetando siempre las limitaciones establecidas en esta Política.</p>
            <p>Por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proyectos para clientes.</li>
              <li>Contenido comercial.</li>
              <li>Desarrollo de aplicaciones.</li>
              <li>Marketing.</li>
              <li>Publicidad.</li>
              <li>Producción audiovisual.</li>
            </ul>
            <p>La licencia comercial no autoriza la reventa del prompt.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.5 Licencia Agencia</h3>
            <p>La Licencia Agencia está diseñada para empresas o agencias que crean proyectos para múltiples clientes.</p>
            <p>Podrá permitir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso por varios integrantes del equipo.</li>
              <li>Desarrollo de proyectos comerciales.</li>
              <li>Prestación de servicios profesionales.</li>
            </ul>
            <p>El número máximo de usuarios autorizados será el indicado en la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.6 Licencia Enterprise</h3>
            <p>La Licencia Enterprise está destinada a organizaciones que requieren un uso corporativo más amplio.</p>
            <p>Podrá incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Equipos numerosos.</li>
              <li>Uso interno empresarial.</li>
              <li>Integraciones corporativas.</li>
              <li>Licencias multiusuario.</li>
              <li>Condiciones personalizadas.</li>
            </ul>
            <p>Las condiciones específicas podrán negociarse individualmente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.7 Licencias personalizadas</h3>
            <p>Prompt Studio podrá conceder licencias especiales adaptadas a proyectos concretos cuando exista un acuerdo escrito entre las partes.</p>
            <p>Estas licencias prevalecerán sobre las disposiciones generales únicamente respecto al producto y alcance expresamente autorizados.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.8 Modificación de las modalidades</h3>
            <p>Prompt Studio podrá incorporar nuevas modalidades de licencia, modificar las existentes o dejar de ofrecer determinadas licencias para futuras compras.</p>
            <p>Las modificaciones no afectarán retroactivamente a las licencias válidamente adquiridas antes de dichos cambios, salvo obligación legal.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 4. Licencia Personal
              </h2>
            </section>
            <p>La Licencia Personal concede al comprador un derecho limitado para utilizar el recurso adquirido en proyectos propios, sin autorizar la redistribución del recurso original.</p>
            <p>Esta licencia constituye la modalidad básica ofrecida por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.1 Usos permitidos</h3>
            <p>Con una Licencia Personal, el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar el prompt para fines personales.</li>
              <li>Aprender sobre Inteligencia Artificial.</li>
              <li>Crear proyectos propios.</li>
              <li>Experimentar con modelos de IA.</li>
              <li>Generar imágenes, texto, código o video para uso personal.</li>
              <li>Modificar el prompt para uso privado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.2 Uso educativo</h3>
            <p>El recurso podrá utilizarse para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Formación.</li>
              <li>Cursos.</li>
              <li>Investigación.</li>
              <li>Aprendizaje.</li>
              <li>Desarrollo de habilidades.</li>
            </ul>
            <p>Siempre respetando las limitaciones de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.3 Creación de contenido</h3>
            <p>El usuario podrá utilizar el prompt para generar contenido destinado a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Redes sociales personales.</li>
              <li>Blogs personales.</li>
              <li>Portafolios.</li>
              <li>Proyectos privados.</li>
            </ul>
            <p>Siempre que no redistribuya el prompt original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.4 Modificaciones</h3>
            <p>El comprador podrá adaptar el prompt para su propio uso.</p>
            <p>Las modificaciones realizadas no eliminan la protección sobre el recurso original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.5 Restricciones</h3>
            <p>La Licencia Personal no permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender el prompt.</li>
              <li>Compartir el archivo original.</li>
              <li>Publicar el prompt completo en Internet.</li>
              <li>Distribuir el recurso a terceros.</li>
              <li>Crear productos competidores utilizando el recurso adquirido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.6 Transferencia</h3>
            <p>La Licencia Personal es exclusiva para el comprador.</p>
            <p>No podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cederse.</li>
              <li>Prestarse.</li>
              <li>Alquilarse.</li>
              <li>Revenderse.</li>
              <li>Compartirse con terceros.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.7 Proyectos para clientes</h3>
            <p>La Licencia Personal no autoriza el uso del recurso para desarrollar trabajos remunerados para clientes.</p>
            <p>Para ese tipo de actividades será necesaria una Licencia Comercial o superior.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.8 Conservación de derechos</h3>
            <p>Todos los derechos de propiedad intelectual sobre el recurso original continuarán perteneciendo a Prompt Studio, Magzin LLC o al titular correspondiente.</p>
            <p>La Licencia Personal concede únicamente un permiso limitado de uso y no implica cesión alguna de dichos derechos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 5. Licencia Comercial
              </h2>
            </section>
            <p>La Licencia Comercial permite al comprador utilizar un recurso digital de Prompt Studio en proyectos con fines lucrativos, siempre dentro de los límites establecidos por esta Política.</p>
            <p>Esta licencia está dirigida a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Freelancers.</li>
              <li>Consultores.</li>
              <li>Diseñadores.</li>
              <li>Desarrolladores.</li>
              <li>Empresas.</li>
              <li>Creadores de contenido.</li>
              <li>Profesionales independientes.</li>
            </ul>
            <p>La Licencia Comercial no concede derechos de propiedad intelectual sobre el recurso adquirido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.1 Usos permitidos</h3>
            <p>Con una Licencia Comercial el usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar prompts para generar contenido destinado a clientes.</li>
              <li>Crear imágenes comerciales.</li>
              <li>Crear videos comerciales.</li>
              <li>Crear contenido para redes sociales.</li>
              <li>Desarrollar aplicaciones.</li>
              <li>Crear sitios web.</li>
              <li>Desarrollar campañas publicitarias.</li>
              <li>Utilizar el recurso en actividades profesionales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.2 Productos derivados</h3>
            <p>El usuario podrá comercializar los resultados obtenidos mediante el uso del prompt, incluyendo, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imágenes generadas.</li>
              <li>Videos generados.</li>
              <li>Texto generado.</li>
              <li>Aplicaciones desarrolladas.</li>
              <li>Sitios web desarrollados.</li>
              <li>Material publicitario.</li>
              <li>Presentaciones.</li>
              <li>Contenido multimedia.</li>
            </ul>
            <p>Siempre que el recurso original (prompt o archivo adquirido) no sea redistribuido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.3 Trabajo para clientes</h3>
            <p>La Licencia Comercial autoriza utilizar el recurso para desarrollar trabajos remunerados para clientes.</p>
            <p>Ejemplos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear un sitio web para un cliente utilizando un prompt adquirido.</li>
              <li>Generar imágenes para campañas publicitarias.</li>
              <li>Crear videos promocionales.</li>
              <li>Elaborar contenido para redes sociales.</li>
              <li>Generar documentación técnica.</li>
              <li>Crear materiales educativos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.4 Número de clientes</h3>
            <p>Salvo que la descripción del producto establezca otra limitación, la Licencia Comercial permite utilizar el recurso para múltiples proyectos y múltiples clientes.</p>
            <p>No obstante, cada cliente no adquiere derechos sobre el prompt original, sino únicamente sobre el trabajo final desarrollado para él.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.5 Restricciones</h3>
            <p>La Licencia Comercial no permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender el prompt.</li>
              <li>Publicar el prompt completo.</li>
              <li>Compartir el archivo descargado.</li>
              <li>Distribuir el recurso original.</li>
              <li>Revender colecciones de prompts.</li>
              <li>Publicar el recurso en otros marketplaces.</li>
              <li>Comercializar el prompt como si fuera propio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.6 Inteligencia Artificial</h3>
            <p>Los prompts podrán utilizarse con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ChatGPT.</li>
              <li>Google Gemini.</li>
              <li>Claude.</li>
              <li>Mistral.</li>
              <li>Llama.</li>
              <li>Midjourney.</li>
              <li>Stable Diffusion.</li>
              <li>Flux.</li>
              <li>Runway.</li>
              <li>Otros modelos de IA compatibles.</li>
            </ul>
            <p>Siempre respetando los términos de uso de dichas plataformas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.7 Limitaciones</h3>
            <p>La Licencia Comercial no autoriza:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear un marketplace de prompts.</li>
              <li>Crear una biblioteca pública utilizando los prompts originales.</li>
              <li>Compartir bases de datos completas de recursos adquiridos.</li>
              <li>Revender el contenido original en formato digital.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.8 Conservación de derechos</h3>
            <p>Prompt Studio conserva todos los derechos sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El prompt.</li>
              <li>La estructura.</li>
              <li>El contenido original.</li>
              <li>Las colecciones.</li>
              <li>Los archivos descargables.</li>
            </ul>
            <p>El comprador únicamente adquiere el derecho de uso establecido en esta licencia.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 6. Licencia Agencia
              </h2>
            </section>
            <p>La Licencia Agencia está destinada a estudios creativos, agencias de marketing, agencias digitales, consultoras y organizaciones que desarrollan proyectos para múltiples clientes mediante equipos de trabajo.</p>
            <p>Esta licencia amplía el alcance de la Licencia Comercial, permitiendo el uso colaborativo del recurso dentro de una misma organización.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.1 Usuarios autorizados</h3>
            <p>La Licencia Agencia permite que un equipo interno utilice el recurso adquirido.</p>
            <p>El número máximo de usuarios autorizados será el indicado expresamente en la licencia correspondiente.</p>
            <p>Salvo disposición distinta, la licencia no autoriza el acceso ilimitado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.2 Uso colaborativo</h3>
            <p>Los integrantes autorizados del equipo podrán utilizar el recurso para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Desarrollar proyectos comerciales.</li>
              <li>Crear campañas publicitarias.</li>
              <li>Generar contenido para clientes.</li>
              <li>Desarrollar software.</li>
              <li>Diseñar sitios web.</li>
              <li>Crear materiales audiovisuales.</li>
            </ul>
            <p>Siempre dentro de la misma organización.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.3 Clientes múltiples</h3>
            <p>La Licencia Agencia permite utilizar un mismo recurso para desarrollar proyectos destinados a múltiples clientes.</p>
            <p>No obstante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El recurso original seguirá perteneciendo a Prompt Studio.</li>
              <li>Los clientes no recibirán el prompt original.</li>
              <li>Los clientes únicamente recibirán el resultado final del trabajo contratado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.4 Restricciones</h3>
            <p>La Licencia Agencia no permite:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compartir el recurso con empresas ajenas.</li>
              <li>Revender la licencia.</li>
              <li>Transferir el recurso a clientes.</li>
              <li>Publicar el prompt completo.</li>
              <li>Redistribuir el archivo adquirido.</li>
              <li>Crear bibliotecas públicas del contenido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.5 Filiales</h3>
            <p>Salvo que la licencia lo indique expresamente, una Licencia Agencia no autoriza el uso por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Empresas vinculadas.</li>
              <li>Filiales.</li>
              <li>Sociedades independientes.</li>
              <li>Socios comerciales externos.</li>
            </ul>
            <p>Cada entidad jurídica deberá contar con su propia licencia cuando corresponda.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.6 Seguridad interna</h3>
            <p>La organización deberá adoptar medidas razonables para impedir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Copias no autorizadas.</li>
              <li>Compartición con terceros.</li>
              <li>Publicaciones no permitidas.</li>
              <li>Accesos fuera del equipo autorizado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.7 Responsabilidad</h3>
            <p>La empresa titular de la Licencia Agencia será responsable del cumplimiento de esta Política por parte de todos los usuarios autorizados que utilicen el recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.8 Conservación de derechos</h3>
            <p>La concesión de una Licencia Agencia no implica:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cesión de propiedad intelectual.</li>
              <li>Exclusividad.</li>
              <li>Derecho a sublicenciar.</li>
              <li>Derecho a redistribuir el recurso original.</li>
            </ul>
            <p>Todos los derechos continúan perteneciendo a Prompt Studio, Magzin LLC o al titular correspondiente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 7. Licencia Enterprise
              </h2>
            </section>
            <p>La Licencia Enterprise está diseñada para organizaciones, instituciones, universidades, empresas y corporaciones que requieren utilizar los recursos de Prompt Studio a gran escala.</p>
            <p>Esta licencia ofrece un alcance más amplio que las modalidades Personal, Comercial y Agencia, permitiendo el uso por múltiples usuarios dentro de una misma organización, conforme a las condiciones expresamente pactadas.</p>
            <p>La Licencia Enterprise únicamente estará disponible cuando Prompt Studio la ofrezca expresamente o mediante un acuerdo comercial específico.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 Usuarios autorizados</h3>
            <p>La Licencia Enterprise podrá autorizar el uso del recurso por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Empresas.</li>
              <li>Corporaciones.</li>
              <li>Instituciones educativas.</li>
              <li>Organizaciones sin fines de lucro.</li>
              <li>Dependencias gubernamentales cuando sea aplicable.</li>
              <li>Equipos internos de gran tamaño.</li>
            </ul>
            <p>El número máximo de usuarios autorizados será el indicado en el contrato o en la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Uso interno</h3>
            <p>La organización podrá utilizar los recursos licenciados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Capacitación interna.</li>
              <li>Automatización de procesos.</li>
              <li>Desarrollo de software.</li>
              <li>Generación de contenido.</li>
              <li>Marketing.</li>
              <li>Investigación.</li>
              <li>Documentación.</li>
              <li>Operaciones comerciales.</li>
            </ul>
            <p>Siempre dentro del alcance autorizado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Equipos</h3>
            <p>La Licencia Enterprise podrá permitir que varios empleados utilicen un mismo recurso.</p>
            <p>No obstante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El acceso deberá limitarse al personal autorizado.</li>
              <li>No podrá compartirse con terceros ajenos a la organización.</li>
              <li>Cada usuario deberá cumplir esta Política.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Filiales</h3>
            <p>Salvo que el contrato establezca expresamente lo contrario, la Licencia Enterprise únicamente cubrirá a la entidad jurídica que la haya adquirido.</p>
            <p>Las empresas filiales, subsidiarias, matrices o vinculadas deberán contar con una autorización específica si desean utilizar los mismos recursos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Integraciones</h3>
            <p>Cuando la licencia lo permita, los recursos podrán integrarse en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sistemas internos.</li>
              <li>Plataformas corporativas.</li>
              <li>Herramientas empresariales.</li>
              <li>Procesos automatizados.</li>
              <li>Soluciones basadas en Inteligencia Artificial.</li>
            </ul>
            <p>Estas integraciones no implican cesión de la propiedad intelectual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Auditoría</h3>
            <p>Prompt Studio podrá solicitar información razonable para verificar que el uso realizado por una organización se encuentra dentro del alcance de la licencia adquirida.</p>
            <p>La información solicitada se limitará a lo estrictamente necesario para dicha verificación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Restricciones</h3>
            <p>La Licencia Enterprise no autoriza, salvo pacto expreso:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender los prompts.</li>
              <li>Redistribuir los archivos originales.</li>
              <li>Publicar bibliotecas de recursos.</li>
              <li>Transferir la licencia a terceros.</li>
              <li>Comercializar el contenido original.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Derechos reservados</h3>
            <p>Todos los derechos de propiedad intelectual permanecerán siendo propiedad de Prompt Studio, Magzin LLC o del titular correspondiente.</p>
            <p>La Licencia Enterprise únicamente concede un derecho de uso limitado conforme al acuerdo celebrado.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 8. Licencias Personalizadas
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer licencias personalizadas para proyectos que requieran condiciones distintas a las previstas en las modalidades estándar.</p>
            <p>Estas licencias se formalizarán mediante un acuerdo específico celebrado entre Prompt Studio y el cliente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.1 Casos aplicables</h3>
            <p>Podrán concederse licencias personalizadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Grandes empresas.</li>
              <li>Plataformas SaaS.</li>
              <li>Instituciones educativas.</li>
              <li>Editoriales.</li>
              <li>Organizaciones internacionales.</li>
              <li>Agencias con necesidades especiales.</li>
              <li>Proyectos tecnológicos de gran escala.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.2 Alcance</h3>
            <p>Una licencia personalizada podrá regular aspectos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de usuarios.</li>
              <li>Alcance territorial.</li>
              <li>Duración.</li>
              <li>Tipo de uso.</li>
              <li>Integraciones permitidas.</li>
              <li>Restricciones adicionales.</li>
              <li>Condiciones económicas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.3 Acuerdo escrito</h3>
            <p>Toda licencia personalizada deberá constar por escrito.</p>
            <p>Ninguna comunicación verbal o informal modificará las condiciones de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.4 Prioridad</h3>
            <p>Cuando exista una licencia personalizada válida, sus condiciones prevalecerán sobre esta Política únicamente respecto al recurso y alcance expresamente regulados.</p>
            <p>El resto de las disposiciones continuará siendo aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.5 No exclusividad</h3>
            <p>Salvo que el acuerdo indique expresamente lo contrario, las licencias personalizadas seguirán siendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No exclusivas.</li>
              <li>No transferibles.</li>
              <li>Limitadas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.6 Modificaciones</h3>
            <p>Las licencias personalizadas únicamente podrán modificarse mediante acuerdo escrito entre Prompt Studio y el cliente correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.7 Terminación</h3>
            <p>Cuando una licencia personalizada finalice:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cesarán los derechos de uso concedidos.</li>
              <li>El cliente deberá respetar las obligaciones posteriores previstas en el contrato.</li>
              <li>Continuarán vigentes las cláusulas relativas a propiedad intelectual, confidencialidad y limitación de responsabilidad cuando resulte aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.8 Conservación de derechos</h3>
            <p>La existencia de una licencia personalizada no implica la transferencia de la propiedad intelectual sobre los recursos licenciados.</p>
            <p>Todos los derechos no concedidos expresamente permanecerán reservados a Prompt Studio, Magzin LLC o al titular correspondiente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 9. Usos Permitidos
              </h2>
            </section>
            <p>Prompt Studio concede al comprador una licencia limitada para utilizar los recursos digitales adquiridos únicamente dentro del alcance expresamente autorizado por la licencia correspondiente.</p>
            <p>Los usos permitidos dependerán del tipo de licencia adquirida (Gratuita, Personal, Comercial, Agencia, Enterprise o Personalizada).</p>
            <p>Todo uso que no haya sido autorizado expresamente mediante esta Política o mediante una licencia específica se considerará prohibido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.1 Uso con Inteligencia Artificial</h3>
            <p>El usuario podrá utilizar los prompts adquiridos con modelos de Inteligencia Artificial compatibles, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ChatGPT.</li>
              <li>Google Gemini.</li>
              <li>Claude.</li>
              <li>Mistral.</li>
              <li>Llama.</li>
              <li>Grok.</li>
              <li>Midjourney.</li>
              <li>Stable Diffusion.</li>
              <li>Flux.</li>
              <li>Runway.</li>
              <li>Veo.</li>
              <li>Sora.</li>
              <li>Otros modelos actuales o futuros.</li>
            </ul>
            <p>Siempre respetando los términos de uso de dichas plataformas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.2 Creación de contenido</h3>
            <p>El usuario podrá utilizar los recursos para generar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Código.</li>
              <li>Sitios web.</li>
              <li>Aplicaciones.</li>
              <li>Artículos.</li>
              <li>Libros.</li>
              <li>Publicaciones para redes sociales.</li>
              <li>Material educativo.</li>
              <li>Presentaciones.</li>
              <li>Contenido audiovisual.</li>
            </ul>
            <p>El contenido generado será responsabilidad exclusiva del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.3 Modificación del prompt</h3>
            <p>El comprador podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adaptar.</li>
              <li>Mejorar.</li>
              <li>Personalizar.</li>
              <li>Traducir.</li>
              <li>Combinar.</li>
            </ul>
            <p>el prompt adquirido para ajustarlo a sus propias necesidades.</p>
            <p>Estas modificaciones no eliminan la protección jurídica del recurso original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.4 Uso profesional</h3>
            <p>Cuando la licencia correspondiente lo permita, el usuario podrá utilizar los recursos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Desarrollo profesional.</li>
              <li>Consultoría.</li>
              <li>Marketing.</li>
              <li>Publicidad.</li>
              <li>Producción audiovisual.</li>
              <li>Diseño gráfico.</li>
              <li>Desarrollo de software.</li>
              <li>Automatización empresarial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.5 Uso en proyectos propios</h3>
            <p>El usuario podrá incorporar los resultados obtenidos mediante los prompts en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitios web.</li>
              <li>Aplicaciones móviles.</li>
              <li>Software.</li>
              <li>Cursos.</li>
              <li>Blogs.</li>
              <li>Videos.</li>
              <li>Campañas publicitarias.</li>
              <li>Documentación.</li>
            </ul>
            <p>Siempre que el recurso original no sea redistribuido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.6 Uso interno</h3>
            <p>Las empresas podrán utilizar los recursos adquiridos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Capacitación.</li>
              <li>Documentación.</li>
              <li>Automatización.</li>
              <li>Investigación.</li>
              <li>Desarrollo interno.</li>
              <li>Optimización de procesos.</li>
            </ul>
            <p>Cuando la licencia adquirida así lo permita.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.7 Obras derivadas</h3>
            <p>El usuario podrá crear obras derivadas utilizando los recursos licenciados.</p>
            <p>Las obras derivadas podrán comercializarse cuando la licencia correspondiente lo autorice.</p>
            <p>No obstante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El prompt original seguirá protegido.</li>
              <li>El archivo original no podrá redistribuirse.</li>
              <li>La licencia no autoriza la cesión del recurso original.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.8 Conservación de la licencia</h3>
            <p>El derecho de uso permanecerá vigente mientras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario cumpla esta Política.</li>
              <li>Respete los Términos y Condiciones.</li>
              <li>No infrinja la propiedad intelectual de Prompt Studio.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 10. Usos Prohibidos
              </h2>
            </section>
            <p>Con independencia del tipo de licencia adquirida, existen determinadas actividades que están estrictamente prohibidas para proteger la propiedad intelectual de Prompt Studio y de sus autores.</p>
            <p>Cualquier incumplimiento podrá dar lugar a la suspensión o terminación de la licencia, sin perjuicio de las acciones legales que correspondan.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.1 Reventa</h3>
            <p>Está estrictamente prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender prompts.</li>
              <li>Revender plantillas.</li>
              <li>Revender archivos originales.</li>
              <li>Revender colecciones.</li>
              <li>Revender recursos descargados.</li>
            </ul>
            <p>Aunque hayan sido modificados parcialmente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.2 Redistribución</h3>
            <p>El usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compartir el recurso original.</li>
              <li>Publicarlo en Internet.</li>
              <li>Subirlo a GitHub.</li>
              <li>Publicarlo en Google Drive.</li>
              <li>Compartirlo mediante Dropbox.</li>
              <li>Compartirlo por correo electrónico.</li>
              <li>Distribuirlo mediante redes sociales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.3 Marketplace competidor</h3>
            <p>Está prohibido utilizar los recursos de Prompt Studio para crear:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Marketplaces de prompts.</li>
              <li>Bibliotecas públicas.</li>
              <li>Bancos de prompts.</li>
              <li>Plataformas de venta de prompts.</li>
              <li>Repositorios comerciales.</li>
              <li>Servicios que redistribuyan el contenido original.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.4 Compartición de cuentas</h3>
            <p>El usuario no podrá compartir su cuenta de Prompt Studio con terceros para permitirles acceder a recursos protegidos.</p>
            <p>Cada cuenta es personal y deberá utilizarse conforme a la licencia adquirida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.5 Eliminación de avisos</h3>
            <p>Queda prohibido eliminar, ocultar o modificar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avisos de copyright.</li>
              <li>Marcas registradas.</li>
              <li>Créditos del autor.</li>
              <li>Identificadores de propiedad intelectual.</li>
            </ul>
            <p>Cuando formen parte del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.6 Ingeniería inversa</h3>
            <p>Salvo que la legislación aplicable lo permita expresamente, el usuario no podrá realizar actividades destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extraer masivamente el contenido de Prompt Studio.</li>
              <li>Automatizar la recopilación de prompts.</li>
              <li>Crear bases de datos copiando recursos de la Plataforma.</li>
              <li>Utilizar bots para descargar el catálogo completo.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.7 Uso ilegal</h3>
            <p>Los recursos de Prompt Studio no podrán utilizarse para actividades que infrinjan la legislación aplicable, incluyendo, entre otras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraude.</li>
              <li>Suplantación de identidad.</li>
              <li>Difusión de malware.</li>
              <li>Ingeniería social.</li>
              <li>Spam masivo.</li>
              <li>Actividades ilícitas.</li>
              <li>Violación de derechos de terceros.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.8 Consecuencias</h3>
            <p>El incumplimiento de cualquiera de las prohibiciones previstas en esta Política podrá dar lugar, según corresponda, a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revocación de la licencia.</li>
              <li>Suspensión de la cuenta.</li>
              <li>Cancelación del acceso.</li>
              <li>Eliminación del contenido.</li>
              <li>Reclamaciones por daños y perjuicios.</li>
              <li>Acciones civiles o penales cuando procedan.</li>
              <li>Solicitudes de retirada de contenido (DMCA u otros mecanismos legales).</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 11. Propiedad Intelectual
              </h2>
            </section>
            <p>Todos los recursos digitales publicados en Prompt Studio están protegidos por la legislación nacional e internacional sobre propiedad intelectual, derechos de autor, marcas, competencia desleal y demás normas aplicables.</p>
            <p>La adquisición de un recurso concede únicamente una licencia limitada de uso y no implica la cesión de los derechos de propiedad intelectual sobre dicho recurso.</p>
            <p>Salvo autorización expresa y por escrito, todos los derechos permanecen reservados a Prompt Studio, Magzin LLC o a los respectivos titulares.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.1 Titularidad</h3>
            <p>Los derechos de propiedad intelectual sobre los recursos disponibles en Prompt Studio pertenecen, según corresponda, a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Magzin LLC.</li>
              <li>Prompt Studio.</li>
              <li>Autores colaboradores.</li>
              <li>Licenciantes.</li>
              <li>Titulares de derechos expresamente identificados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.2 Recursos protegidos</h3>
            <p>La protección comprende, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Colecciones de prompts.</li>
              <li>Estructuras de prompts.</li>
              <li>Plantillas.</li>
              <li>Archivos HTML.</li>
              <li>Componentes web.</li>
              <li>Recursos gráficos.</li>
              <li>Videos.</li>
              <li>Imágenes.</li>
              <li>Iconos.</li>
              <li>Interfaces.</li>
              <li>Documentación.</li>
              <li>Bases de datos.</li>
              <li>Material educativo.</li>
              <li>Diseño del sitio web.</li>
              <li>Código fuente desarrollado por Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.3 Alcance de la protección</h3>
            <p>La protección jurídica podrá comprender:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La estructura del recurso.</li>
              <li>La selección del contenido.</li>
              <li>La organización.</li>
              <li>La creatividad.</li>
              <li>La redacción.</li>
              <li>La combinación de instrucciones.</li>
              <li>La presentación visual.</li>
            </ul>
            <p>Aunque determinados elementos individuales no sean protegibles por sí solos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.4 Marcas</h3>
            <p>Los siguientes signos distintivos podrán estar protegidos por la legislación aplicable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompt Studio.</li>
              <li>Magzin LLC.</li>
              <li>Logotipos.</li>
              <li>Isotipos.</li>
              <li>Nombres comerciales.</li>
              <li>Eslogan.</li>
              <li>Identidad visual.</li>
            </ul>
            <p>Su utilización requerirá autorización previa cuando la legislación así lo exija.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.5 Bases de datos</h3>
            <p>Las colecciones de recursos, catálogos y bases de datos publicadas por Prompt Studio podrán estar protegidas como bases de datos conforme a la legislación aplicable.</p>
            <p>Queda prohibida su extracción sistemática o reutilización sin autorización.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.6 Mejoras</h3>
            <p>Las mejoras realizadas por Prompt Studio sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Colecciones.</li>
              <li>Plantillas.</li>
              <li>Recursos Premium.</li>
            </ul>
            <p>continuarán siendo propiedad exclusiva de Prompt Studio, salvo pacto escrito en contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.7 Reserva de derechos</h3>
            <p>Todos los derechos que no hayan sido concedidos expresamente mediante una licencia permanecerán reservados.</p>
            <p>La ausencia de una prohibición expresa no implica autorización.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.8 Protección internacional</h3>
            <p>La protección de la propiedad intelectual se aplicará conforme a la legislación vigente y a los tratados internacionales aplicables, incluyendo aquellos relativos a derechos de autor y propiedad intelectual.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 12. Derechos de Autor
              </h2>
            </section>
            <p>Los recursos publicados por Prompt Studio están protegidos por derechos de autor desde el momento de su creación.</p>
            <p>La compra de un recurso digital no implica la cesión del copyright, salvo que exista un acuerdo específico y por escrito que establezca lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.1 Copyright</h3>
            <p>El copyright protege, entre otros elementos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Texto de los prompts.</li>
              <li>Organización de instrucciones.</li>
              <li>Recursos descargables.</li>
              <li>Material audiovisual.</li>
              <li>Contenido gráfico.</li>
              <li>Código desarrollado por Prompt Studio.</li>
              <li>Manuales.</li>
              <li>Documentación.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.2 Cesión</h3>
            <p>Prompt Studio no cede los derechos de autor sobre los recursos vendidos.</p>
            <p>Únicamente concede una licencia de uso conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.3 Obras derivadas</h3>
            <p>El usuario podrá crear obras derivadas cuando la licencia correspondiente lo permita.</p>
            <p>No obstante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El recurso original continuará protegido.</li>
              <li>La licencia no autoriza apropiarse del prompt original.</li>
              <li>La existencia de una obra derivada no elimina los derechos de Prompt Studio sobre el recurso inicial.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.4 Protección frente a copias</h3>
            <p>Está prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Copiar íntegramente un prompt para revenderlo.</li>
              <li>Publicar colecciones completas de recursos adquiridos.</li>
              <li>Reproducir masivamente el contenido de Prompt Studio.</li>
              <li>Utilizar herramientas automatizadas para copiar el catálogo.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.5 Infracciones</h3>
            <p>Prompt Studio podrá actuar frente a cualquier infracción de derechos de autor mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Solicitudes de retirada de contenido.</li>
              <li>Notificaciones DMCA.</li>
              <li>Reclamaciones civiles.</li>
              <li>Acciones judiciales.</li>
              <li>Otras medidas previstas por la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.6 Contenido de terceros</h3>
            <p>Cuando un recurso incluya material licenciado por terceros, el usuario también deberá respetar las condiciones establecidas por dichos titulares.</p>
            <p>Prompt Studio no concede más derechos que aquellos que haya recibido legítimamente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.7 Duración de la protección</h3>
            <p>La protección de los derechos de autor tendrá la duración prevista por la legislación aplicable.</p>
            <p>La finalización de una licencia de uso no implica la pérdida de la protección jurídica del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.8 Reconocimiento</h3>
            <p>El usuario reconoce que todos los recursos protegidos por derechos de autor continúan perteneciendo a sus respectivos titulares y se compromete a respetar dicha titularidad durante toda la vigencia de la licencia y con posterioridad a su terminación.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 13. Obras Derivadas
              </h2>
            </section>
            <p>Prompt Studio reconoce que los usuarios pueden utilizar los recursos digitales adquiridos para crear nuevos contenidos, proyectos o productos.</p>
            <p>Las obras derivadas creadas por el usuario estarán sujetas a las condiciones de la licencia adquirida y a la legislación aplicable sobre propiedad intelectual.</p>
            <p>La creación de una obra derivada no implica la adquisición de la propiedad intelectual sobre el recurso original utilizado para generarla.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.1 Definición</h3>
            <p>Se considera obra derivada cualquier contenido creado utilizando total o parcialmente un recurso adquirido en Prompt Studio.</p>
            <p>Entre otros ejemplos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imágenes generadas mediante IA.</li>
              <li>Videos generados mediante IA.</li>
              <li>Sitios web.</li>
              <li>Aplicaciones.</li>
              <li>Código fuente.</li>
              <li>Artículos.</li>
              <li>Presentaciones.</li>
              <li>Material educativo.</li>
              <li>Campañas publicitarias.</li>
              <li>Contenido para redes sociales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.2 Titularidad del resultado</h3>
            <p>Salvo disposición legal en contrario o condiciones específicas del modelo de Inteligencia Artificial utilizado, el usuario será responsable de los derechos que puedan corresponder sobre el contenido final generado.</p>
            <p>Prompt Studio no reclama la propiedad sobre las obras derivadas creadas por el usuario.</p>
            <p>No obstante, el recurso original (prompt, plantilla o archivo adquirido) seguirá siendo propiedad de Prompt Studio o de su respectivo titular.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.3 Uso comercial</h3>
            <p>Cuando la licencia adquirida lo permita, el usuario podrá utilizar comercialmente las obras derivadas que cree utilizando los recursos de Prompt Studio.</p>
            <p>Esto incluye, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Venta de imágenes generadas.</li>
              <li>Producción de videos.</li>
              <li>Desarrollo de aplicaciones.</li>
              <li>Creación de sitios web.</li>
              <li>Material publicitario.</li>
              <li>Productos digitales creados a partir del resultado generado.</li>
            </ul>
            <p>Siempre que el recurso original no sea redistribuido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.4 Independencia del recurso original</h3>
            <p>Aunque el usuario cree una obra derivada, ello no le otorga derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender el prompt original.</li>
              <li>Compartir el archivo adquirido.</li>
              <li>Distribuir la plantilla original.</li>
              <li>Publicar el recurso utilizado para generar el contenido.</li>
            </ul>
            <p>La licencia únicamente autoriza el uso del recurso, no su redistribución.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.5 Modificaciones del prompt</h3>
            <p>El usuario podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar.</li>
              <li>Adaptar.</li>
              <li>Traducir.</li>
              <li>Reorganizar.</li>
              <li>Optimizar.</li>
            </ul>
            <p>los prompts adquiridos para uso propio.</p>
            <p>Las modificaciones no eliminan la protección jurídica del recurso original ni generan un derecho independiente para redistribuirlo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.6 Responsabilidad sobre la obra derivada</h3>
            <p>El usuario será el único responsable del contenido que genere mediante los recursos adquiridos.</p>
            <p>Prompt Studio no revisa ni aprueba previamente las obras derivadas creadas por los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.7 Derechos de terceros</h3>
            <p>El usuario deberá asegurarse de que las obras derivadas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No infrinjan derechos de terceros.</li>
              <li>No vulneren marcas registradas.</li>
              <li>No infrinjan derechos de autor.</li>
              <li>No incumplan la legislación aplicable.</li>
            </ul>
            <p>Prompt Studio no será responsable por el uso que el usuario haga del contenido generado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.8 Conservación de derechos</h3>
            <p>La creación de una obra derivada no limita ni reduce los derechos de propiedad intelectual que Prompt Studio conserva sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El prompt original.</li>
              <li>La plantilla.</li>
              <li>El recurso digital.</li>
              <li>La colección correspondiente.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 14. Contenido Generado mediante Inteligencia Artificial
              </h2>
            </section>
            <p>Los recursos de Prompt Studio están diseñados para ser utilizados con plataformas y modelos de Inteligencia Artificial de terceros.</p>
            <p>El resultado obtenido dependerá de múltiples factores ajenos al control de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.1 Naturaleza del contenido generado</h3>
            <p>El contenido producido mediante un prompt puede variar en función de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El modelo de IA utilizado.</li>
              <li>La versión del modelo.</li>
              <li>La configuración.</li>
              <li>El idioma.</li>
              <li>Las instrucciones adicionales.</li>
              <li>El contexto proporcionado por el usuario.</li>
            </ul>
            <p>Por ello, dos usuarios pueden obtener resultados diferentes utilizando el mismo recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.2 Plataformas compatibles</h3>
            <p>Los recursos podrán utilizarse, entre otros, con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ChatGPT.</li>
              <li>Google Gemini.</li>
              <li>Claude.</li>
              <li>Grok.</li>
              <li>Llama.</li>
              <li>Mistral.</li>
              <li>Midjourney.</li>
              <li>Stable Diffusion.</li>
              <li>Flux.</li>
              <li>Runway.</li>
              <li>Veo.</li>
              <li>Sora.</li>
              <li>Otros modelos compatibles.</li>
            </ul>
            <p>Prompt Studio no garantiza la compatibilidad permanente con todas las plataformas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.3 Cambios en los modelos</h3>
            <p>Las plataformas de Inteligencia Artificial evolucionan constantemente.</p>
            <p>Por ello, Prompt Studio no garantiza que un prompt produzca resultados idénticos cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El proveedor modifique el modelo.</li>
              <li>Cambie el algoritmo.</li>
              <li>Se actualice la plataforma.</li>
              <li>Se alteren las políticas del proveedor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.4 Responsabilidad del usuario</h3>
            <p>El usuario será responsable de revisar el contenido generado antes de utilizarlo públicamente.</p>
            <p>Esto incluye verificar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exactitud.</li>
              <li>Legalidad.</li>
              <li>Calidad.</li>
              <li>Adecuación al propósito previsto.</li>
              <li>Cumplimiento normativo.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.5 Uso profesional</h3>
            <p>Cuando el contenido generado vaya a utilizarse en ámbitos profesionales o comerciales, el usuario deberá realizar las verificaciones necesarias antes de publicarlo o entregarlo a terceros.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.6 Derechos sobre el resultado</h3>
            <p>Los derechos sobre el contenido generado mediante Inteligencia Artificial dependerán de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación aplicable.</li>
              <li>Las condiciones del proveedor del modelo de IA.</li>
              <li>La participación creativa del usuario.</li>
            </ul>
            <p>Prompt Studio no garantiza que el contenido generado pueda estar protegido por derechos de autor en todas las jurisdicciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.7 Contenido sensible</h3>
            <p>El usuario se compromete a no utilizar los recursos de Prompt Studio para generar contenido que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sea ilegal.</li>
              <li>Infrinja derechos de terceros.</li>
              <li>Promueva violencia o discriminación.</li>
              <li>Facilite actividades ilícitas.</li>
              <li>Vulnere normas aplicables de las plataformas de IA utilizadas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.8 Exención de responsabilidad</h3>
            <p>Prompt Studio no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las decisiones tomadas por modelos de IA.</li>
              <li>Errores del contenido generado.</li>
              <li>Cambios en los resultados.</li>
              <li>Restricciones impuestas por plataformas de terceros.</li>
              <li>Eliminación o modificación de funcionalidades de los modelos utilizados.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 15. Redistribución de Recursos
              </h2>
            </section>
            <p>Los recursos digitales comercializados por Prompt Studio están protegidos por derechos de propiedad intelectual y únicamente pueden utilizarse conforme a la licencia adquirida.</p>
            <p>Salvo autorización expresa y por escrito de Prompt Studio, queda prohibida cualquier forma de redistribución del recurso original, independientemente del medio utilizado.</p>
            <p>La prohibición de redistribución constituye una condición esencial de todas las licencias otorgadas por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.1 Concepto de redistribución</h3>
            <p>Se considera redistribución cualquier acto mediante el cual el usuario facilite el acceso al recurso original a otra persona o entidad.</p>
            <p>Entre otros supuestos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compartir archivos.</li>
              <li>Publicar enlaces de descarga.</li>
              <li>Enviar el recurso por correo electrónico.</li>
              <li>Subirlo a servicios de almacenamiento.</li>
              <li>Compartirlo mediante aplicaciones de mensajería.</li>
              <li>Distribuirlo dentro de organizaciones no autorizadas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.2 Medios prohibidos</h3>
            <p>No está permitido redistribuir los recursos mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitios web.</li>
              <li>Marketplaces.</li>
              <li>Plataformas educativas.</li>
              <li>Foros.</li>
              <li>Redes sociales.</li>
              <li>GitHub.</li>
              <li>GitLab.</li>
              <li>Bitbucket.</li>
              <li>Google Drive.</li>
              <li>Dropbox.</li>
              <li>OneDrive.</li>
              <li>Mega.</li>
              <li>Telegram.</li>
              <li>Discord.</li>
              <li>Cualquier otro medio de distribución.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.3 Compartición gratuita</h3>
            <p>La prohibición de redistribución aplica incluso cuando el recurso se comparta de forma gratuita.</p>
            <p>No importa si existe o no un beneficio económico.</p>
            <p>La simple puesta a disposición del recurso original constituye una redistribución no autorizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.4 Compartición parcial</h3>
            <p>También está prohibido compartir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fragmentos sustanciales del prompt.</li>
              <li>Colecciones parciales.</li>
              <li>Bases de datos.</li>
              <li>Compilaciones.</li>
              <li>Versiones ligeramente modificadas cuyo propósito sea sustituir el recurso original.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.5 Equipos internos</h3>
            <p>Cuando la licencia permita el uso por varios usuarios (por ejemplo, Agencia o Enterprise), la compartición únicamente podrá realizarse entre los usuarios expresamente autorizados.</p>
            <p>No podrá ampliarse el acceso a terceros ajenos a la licencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.6 Recursos gratuitos</h3>
            <p>Los recursos gratuitos continúan sujetos a esta Política.</p>
            <p>Salvo autorización expresa, tampoco podrán redistribuirse fuera de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.7 Copias de seguridad</h3>
            <p>El usuario podrá realizar copias de seguridad únicamente para uso interno y personal, siempre que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No sean compartidas.</li>
              <li>No se publiquen.</li>
              <li>No se utilicen para redistribución.</li>
              <li>Permanezcan bajo el control del titular de la licencia.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.8 Consecuencias</h3>
            <p>La redistribución no autorizada podrá dar lugar, entre otras medidas, a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revocación inmediata de la licencia.</li>
              <li>Suspensión de la cuenta.</li>
              <li>Eliminación del acceso a productos Premium.</li>
              <li>Solicitudes de retirada de contenido.</li>
              <li>Reclamaciones por daños y perjuicios.</li>
              <li>Acciones civiles o penales cuando correspondan.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 16. Prohibición de Reventa
              </h2>
            </section>
            <p>Prompt Studio prohíbe expresamente la reventa de los recursos digitales comercializados en la Plataforma, salvo autorización previa y por escrito.</p>
            <p>La adquisición de un producto digital no autoriza al comprador a comercializar el recurso original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.1 Prohibición general</h3>
            <p>El usuario no podrá vender:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Plantillas.</li>
              <li>Archivos HTML.</li>
              <li>Recursos descargables.</li>
              <li>Colecciones.</li>
              <li>Bibliotecas.</li>
              <li>Paquetes digitales.</li>
            </ul>
            <p>Adquiridos en Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.2 Reventa con modificaciones</h3>
            <p>La modificación de un recurso no autoriza su reventa cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La estructura principal permanezca sustancialmente igual.</li>
              <li>El valor del producto continúe dependiendo del recurso original.</li>
              <li>La modificación tenga como finalidad eludir esta Política.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.3 Marketplaces</h3>
            <p>Está prohibido publicar recursos adquiridos en Prompt Studio en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Otros marketplaces.</li>
              <li>Tiendas digitales.</li>
              <li>Plataformas de prompts.</li>
              <li>Plataformas de IA.</li>
              <li>Marketplaces de plantillas.</li>
              <li>Repositorios comerciales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.4 Paquetes</h3>
            <p>El usuario no podrá incluir recursos originales de Prompt Studio dentro de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Packs.</li>
              <li>Colecciones.</li>
              <li>Bibliotecas.</li>
              <li>Cursos descargables.</li>
              <li>Membresías.</li>
              <li>Productos comerciales.</li>
            </ul>
            <p>Sin autorización expresa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.5 Licencias múltiples</h3>
            <p>La adquisición de varias licencias sobre un mismo recurso no autoriza su reventa.</p>
            <p>Cada licencia amplía únicamente el derecho de uso dentro del alcance expresamente concedido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.6 Venta del resultado</h3>
            <p>Cuando la licencia correspondiente lo permita, el usuario sí podrá comercializar el resultado generado mediante el recurso.</p>
            <p>Por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Imágenes creadas con IA.</li>
              <li>Videos generados.</li>
              <li>Sitios web desarrollados.</li>
              <li>Aplicaciones creadas.</li>
              <li>Material publicitario.</li>
              <li>Contenido final entregado a clientes.</li>
            </ul>
            <p>Lo anterior no autoriza la venta del prompt original.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.7 Afiliados</h3>
            <p>La única forma autorizada de promocionar y obtener beneficios económicos por la venta de recursos de Prompt Studio será mediante el Programa Oficial de Afiliados, cuando esté disponible y conforme a sus propios términos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.8 Protección de la Plataforma</h3>
            <p>Estas restricciones tienen como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger la inversión realizada en el desarrollo de los recursos.</li>
              <li>Garantizar la sostenibilidad de Prompt Studio.</li>
              <li>Proteger los derechos de autores y colaboradores.</li>
              <li>Evitar la competencia desleal.</li>
              <li>Preservar el valor de las licencias adquiridas por los usuarios.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 17. Licencias para Contenido Gratuito
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer determinados recursos digitales de forma gratuita con el objetivo de permitir que los usuarios conozcan la Plataforma, aprendan a utilizar herramientas de Inteligencia Artificial o prueben determinados productos antes de adquirir contenido Premium.</p>
            <p>La gratuidad de un recurso no implica que deje de estar protegido por derechos de propiedad intelectual.</p>
            <p>Todos los recursos gratuitos continúan sujetos a la presente Política de Licencias, salvo que se indique expresamente una licencia diferente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.1 Alcance de la licencia gratuita</h3>
            <p>La Licencia Gratuita concede al usuario un derecho limitado para utilizar el recurso conforme a las condiciones publicadas en Prompt Studio.</p>
            <p>Esta licencia no transfiere la propiedad intelectual del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.2 Uso permitido</h3>
            <p>Salvo que se indique expresamente lo contrario, el usuario podrá utilizar los recursos gratuitos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aprendizaje.</li>
              <li>Investigación.</li>
              <li>Formación.</li>
              <li>Uso personal.</li>
              <li>Experimentación con modelos de IA.</li>
              <li>Desarrollo de proyectos propios.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.3 Uso comercial</h3>
            <p>Los recursos gratuitos únicamente podrán utilizarse con fines comerciales cuando la descripción del producto lo autorice expresamente.</p>
            <p>En ausencia de dicha autorización, se entenderá que el recurso gratuito está destinado únicamente a fines personales o educativos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.4 Prohibición de redistribución</h3>
            <p>Aunque el recurso sea gratuito, el usuario no podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revenderlo.</li>
              <li>Compartir el archivo original.</li>
              <li>Publicarlo en otros sitios web.</li>
              <li>Distribuirlo mediante plataformas de terceros.</li>
              <li>Crear bibliotecas públicas del contenido.</li>
            </ul>
            <p>Los recursos gratuitos deben obtenerse exclusivamente desde Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.5 Modificaciones</h3>
            <p>El usuario podrá modificar el recurso gratuito para uso propio.</p>
            <p>Las modificaciones no eliminan la protección jurídica del recurso original ni autorizan su redistribución.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.6 Disponibilidad</h3>
            <p>Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Actualizar.</li>
              <li>Sustituir.</li>
              <li>Modificar.</li>
              <li>Eliminar.</li>
            </ul>
            <p>cualquier recurso gratuito en cualquier momento.</p>
            <p>La disponibilidad futura de un recurso gratuito no está garantizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.7 Conversión a Premium</h3>
            <p>Prompt Studio podrá convertir un recurso gratuito en un recurso Premium.</p>
            <p>Las nuevas condiciones se aplicarán únicamente a las futuras descargas o adquisiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.8 Conservación de derechos</h3>
            <p>Todos los derechos de propiedad intelectual sobre los recursos gratuitos permanecerán siendo propiedad de Prompt Studio, Magzin LLC o de sus respectivos titulares.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 18. Licencias para Recursos Premium
              </h2>
            </section>
            <p>Los recursos Premium representan contenido de pago desarrollado o distribuido por Prompt Studio bajo licencias específicas.</p>
            <p>La adquisición de un recurso Premium concede únicamente el derecho de uso previsto en la licencia correspondiente.</p>
            <p>No implica la cesión de la propiedad intelectual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.1 Alcance</h3>
            <p>Los recursos Premium podrán incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts avanzados.</li>
              <li>Bibliotecas de prompts.</li>
              <li>Colecciones especializadas.</li>
              <li>Recursos HTML.</li>
              <li>Componentes web.</li>
              <li>Plantillas profesionales.</li>
              <li>Recursos audiovisuales.</li>
              <li>Material exclusivo para suscriptores.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.2 Acceso</h3>
            <p>El acceso a los recursos Premium podrá producirse mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compra individual.</li>
              <li>Suscripción activa.</li>
              <li>Licencias corporativas.</li>
              <li>Promociones autorizadas.</li>
              <li>Otros mecanismos ofrecidos por Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.3 Derechos del comprador</h3>
            <p>El comprador podrá utilizar el recurso conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La licencia adquirida.</li>
              <li>Esta Política.</li>
              <li>Los Términos y Condiciones.</li>
            </ul>
            <p>No podrá ejercer derechos distintos a los expresamente concedidos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.4 Recursos exclusivos</h3>
            <p>Prompt Studio podrá ofrecer recursos exclusivos disponibles únicamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usuarios Premium.</li>
              <li>Suscriptores activos.</li>
              <li>Clientes Enterprise.</li>
              <li>Programas especiales.</li>
            </ul>
            <p>El acceso a estos recursos finalizará cuando concluya la condición que dio derecho a utilizarlos, salvo que se indique expresamente lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.5 Actualizaciones</h3>
            <p>Algunos recursos Premium podrán recibir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejoras.</li>
              <li>Nuevas versiones.</li>
              <li>Correcciones.</li>
              <li>Contenido adicional.</li>
            </ul>
            <p>Salvo que se indique expresamente, Prompt Studio no garantiza actualizaciones gratuitas e ilimitadas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.6 Protección reforzada</h3>
            <p>Los recursos Premium podrán incorporar medidas destinadas a proteger su propiedad intelectual, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificadores internos.</li>
              <li>Registros de licencia.</li>
              <li>Sistemas de control de acceso.</li>
              <li>Registros de descarga.</li>
              <li>Medidas técnicas razonables de protección.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.7 Finalización del acceso</h3>
            <p>Prompt Studio podrá suspender el acceso a recursos Premium cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La licencia expire.</li>
              <li>La suscripción finalice.</li>
              <li>Exista incumplimiento de esta Política.</li>
              <li>Se detecte fraude.</li>
              <li>Exista una obligación legal.</li>
            </ul>
            <p>La terminación del acceso no afectará los derechos previamente adquiridos cuando una licencia permanente haya sido concedida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.8 Conservación de la propiedad intelectual</h3>
            <p>La adquisición de un recurso Premium no transfiere:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Derechos de autor.</li>
              <li>Marcas.</li>
              <li>Diseños.</li>
              <li>Patentes.</li>
              <li>Derechos exclusivos.</li>
            </ul>
            <p>Todos estos derechos continuarán perteneciendo a Prompt Studio, Magzin LLC o al titular correspondiente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 19. Licencias de Suscripción Premium
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer recursos digitales mediante planes de suscripción Premium que otorguen acceso temporal a determinados contenidos, herramientas o funcionalidades exclusivas.</p>
            <p>La suscripción concede un derecho de acceso y uso durante el período contratado, conforme a esta Política, los Términos y Condiciones y el Acuerdo de Suscripción Premium.</p>
            <p>La suscripción no transfiere la propiedad intelectual de los recursos disponibles durante su vigencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.1 Alcance de la suscripción</h3>
            <p>Dependiendo del plan contratado, una suscripción podrá permitir el acceso a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bibliotecas Premium.</li>
              <li>Prompts exclusivos.</li>
              <li>Colecciones especializadas.</li>
              <li>Recursos HTML.</li>
              <li>Plantillas.</li>
              <li>Material educativo.</li>
              <li>Recursos audiovisuales.</li>
              <li>Herramientas basadas en Inteligencia Artificial.</li>
              <li>Funcionalidades avanzadas.</li>
            </ul>
            <p>El contenido disponible podrá variar entre distintos planes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.2 Duración</h3>
            <p>La licencia concedida mediante una suscripción permanecerá vigente únicamente durante el período contratado y pagado por el usuario.</p>
            <p>Una vez finalizado dicho período, el acceso podrá cesar automáticamente, salvo renovación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.3 Naturaleza temporal</h3>
            <p>La suscripción otorga un derecho temporal de acceso.</p>
            <p>Salvo que se indique expresamente lo contrario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No concede una licencia perpetua.</li>
              <li>No transfiere la propiedad del contenido.</li>
              <li>No convierte al usuario en titular de los recursos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.4 Renovación</h3>
            <p>Cuando la suscripción incluya renovación automática:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La licencia continuará vigente mientras se procesen correctamente los pagos.</li>
              <li>La renovación estará sujeta a las condiciones publicadas por Prompt Studio y Stripe.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.5 Cancelación</h3>
            <p>El usuario podrá cancelar la renovación automática conforme al procedimiento establecido por Prompt Studio.</p>
            <p>La cancelación:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No afecta el período ya pagado.</li>
              <li>No genera derecho a reembolso.</li>
              <li>Impide únicamente futuras renovaciones.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.6 Recursos descargados</h3>
            <p>Cuando la licencia permita descargar determinados recursos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario conservará únicamente los derechos previstos por la licencia correspondiente.</li>
              <li>La finalización de la suscripción no ampliará dichos derechos.</li>
            </ul>
            <p>Prompt Studio podrá distinguir entre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Licencias permanentes.</li>
              <li>Licencias temporales.</li>
              <li>Recursos disponibles únicamente durante la suscripción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.7 Modificaciones del catálogo</h3>
            <p>Durante la vigencia de una suscripción, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incorporar nuevos recursos.</li>
              <li>Actualizar contenido.</li>
              <li>Retirar recursos obsoletos.</li>
              <li>Sustituir materiales.</li>
            </ul>
            <p>Siempre procurando mantener un nivel razonablemente equivalente del servicio ofrecido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.8 Conservación de derechos</h3>
            <p>Todos los recursos disponibles mediante una suscripción continúan siendo propiedad de Prompt Studio, Magzin LLC o de sus respectivos titulares.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 20. Terminación de la Licencia
              </h2>
            </section>
            <p>La licencia concedida al usuario podrá finalizar por cualquiera de las causas previstas en esta Política, en los Términos y Condiciones o en la legislación aplicable.</p>
            <p>La terminación de una licencia implicará el cese de los derechos de uso concedidos, sin perjuicio de los derechos ya adquiridos conforme a una licencia permanente cuando corresponda.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.1 Terminación por vencimiento</h3>
            <p>Las licencias temporales finalizarán automáticamente al concluir el período para el cual fueron concedidas.</p>
            <p>No será necesaria ninguna notificación adicional.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.2 Terminación por cancelación</h3>
            <p>Cuando el usuario cancele una suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La licencia continuará vigente hasta finalizar el período ya pagado.</li>
              <li>Posteriormente cesarán los derechos asociados a la suscripción.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.3 Terminación por incumplimiento</h3>
            <p>Prompt Studio podrá revocar una licencia cuando el usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Redistribuya recursos.</li>
              <li>Revenda prompts.</li>
              <li>Infrinja derechos de autor.</li>
              <li>Comparta la cuenta de manera no autorizada.</li>
              <li>Incumpla los Términos y Condiciones.</li>
              <li>Utilice los recursos para actividades ilícitas.</li>
              <li>Incumpla esta Política.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.4 Efectos de la terminación</h3>
            <p>Una vez terminada la licencia, el usuario deberá cesar inmediatamente cualquier uso que ya no esté autorizado.</p>
            <p>Cuando corresponda, deberá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminar copias no autorizadas.</li>
              <li>Interrumpir la distribución.</li>
              <li>Cesar el uso de recursos sujetos a licencia temporal.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.5 Recursos permanentes</h3>
            <p>Cuando un producto haya sido adquirido bajo una licencia permanente válida, la terminación de una suscripción no afectará dicha licencia, salvo que exista incumplimiento de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.6 Obligaciones posteriores</h3>
            <p>Las siguientes obligaciones continuarán vigentes incluso después de finalizar la licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respeto a la propiedad intelectual.</li>
              <li>Prohibición de redistribución.</li>
              <li>Prohibición de reventa.</li>
              <li>Confidencialidad cuando corresponda.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.7 Restablecimiento</h3>
            <p>Cuando una licencia haya sido suspendida por error administrativo o técnico, Prompt Studio podrá restablecerla una vez verificada la incidencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.8 Reserva de acciones</h3>
            <p>La terminación de una licencia no impedirá que Prompt Studio ejerza las acciones legales que correspondan para proteger sus derechos de propiedad intelectual o reclamar los daños derivados de un incumplimiento.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 21. Protección contra Copias No Autorizadas
              </h2>
            </section>
            <p>Prompt Studio realiza una inversión significativa en el desarrollo, recopilación, organización y mejora de sus recursos digitales.</p>
            <p>Con el fin de proteger dichos activos, todos los productos comercializados por la Plataforma están protegidos frente a la copia, reproducción, extracción y distribución no autorizadas.</p>
            <p>La adquisición de una licencia no autoriza al usuario a realizar copias distintas de aquellas expresamente permitidas por esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.1 Prohibición de copia masiva</h3>
            <p>Está prohibido copiar de forma sistemática o masiva:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Colecciones.</li>
              <li>Bibliotecas.</li>
              <li>Recursos HTML.</li>
              <li>Archivos descargables.</li>
              <li>Bases de datos.</li>
              <li>Recursos Premium.</li>
            </ul>
            <p>Con el propósito de crear una colección propia o reproducir total o parcialmente el catálogo de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.2 Automatización</h3>
            <p>No se permite utilizar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bots.</li>
              <li>Scripts.</li>
              <li>Crawlers.</li>
              <li>Scrapers.</li>
              <li>Sistemas automatizados.</li>
              <li>Inteligencia Artificial.</li>
              <li>Herramientas de extracción.</li>
            </ul>
            <p>Para recopilar recursos de Prompt Studio sin autorización previa y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.3 Copias espejo</h3>
            <p>Queda prohibido crear copias completas o parciales del sitio web o del catálogo de Prompt Studio mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sitios espejo (Mirror Sites).</li>
              <li>Clonación.</li>
              <li>Replicación automática.</li>
              <li>Sincronización no autorizada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.4 Descargas masivas</h3>
            <p>No podrán realizarse descargas automatizadas destinadas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear bibliotecas externas.</li>
              <li>Revender recursos.</li>
              <li>Distribuir contenido.</li>
              <li>Almacenar colecciones para terceros.</li>
            </ul>
            <p>Incluso cuando el usuario disponga de una suscripción activa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.5 Capturas del contenido</h3>
            <p>No podrán utilizarse capturas de pantalla, fotografías, grabaciones o cualquier otro medio para reconstruir sistemáticamente los recursos digitales protegidos por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.6 Ingeniería de extracción</h3>
            <p>Está prohibido desarrollar herramientas cuyo objetivo sea:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extraer prompts.</li>
              <li>Reconstruir bibliotecas.</li>
              <li>Copiar estructuras.</li>
              <li>Exportar automáticamente recursos protegidos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.7 Conservación de evidencias</h3>
            <p>Prompt Studio podrá conservar registros técnicos relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargas.</li>
              <li>Accesos.</li>
              <li>Actividad de cuentas.</li>
              <li>Direcciones IP.</li>
              <li>Dispositivos.</li>
              <li>Registros del servidor.</li>
            </ul>
            <p>Cuando resulte necesario para proteger la propiedad intelectual o investigar posibles incumplimientos.</p>
            <p>El tratamiento de estos datos se realizará conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">21.8 Medidas legales</h3>
            <p>Ante una copia no autorizada, Prompt Studio podrá ejercer las acciones previstas por la legislación aplicable, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Requerimientos de cese.</li>
              <li>Solicitudes de retirada de contenido.</li>
              <li>Notificaciones DMCA.</li>
              <li>Reclamaciones por daños y perjuicios.</li>
              <li>Acciones judiciales.</li>
              <li>Cualquier otra medida legal disponible.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 22. Medidas Tecnológicas de Protección
              </h2>
            </section>
            <p>Prompt Studio podrá implementar medidas técnicas razonables destinadas a proteger los recursos digitales frente al acceso, copia o distribución no autorizados.</p>
            <p>Estas medidas tienen como finalidad preservar la integridad del catálogo y los derechos de propiedad intelectual de la Plataforma y de sus colaboradores.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.1 Control de acceso</h3>
            <p>Prompt Studio podrá utilizar mecanismos para limitar el acceso a los recursos digitales, tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Autenticación mediante cuenta de usuario.</li>
              <li>Control de sesiones.</li>
              <li>Verificación de identidad.</li>
              <li>Gestión de permisos.</li>
              <li>Restricciones por licencia.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.2 Registros de actividad</h3>
            <p>Con fines de seguridad y cumplimiento, Prompt Studio podrá registrar información relacionada con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inicio de sesión.</li>
              <li>Descargas.</li>
              <li>Compras.</li>
              <li>Actividad de la cuenta.</li>
              <li>Uso de licencias.</li>
              <li>Eventos de seguridad.</li>
            </ul>
            <p>Estos registros se utilizarán conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.3 Identificadores internos</h3>
            <p>Los recursos digitales podrán incorporar identificadores técnicos o metadatos destinados a facilitar la gestión de licencias, la autenticidad del contenido y la investigación de usos no autorizados.</p>
            <p>Estos identificadores no alteran el funcionamiento normal del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.4 Limitaciones técnicas</h3>
            <p>Prompt Studio podrá establecer límites razonables relacionados con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de descargas.</li>
              <li>Dispositivos autorizados.</li>
              <li>Accesos simultáneos.</li>
              <li>Uso de determinadas funcionalidades.</li>
            </ul>
            <p>Estas limitaciones dependerán del tipo de licencia adquirida.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.5 Actualizaciones de seguridad</h3>
            <p>Prompt Studio podrá modificar sus mecanismos de protección cuando resulte necesario para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar la seguridad.</li>
              <li>Prevenir el fraude.</li>
              <li>Proteger la propiedad intelectual.</li>
              <li>Adaptarse a nuevas amenazas tecnológicas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.6 Prohibición de elusión</h3>
            <p>El usuario no podrá intentar eludir, desactivar o interferir con las medidas técnicas implementadas por Prompt Studio para proteger sus recursos.</p>
            <p>Entre otros supuestos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminar restricciones técnicas.</li>
              <li>Alterar sistemas de autenticación.</li>
              <li>Manipular controles de licencia.</li>
              <li>Acceder a recursos mediante procedimientos no autorizados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.7 Compatibilidad</h3>
            <p>Las medidas de protección procurarán ser compatibles con el funcionamiento normal de los recursos digitales y no tendrán por finalidad restringir indebidamente los derechos legítimos concedidos mediante la licencia correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">22.8 Protección continua</h3>
            <p>Prompt Studio revisará periódicamente sus mecanismos de protección para mantener un nivel razonable de seguridad conforme a la evolución tecnológica y a las mejores prácticas de la industria.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 23. Infracciones de Licencia
              </h2>
            </section>
            <p>Prompt Studio protege activamente sus recursos digitales frente a cualquier uso no autorizado.</p>
            <p>Se considerará una infracción de licencia cualquier utilización de un recurso que exceda los derechos expresamente concedidos por la licencia correspondiente o que incumpla esta Política, los Términos y Condiciones o la legislación aplicable.</p>
            <p>La existencia de una infracción podrá dar lugar a medidas técnicas, contractuales y legales destinadas a proteger los derechos de Prompt Studio, Magzin LLC y de los titulares de los recursos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.1 Conductas consideradas infracción</h3>
            <p>Entre otras, constituyen infracciones de licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender prompts.</li>
              <li>Redistribuir recursos digitales.</li>
              <li>Compartir archivos protegidos.</li>
              <li>Publicar recursos en Internet.</li>
              <li>Comercializar el contenido original.</li>
              <li>Eludir las limitaciones de la licencia.</li>
              <li>Compartir cuentas de forma no autorizada.</li>
              <li>Utilizar recursos fuera del alcance permitido por la licencia adquirida.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.2 Uso por terceros</h3>
            <p>El titular de una licencia será responsable cuando permita, facilite o tolere que terceros utilicen recursos protegidos incumpliendo esta Política.</p>
            <p>Esta responsabilidad podrá extenderse a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Empleados.</li>
              <li>Colaboradores.</li>
              <li>Contratistas.</li>
              <li>Clientes.</li>
              <li>Usuarios autorizados por la organización.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.3 Investigación</h3>
            <p>Prompt Studio podrá investigar cualquier sospecha razonable de infracción utilizando información obtenida legítimamente, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registros de acceso.</li>
              <li>Historial de compras.</li>
              <li>Actividad de la cuenta.</li>
              <li>Registros de descarga.</li>
              <li>Evidencias públicas.</li>
              <li>Información aportada por terceros.</li>
            </ul>
            <p>La investigación respetará la Política de Privacidad y la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.4 Medidas inmediatas</h3>
            <p>Cuando exista evidencia razonable de una infracción, Prompt Studio podrá adoptar una o varias de las siguientes medidas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspender temporalmente la cuenta.</li>
              <li>Revocar la licencia correspondiente.</li>
              <li>Bloquear el acceso a recursos Premium.</li>
              <li>Limitar futuras compras.</li>
              <li>Solicitar información adicional al usuario.</li>
              <li>Eliminar contenido cuando resulte necesario.</li>
            </ul>
            <p>Estas medidas podrán adoptarse de forma preventiva mientras se analiza la situación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.5 Reincidencia</h3>
            <p>La reiteración de incumplimientos podrá dar lugar a medidas adicionales, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancelación permanente de la cuenta.</li>
              <li>Revocación de todas las licencias activas.</li>
              <li>Exclusión de programas promocionales.</li>
              <li>Exclusión del Programa de Afiliados.</li>
              <li>Restricción para realizar nuevas compras.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.6 Indemnización</h3>
            <p>Cuando una infracción ocasione daños económicos o reputacionales a Prompt Studio o a terceros, la empresa podrá reclamar la indemnización correspondiente conforme a la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.7 Cooperación</h3>
            <p>El usuario se compromete a colaborar razonablemente con Prompt Studio durante cualquier investigación relacionada con un posible incumplimiento de licencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">23.8 Reserva de derechos</h3>
            <p>Las medidas previstas en esta sección no limitan el derecho de Prompt Studio a ejercer cualquier otra acción administrativa, civil o penal que resulte procedente.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 24. Procedimiento de Notificación y Retirada (DMCA y Copyright)
              </h2>
            </section>
            <p>Prompt Studio respeta los derechos de propiedad intelectual de terceros y espera que todos los usuarios hagan lo mismo.</p>
            <p>Si una persona considera que un recurso disponible en Prompt Studio infringe sus derechos de autor u otros derechos de propiedad intelectual, podrá presentar una notificación conforme al procedimiento descrito en esta sección.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.1 Presentación de una reclamación</h3>
            <p>Las reclamaciones deberán enviarse al siguiente correo electrónico:</p>
            <p>support@prompstudio.com</p>
            <p>La comunicación deberá incluir información suficiente para permitir la identificación del contenido reclamado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.2 Información requerida</h3>
            <p>Cuando sea posible, la notificación deberá contener:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre completo del reclamante.</li>
              <li>Datos de contacto.</li>
              <li>Identificación de la obra protegida.</li>
              <li>Identificación del contenido presuntamente infractor.</li>
              <li>Ubicación del contenido en Prompt Studio.</li>
              <li>Explicación de la presunta infracción.</li>
              <li>Declaración de buena fe.</li>
              <li>Declaración de veracidad de la información proporcionada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.3 Revisión</h3>
            <p>Una vez recibida la notificación, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Solicitar información adicional.</li>
              <li>Revisar la documentación presentada.</li>
              <li>Contactar al usuario afectado.</li>
              <li>Consultar al titular del recurso.</li>
              <li>Realizar verificaciones técnicas o legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.4 Medidas provisionales</h3>
            <p>Mientras se analiza una reclamación, Prompt Studio podrá adoptar medidas temporales, tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ocultar el recurso.</li>
              <li>Suspender el acceso al contenido.</li>
              <li>Limitar temporalmente la disponibilidad del material.</li>
              <li>Restringir determinadas funcionalidades relacionadas con el recurso.</li>
            </ul>
            <p>La adopción de estas medidas no implica un reconocimiento de responsabilidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.5 Contra notificación</h3>
            <p>Cuando la legislación aplicable lo permita, el usuario afectado podrá presentar una contra notificación si considera que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posee autorización suficiente.</li>
              <li>El contenido no infringe derechos de terceros.</li>
              <li>La reclamación fue presentada por error.</li>
              <li>Existe una excepción legal aplicable.</li>
            </ul>
            <p>Prompt Studio evaluará la información recibida antes de adoptar una decisión definitiva.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.6 Cooperación con autoridades</h3>
            <p>Prompt Studio podrá colaborar con autoridades administrativas o judiciales cuando exista una obligación legal o una orden válida relacionada con una reclamación de propiedad intelectual.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.7 Falsas reclamaciones</h3>
            <p>La presentación deliberada de reclamaciones falsas, fraudulentas o de mala fe podrá generar responsabilidad conforme a la legislación aplicable.</p>
            <p>Prompt Studio se reserva el derecho de adoptar las medidas necesarias para proteger a los usuarios y a la Plataforma frente a este tipo de actuaciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">24.8 Protección de la propiedad intelectual</h3>
            <p>Prompt Studio mantiene un compromiso permanente con la protección de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Derechos de autor.</li>
              <li>Marcas.</li>
              <li>Diseños.</li>
              <li>Bases de datos.</li>
              <li>Secretos comerciales.</li>
              <li>Demás derechos de propiedad intelectual.</li>
            </ul>
            <p>La Plataforma actuará diligentemente frente a reclamaciones legítimas presentadas conforme a este procedimiento.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 25. Actualizaciones de la Política de Licencias
              </h2>
            </section>
            <p>Prompt Studio podrá modificar la presente Política de Licencias cuando resulte necesario para reflejar cambios en la legislación aplicable, en la evolución de la Plataforma, en los modelos de negocio, en las tecnologías utilizadas o en los recursos digitales ofrecidos.</p>
            <p>Las actualizaciones tienen como finalidad mantener este documento alineado con las mejores prácticas internacionales en materia de propiedad intelectual, licenciamiento de contenido digital y comercio electrónico.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.1 Derecho de modificación</h3>
            <p>Prompt Studio se reserva el derecho de modificar, complementar o sustituir esta Política cuando resulte necesario por motivos tales como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios legislativos.</li>
              <li>Nuevas obligaciones regulatorias.</li>
              <li>Incorporación de nuevos tipos de recursos digitales.</li>
              <li>Nuevos modelos de licenciamiento.</li>
              <li>Cambios tecnológicos.</li>
              <li>Evolución de las plataformas de Inteligencia Artificial.</li>
              <li>Mejoras en la seguridad jurídica.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.2 Publicación</h3>
            <p>La versión vigente de esta Política estará permanentemente disponible en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización aparecerá al inicio o al final del documento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.3 Comunicación de cambios</h3>
            <p>Cuando una modificación afecte de manera significativa los derechos o las obligaciones de los usuarios, Prompt Studio podrá comunicarla mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avisos dentro de la Plataforma.</li>
              <li>Correo electrónico.</li>
              <li>Notificaciones en la cuenta del usuario.</li>
              <li>Publicaciones en el sitio web.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.4 Entrada en vigor</h3>
            <p>Salvo que se indique expresamente otra fecha, las modificaciones entrarán en vigor desde el momento de su publicación.</p>
            <p>Las licencias adquiridas antes de la actualización continuarán rigiéndose por la versión vigente al momento de la compra, salvo que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación aplicable exija otra solución.</li>
              <li>El usuario acepte expresamente las nuevas condiciones.</li>
              <li>La modificación resulte necesaria para proteger la seguridad de la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.5 Licencias existentes</h3>
            <p>Las actualizaciones de esta Política no tendrán efectos retroactivos sobre los derechos válidamente adquiridos mediante licencias permanentes, salvo obligación legal en contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.6 Nuevos recursos</h3>
            <p>Cuando Prompt Studio incorpore nuevos tipos de recursos digitales, éstos quedarán automáticamente sujetos a esta Política salvo que se publique una licencia específica para dichos recursos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.7 Historial de versiones</h3>
            <p>Prompt Studio podrá conservar versiones anteriores de esta Política con fines de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento normativo.</li>
              <li>Auditorías.</li>
              <li>Evidencia documental.</li>
              <li>Resolución de controversias.</li>
              <li>Mejora continua.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">25.8 Revisión periódica</h3>
            <p>Prompt Studio recomienda revisar periódicamente esta Política para mantenerse informado sobre las condiciones aplicables al uso de los recursos digitales.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 26. Resolución de Controversias sobre Licencias
              </h2>
            </section>
            <p>Prompt Studio procurará resolver de buena fe cualquier controversia relacionada con el alcance, interpretación o aplicación de las licencias concedidas a los usuarios.</p>
            <p>Antes de iniciar procedimientos judiciales, administrativos o arbitrales, las partes procurarán buscar una solución amistosa.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.1 Contacto previo</h3>
            <p>Toda consulta relacionada con licencias deberá dirigirse inicialmente a:</p>
            <p>Correo electrónico oficial:</p>
            <p>support@prompstudio.com</p>
            <p>Prompt Studio analizará la situación y responderá dentro de un plazo razonable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.2 Resolución amistosa</h3>
            <p>Las partes procurarán resolver cualquier desacuerdo mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comunicación directa.</li>
              <li>Intercambio de información.</li>
              <li>Revisión de la licencia correspondiente.</li>
              <li>Buena fe contractual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.3 Interpretación</h3>
            <p>Las licencias deberán interpretarse de forma:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Razonable.</li>
              <li>Coherente.</li>
              <li>Conforme a la legislación aplicable.</li>
              <li>Respetando la finalidad de protección de la propiedad intelectual.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.4 Evidencia</h3>
            <p>En caso de controversia, Prompt Studio podrá utilizar como evidencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Historial de compras.</li>
              <li>Registros de acceso.</li>
              <li>Confirmaciones de licencia.</li>
              <li>Registros de descarga.</li>
              <li>Comunicaciones con el usuario.</li>
              <li>Información técnica disponible.</li>
            </ul>
            <p>Toda esta información será tratada conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.5 Colaboración</h3>
            <p>El usuario se compromete a colaborar razonablemente durante la resolución de cualquier controversia relacionada con una licencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.6 Derechos legales</h3>
            <p>Nada de lo dispuesto en esta sección limitará el derecho de cualquiera de las partes a acudir ante las autoridades competentes cuando resulte necesario para proteger sus derechos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.7 Legislación aplicable</h3>
            <p>La interpretación y ejecución de esta Política se regirá por la legislación indicada en los Términos y Condiciones de Prompt Studio, sin perjuicio de los derechos irrenunciables reconocidos por la legislación de protección al consumidor aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">26.8 Conservación de derechos</h3>
            <p>La resolución de una controversia no implicará renuncia alguna a los derechos de propiedad intelectual de Prompt Studio, Magzin LLC o de los titulares de los recursos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 27. Limitación de Responsabilidad
              </h2>
            </section>
            <p>Prompt Studio desarrolla y distribuye recursos digitales destinados a facilitar la creación de contenido mediante Inteligencia Artificial y otras tecnologías.</p>
            <p>Si bien Prompt Studio realiza esfuerzos razonables para mantener la calidad, utilidad y disponibilidad de sus productos, no puede garantizar que todos los recursos sean adecuados para todas las finalidades, industrias o situaciones particulares.</p>
            <p>El usuario es responsable de evaluar la idoneidad de cada recurso antes de utilizarlo en proyectos personales, comerciales o profesionales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.1 Sin garantía de resultados específicos</h3>
            <p>Prompt Studio no garantiza que un recurso digital produzca:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resultados idénticos.</li>
              <li>Resultados exactos.</li>
              <li>Resultados esperados por el usuario.</li>
              <li>Resultados compatibles con todos los modelos de Inteligencia Artificial.</li>
            </ul>
            <p>Los resultados dependerán de múltiples factores ajenos al control de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.2 Cambios en plataformas de IA</h3>
            <p>Los proveedores de Inteligencia Artificial pueden modificar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modelos.</li>
              <li>APIs.</li>
              <li>Algoritmos.</li>
              <li>Políticas.</li>
              <li>Restricciones.</li>
              <li>Funcionalidades.</li>
            </ul>
            <p>Prompt Studio no será responsable por los cambios realizados por dichas plataformas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.3 Exactitud del contenido</h3>
            <p>Aunque Prompt Studio procura ofrecer recursos de alta calidad, no garantiza que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Todos los prompts estén libres de errores.</li>
              <li>Todos los ejemplos sean adecuados para todos los casos.</li>
              <li>Todo el contenido permanezca actualizado indefinidamente.</li>
            </ul>
            <p>El usuario deberá verificar los resultados obtenidos antes de utilizarlos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.4 Uso profesional</h3>
            <p>Los recursos vendidos por Prompt Studio constituyen herramientas de apoyo.</p>
            <p>No sustituyen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Asesoramiento jurídico.</li>
              <li>Asesoramiento médico.</li>
              <li>Asesoramiento financiero.</li>
              <li>Asesoramiento fiscal.</li>
              <li>Asesoramiento profesional especializado.</li>
            </ul>
            <p>El usuario será responsable de consultar a los profesionales correspondientes cuando resulte necesario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.5 Servicios de terceros</h3>
            <p>Prompt Studio no controla el funcionamiento de servicios externos utilizados junto con los recursos digitales, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modelos de IA.</li>
              <li>APIs.</li>
              <li>Plataformas de alojamiento.</li>
              <li>Servicios de nube.</li>
              <li>Herramientas de terceros.</li>
            </ul>
            <p>Por ello, Prompt Studio no será responsable por fallos, interrupciones o modificaciones realizadas por dichos proveedores.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.6 Interrupciones</h3>
            <p>Prompt Studio procurará mantener disponible la Plataforma de forma continua.</p>
            <p>No obstante, podrán producirse interrupciones por motivos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mantenimiento.</li>
              <li>Actualizaciones.</li>
              <li>Fallos técnicos.</li>
              <li>Ataques informáticos.</li>
              <li>Problemas de infraestructura.</li>
              <li>Fuerza mayor.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.7 Limitación económica</h3>
            <p>En la máxima medida permitida por la legislación aplicable, la responsabilidad total de Prompt Studio derivada de una licencia o de un recurso digital no excederá el importe efectivamente pagado por el usuario por dicho recurso.</p>
            <p>Esta limitación no afectará los derechos irrenunciables reconocidos por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">27.8 Aceptación</h3>
            <p>Al adquirir un recurso digital, el usuario reconoce que comprende las limitaciones inherentes al uso de herramientas de Inteligencia Artificial y acepta utilizar los recursos bajo su propia responsabilidad.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 28. Disposiciones Finales sobre Licencias
              </h2>
            </section>
            <p>La presente Política constituye el documento principal que regula las licencias aplicables a todos los recursos digitales comercializados por Prompt Studio.</p>
            <p>Cualquier cuestión no prevista expresamente en esta Política se interpretará conjuntamente con los Términos y Condiciones y la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.1 Integración contractual</h3>
            <p>Esta Política forma parte integrante del acuerdo celebrado entre Prompt Studio y el usuario.</p>
            <p>La adquisición de cualquier recurso implica la aceptación de todas sus disposiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.2 Independencia de cláusulas</h3>
            <p>Si alguna disposición de esta Política fuera declarada inválida, ilegal o inaplicable por una autoridad competente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las restantes disposiciones continuarán plenamente vigentes.</li>
              <li>La cláusula afectada se interpretará en la medida máxima permitida por la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.3 No renuncia</h3>
            <p>La falta de ejercicio por parte de Prompt Studio de cualquiera de los derechos previstos en esta Política no constituirá una renuncia a dichos derechos.</p>
            <p>Toda renuncia deberá realizarse expresamente y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.4 Idioma</h3>
            <p>Prompt Studio podrá publicar versiones traducidas de esta Política.</p>
            <p>En caso de discrepancia entre distintas traducciones, prevalecerá la versión oficial publicada en inglés (o en el idioma oficialmente designado por Prompt Studio), salvo que una ley imperativa disponga lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.5 Supervivencia</h3>
            <p>Las siguientes obligaciones continuarán vigentes incluso después de finalizar una licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Propiedad intelectual.</li>
              <li>Derechos de autor.</li>
              <li>Prohibición de redistribución.</li>
              <li>Prohibición de reventa.</li>
              <li>Limitación de responsabilidad.</li>
              <li>Confidencialidad cuando corresponda.</li>
              <li>Resolución de controversias.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.6 Cesión</h3>
            <p>El usuario no podrá ceder ni transferir los derechos derivados de una licencia sin autorización previa y por escrito de Prompt Studio.</p>
            <p>Prompt Studio podrá transferir esta Política en caso de reorganización empresarial, fusión, adquisición o cesión del negocio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.7 Fecha de entrada en vigor</h3>
            <p>Fecha de entrada en vigor:</p>
            <p>1 de enero de 2026 (o la fecha que determine Prompt Studio).</p>
            <p>Última actualización:</p>
            <p>2026</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">28.8 Aplicación internacional</h3>
            <p>Esta Política será aplicable a todos los usuarios de Prompt Studio, independientemente de su país de residencia, sin perjuicio de los derechos obligatorios que puedan reconocer las leyes de protección al consumidor aplicables.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 29. Declaración Oficial de la Política de Licencias
              </h2>
            </section>
            <p>La presente Política de Licencias constituye el documento oficial que regula el uso de todos los recursos digitales ofrecidos por Prompt Studio.</p>
            <p>Su finalidad es proteger los derechos de propiedad intelectual de Prompt Studio, Magzin LLC, sus autores, colaboradores y licenciantes, al tiempo que establece de forma clara los derechos y obligaciones de los usuarios que adquieren licencias sobre dichos recursos.</p>
            <p>La utilización de cualquier producto digital disponible en Prompt Studio implica la aceptación íntegra de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.1 Principio general</h3>
            <p>Todas las licencias concedidas por Prompt Studio son limitadas y se interpretarán estrictamente conforme a las condiciones expresamente establecidas en esta Política y en la descripción del producto correspondiente.</p>
            <p>Ningún derecho se entenderá concedido por implicación, costumbre o interpretación extensiva.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.2 Propiedad intelectual</h3>
            <p>La adquisición de un producto digital no implica:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La compra del copyright.</li>
              <li>La cesión de derechos patrimoniales.</li>
              <li>La cesión de marcas.</li>
              <li>La cesión de diseños.</li>
              <li>La cesión de secretos comerciales.</li>
              <li>La transferencia de propiedad intelectual.</li>
            </ul>
            <p>El usuario adquiere únicamente una licencia de uso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.3 Protección del ecosistema</h3>
            <p>Las restricciones previstas en esta Política tienen como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proteger el trabajo de los autores.</li>
              <li>Garantizar la sostenibilidad de Prompt Studio.</li>
              <li>Evitar la piratería.</li>
              <li>Combatir la redistribución ilegal.</li>
              <li>Proteger a los compradores legítimos.</li>
              <li>Preservar el valor de los recursos digitales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.4 Respeto entre usuarios</h3>
            <p>Prompt Studio promueve una comunidad basada en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El respeto a la propiedad intelectual.</li>
              <li>El uso responsable de la Inteligencia Artificial.</li>
              <li>La creatividad.</li>
              <li>La innovación.</li>
              <li>La competencia leal.</li>
            </ul>
            <p>Todos los usuarios se comprometen a respetar estos principios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.5 Licencias futuras</h3>
            <p>Prompt Studio podrá desarrollar nuevas modalidades de licencia conforme evolucione la industria de la Inteligencia Artificial y de los productos digitales.</p>
            <p>Las nuevas modalidades serán publicadas oportunamente y se aplicarán únicamente a los recursos correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.6 Derechos reservados</h3>
            <p>Todos los derechos que no hayan sido concedidos expresamente mediante esta Política permanecerán reservados a:</p>
            <p>Magzin LLC</p>
            <p>Prompt Studio</p>
            <p>o a los titulares correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.7 Interpretación favorable a la protección</h3>
            <p>Cuando exista duda acerca del alcance de una licencia, ésta deberá interpretarse de forma que se preserve la protección de la propiedad intelectual y el cumplimiento de la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">29.8 Declaración final</h3>
            <p>Prompt Studio agradece la confianza de sus usuarios y reafirma su compromiso con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La innovación.</li>
              <li>La protección de la creatividad.</li>
              <li>El desarrollo responsable de herramientas de Inteligencia Artificial.</li>
              <li>El respeto por los derechos de propiedad intelectual.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 30. Información Corporativa y Contacto
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de sus usuarios canales oficiales para resolver cualquier consulta relacionada con licencias, propiedad intelectual o el uso autorizado de los recursos digitales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.1 Operador de la Plataforma</h3>
            <p>Prompt Studio</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.2 Domicilio</h3>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.3 Sitio web oficial</h3>
            <p>https://www.promptstudio.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.4 Correo electrónico oficial</h3>
            <p>support@promptstudio.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.5 Consultas sobre licencias</h3>
            <p>Las consultas relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Licencias.</li>
              <li>Derechos de uso.</li>
              <li>Propiedad intelectual.</li>
              <li>Permisos especiales.</li>
              <li>Licencias Enterprise.</li>
              <li>Licencias personalizadas.</li>
              <li>Autorizaciones comerciales.</li>
            </ul>
            <p>deberán dirigirse exclusivamente al correo oficial indicado anteriormente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.6 Solicitudes especiales</h3>
            <p>Las organizaciones que requieran:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Licencias corporativas.</li>
              <li>Licencias para universidades.</li>
              <li>Licencias gubernamentales.</li>
              <li>Licencias OEM.</li>
              <li>Licencias de distribución autorizada.</li>
              <li>Acuerdos comerciales especiales.</li>
            </ul>
            <p>podrán contactar con Prompt Studio para solicitar una propuesta personalizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.7 Derechos de terceros</h3>
            <p>Si un tercero considera que algún contenido publicado en Prompt Studio infringe sus derechos de propiedad intelectual, podrá contactar mediante:</p>
            <p>support@promptstudio.com</p>
            <p>Prompt Studio analizará la reclamación conforme al procedimiento previsto en la Política DMCA y Copyright.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">30.8 Declaración de cierre</h3>
            <p>Al adquirir, descargar o utilizar cualquier recurso digital disponible en Prompt Studio, el usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha leído íntegramente esta Política de Licencias.</li>
              <li>Comprende el alcance de la licencia adquirida.</li>
              <li>Acepta respetar las limitaciones establecidas.</li>
              <li>Reconoce que la propiedad intelectual permanece en poder de Prompt Studio, Magzin LLC o del titular correspondiente.</li>
              <li>Se compromete a utilizar los recursos de forma legal, ética y conforme a esta Política.</li>
            </ul>
            <p>Declaración Oficial</p>
            <p>Política de Licencias de Prompt Studio</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web oficial:</p>
            <p>https://www.promptstudio.com</p>
            <p>Correo electrónico oficial:</p>
            <p>support@promptstudio.com</p>
            <p>Fecha de entrada en vigor:</p>
            <p>1 de enero de 2026 (o la fecha que determine Prompt Studio).</p>
            <p>Última actualización:</p>
            <p>2026</p>
            <p>© 2026 Prompt Studio. Todos los derechos reservados.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
