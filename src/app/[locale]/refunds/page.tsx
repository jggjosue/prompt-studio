import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Política de No Reembolsos | Prompt Studio',
  description: 'Política de No Reembolsos de Prompt Studio.',
  alternates: {
    canonical: '/refunds',
  },
};

export default function RefundsPolicyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Política de No Reembolsos
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Última actualización: <span className="font-medium text-foreground">2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>POLÍTICA DE NO REEMBOLSOS</p>
            <p>Última actualización: 2026</p>
            <p>Bienvenido a Prompt Studio, disponible en https://www.prompstudio.com, operado por Magzin LLC, 800 Third Avenue Associates, New York, NY 10022, United States.</p>
            <p>La presente Política de No Reembolsos explica las condiciones aplicables a la compra de productos digitales, suscripciones y demás servicios ofrecidos por Prompt Studio.</p>
            <p>Esta Política forma parte integrante de los Términos y Condiciones, la Política de Privacidad y los demás documentos legales publicados por Prompt Studio.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 1. Introducción
              </h2>
            </section>
            <p>Prompt Studio comercializa principalmente productos digitales, incluyendo, entre otros:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para Inteligencia Artificial.</li>
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo de aplicaciones.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Recursos HTML.</li>
              <li>Plantillas.</li>
              <li>Archivos digitales.</li>
              <li>Recursos Premium.</li>
              <li>Suscripciones digitales.</li>
            </ul>
            <p>Debido a la naturaleza de estos productos, las compras realizadas a través de Prompt Studio son, por regla general, definitivas.</p>
            <p>Una vez que el usuario obtiene acceso al contenido digital adquirido, éste puede copiarse, descargarse o utilizarse de forma inmediata, lo que impide devolver el producto en las mismas condiciones en que fue entregado.</p>
            <p>Por esta razón, Prompt Studio mantiene una política general de no reembolsos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.1 Finalidad</h3>
            <p>Esta Política tiene como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Informar claramente las condiciones de compra.</li>
              <li>Evitar malentendidos.</li>
              <li>Proteger los derechos del consumidor.</li>
              <li>Garantizar la transparencia comercial.</li>
              <li>Cumplir la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.2 Alcance</h3>
            <p>Esta Política aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras únicas.</li>
              <li>Recursos Premium.</li>
              <li>Productos digitales.</li>
              <li>Suscripciones.</li>
              <li>Contenido descargable.</li>
              <li>Recursos generados mediante IA.</li>
              <li>Cualquier otro producto digital comercializado por Prompt Studio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.3 Naturaleza de los productos</h3>
            <p>Todos los productos comercializados por Prompt Studio son bienes digitales de entrega inmediata.</p>
            <p>Una vez concedido el acceso al recurso adquirido, el usuario obtiene la posibilidad de utilizarlo de manera inmediata.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.4 Regla general</h3>
            <p>Salvo que una ley imperativa disponga lo contrario:</p>
            <p>Todas las ventas realizadas en Prompt Studio son finales.</p>
            <p>No se concederán devoluciones, cancelaciones ni reembolsos una vez que el usuario haya recibido acceso al contenido adquirido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.5 Base legal</h3>
            <p>Esta Política se fundamenta en que los productos vendidos por Prompt Studio constituyen contenido digital suministrado por medios electrónicos cuya utilización comienza inmediatamente después de la compra.</p>
            <p>Cuando la legislación del país del usuario establezca derechos irrenunciables distintos, Prompt Studio respetará dichas disposiciones en la medida exigida por la ley.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.6 Transparencia</h3>
            <p>Prompt Studio procura que el usuario conozca previamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qué está comprando.</li>
              <li>Qué incluye el producto.</li>
              <li>Qué licencia recibe.</li>
              <li>Qué funcionalidades están disponibles.</li>
              <li>Qué limitaciones existen.</li>
            </ul>
            <p>Antes de completar la compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.7 Lectura previa</h3>
            <p>Al realizar una compra, el usuario declara haber leído:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La descripción del producto.</li>
              <li>Las licencias aplicables.</li>
              <li>Los Términos y Condiciones.</li>
              <li>La presente Política de No Reembolsos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">1.8 Contacto</h3>
            <p>Para cualquier consulta relacionada con compras o esta Política, el usuario podrá comunicarse con:</p>
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
                Sección 2. Principio General de No Reembolso
              </h2>
            </section>
            <p>Prompt Studio vende contenido digital cuya entrega se realiza inmediatamente después de confirmarse el pago.</p>
            <p>Por ello, una vez que el usuario obtiene acceso al recurso adquirido, no será posible solicitar un reembolso, salvo cuando una disposición legal obligatoria establezca expresamente lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Entrega inmediata</h3>
            <p>Los productos digitales se entregan inmediatamente mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceso en la cuenta del usuario.</li>
              <li>Descarga.</li>
              <li>Activación de licencias.</li>
              <li>Desbloqueo del contenido Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Imposibilidad de devolución</h3>
            <p>A diferencia de un producto físico, un recurso digital no puede devolverse una vez que ha sido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargado.</li>
              <li>Visualizado.</li>
              <li>Copiado.</li>
              <li>Utilizado.</li>
              <li>Activado.</li>
            </ul>
            <p>Por ello, no resulta posible restituir el producto al estado previo a la compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Compras conscientes</h3>
            <p>El usuario es responsable de revisar cuidadosamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La descripción del producto.</li>
              <li>Las imágenes.</li>
              <li>Las demostraciones disponibles.</li>
              <li>Las licencias.</li>
              <li>Los requisitos técnicos.</li>
            </ul>
            <p>Antes de completar el pago.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Confirmación de compra</h3>
            <p>Al finalizar el proceso de pago mediante Stripe, el usuario confirma voluntariamente que desea adquirir el producto y acepta esta Política de No Reembolsos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Errores del usuario</h3>
            <p>No procederán reembolsos cuando la compra se haya realizado por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Error del usuario.</li>
              <li>Cambio de opinión.</li>
              <li>Compra accidental.</li>
              <li>Confusión respecto al contenido.</li>
              <li>Falta de lectura de la descripción.</li>
              <li>Incompatibilidad derivada de no revisar los requisitos técnicos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.6 Uso parcial</h3>
            <p>No se concederán reembolsos cuando el usuario haya utilizado total o parcialmente el recurso adquirido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.7 Compras promocionales</h3>
            <p>Las compras realizadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descuentos.</li>
              <li>Cupones.</li>
              <li>Promociones.</li>
              <li>Ofertas especiales.</li>
            </ul>
            <p>También estarán sujetas a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.8 Excepciones legales</h3>
            <p>Nada de lo dispuesto en esta Política limitará los derechos irrenunciables que la legislación obligatoria del país del consumidor pueda reconocer.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 3. Casos en los que No Procede el Reembolso
              </h2>
            </section>
            <p>Con el fin de proteger la propiedad intelectual de los recursos digitales comercializados por Prompt Studio y garantizar un tratamiento equitativo para todos los usuarios, no procederán reembolsos en los casos descritos en esta sección.</p>
            <p>La adquisición de un producto digital implica la aceptación expresa de esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.1 Cambio de opinión</h3>
            <p>No se concederán reembolsos cuando el usuario:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambie de opinión después de la compra.</li>
              <li>Decida que ya no necesita el producto.</li>
              <li>Encuentre posteriormente otra alternativa.</li>
              <li>Considere que el producto ya no le resulta útil.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.2 Compra accidental</h3>
            <p>No procederá el reembolso cuando la compra haya sido realizada accidentalmente por el propio usuario.</p>
            <p>Antes de confirmar el pago, Prompt Studio muestra un resumen de la compra y solicita la confirmación correspondiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.3 Error al seleccionar el producto</h3>
            <p>El usuario es responsable de verificar cuidadosamente el producto antes de completar la compra.</p>
            <p>No procederán reembolsos cuando el usuario adquiera:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Un prompt equivocado.</li>
              <li>Una plantilla diferente a la deseada.</li>
              <li>Un recurso con características distintas a las esperadas.</li>
              <li>Una licencia incorrecta.</li>
            </ul>
            <p>Siempre que la descripción publicada sea correcta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.4 Incompatibilidad técnica conocida</h3>
            <p>No procederán reembolsos cuando el usuario adquiera un producto incompatible con su entorno por no haber revisado previamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los requisitos técnicos.</li>
              <li>Los modelos de IA compatibles.</li>
              <li>Las plataformas soportadas.</li>
              <li>Las versiones indicadas en la descripción del producto.</li>
            </ul>
            <p>Prompt Studio recomienda revisar cuidadosamente esta información antes de realizar cualquier compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.5 Falta de conocimientos técnicos</h3>
            <p>No se realizarán reembolsos cuando el usuario no pueda utilizar correctamente un producto debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Falta de experiencia.</li>
              <li>Desconocimiento técnico.</li>
              <li>Falta de capacitación.</li>
              <li>Uso incorrecto de herramientas de Inteligencia Artificial.</li>
            </ul>
            <p>Prompt Studio ofrece descripciones claras de cada recurso, pero no garantiza el nivel de conocimientos del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.6 Resultados diferentes</h3>
            <p>Los resultados generados mediante Inteligencia Artificial pueden variar según:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El modelo utilizado.</li>
              <li>La versión del modelo.</li>
              <li>La configuración.</li>
              <li>El idioma.</li>
              <li>El contexto del prompt.</li>
              <li>Las instrucciones adicionales.</li>
            </ul>
            <p>Por ello, no procederán reembolsos porque el resultado obtenido sea diferente al esperado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.7 Uso parcial o total</h3>
            <p>No procederán reembolsos cuando el usuario haya:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargado el recurso.</li>
              <li>Accedido al contenido Premium.</li>
              <li>Copiado el prompt.</li>
              <li>Utilizado el recurso.</li>
              <li>Exportado el contenido.</li>
              <li>Visualizado el material adquirido cuando ello implique acceso permanente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">3.8 Compras realizadas con promociones</h3>
            <p>Las compras efectuadas utilizando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cupones.</li>
              <li>Descuentos.</li>
              <li>Promociones.</li>
              <li>Programas de fidelidad.</li>
              <li>Beneficios especiales.</li>
            </ul>
            <p>Continuarán sujetas a esta Política de No Reembolsos.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 4. Excepciones Legales
              </h2>
            </section>
            <p>Prompt Studio reconoce que determinadas legislaciones nacionales pueden establecer derechos irrenunciables para los consumidores.</p>
            <p>En consecuencia, las limitaciones previstas en esta Política se aplicarán únicamente en la medida permitida por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.1 Derechos del consumidor</h3>
            <p>Nada de lo dispuesto en esta Política limitará los derechos obligatorios que correspondan al usuario conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La legislación de protección al consumidor.</li>
              <li>La normativa sobre comercio electrónico.</li>
              <li>Otras disposiciones legales imperativas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.2 Error atribuible a Prompt Studio</h3>
            <p>Prompt Studio podrá evaluar excepcionalmente una solución cuando exista un error técnico grave directamente atribuible a la Plataforma, por ejemplo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El producto adquirido nunca fue entregado.</li>
              <li>El archivo está completamente dañado.</li>
              <li>El recurso adquirido no corresponde con la descripción publicada.</li>
              <li>Existe un error técnico que impide permanentemente el acceso al producto.</li>
            </ul>
            <p>En estos casos, Prompt Studio podrá optar, a su exclusiva discreción y conforme a la legislación aplicable, por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Restablecer el acceso.</li>
              <li>Sustituir el recurso.</li>
              <li>Entregar nuevamente el producto.</li>
              <li>Conceder un crédito para futuras compras.</li>
              <li>Procesar un reembolso cuando no exista otra solución razonable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.3 Cobros duplicados</h3>
            <p>Si el usuario demuestra que se produjo un cobro duplicado por la misma compra debido a un error técnico, Prompt Studio verificará la incidencia y, de confirmarse, procederá a corregirla mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La devolución del importe duplicado.</li>
              <li>La cancelación del cargo adicional.</li>
              <li>Otra solución equivalente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.4 Fraude comprobado</h3>
            <p>Cuando una entidad financiera, Stripe o una autoridad competente determine que una operación fue realizada de manera fraudulenta sin intervención del titular legítimo del medio de pago, Prompt Studio colaborará con la investigación y actuará conforme a la normativa aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.5 Obligaciones legales</h3>
            <p>Si una autoridad competente ordena la devolución de un importe o la legislación obliga a realizar un reembolso en un caso específico, Prompt Studio cumplirá dicha obligación en los términos establecidos por la ley.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.6 Resolución amistosa</h3>
            <p>Aunque esta Política establece una regla general de no reembolsos, Prompt Studio procurará analizar de buena fe cualquier incidencia comunicada por el usuario para buscar una solución razonable cuando resulte posible.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.7 Procedimiento</h3>
            <p>Las solicitudes relacionadas con incidencias deberán enviarse a:</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>El usuario deberá proporcionar toda la información necesaria para que Prompt Studio pueda verificar el caso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">4.8 Alcance de las excepciones</h3>
            <p>Las excepciones previstas en esta sección no constituyen un reconocimiento general del derecho al reembolso.</p>
            <p>Cada caso será evaluado individualmente conforme a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La evidencia disponible.</li>
              <li>La legislación aplicable.</li>
              <li>Las circunstancias particulares del incidente.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 5. Suscripciones Premium
              </h2>
            </section>
            <p>Prompt Studio puede ofrecer planes de suscripción que permiten acceder a funciones Premium, contenido exclusivo, herramientas avanzadas o recursos digitales adicionales mediante el pago periódico de una tarifa.</p>
            <p>Las suscripciones son procesadas de forma segura mediante Stripe y se rigen por los presentes Términos, la Política de Suscripción Premium y esta Política de No Reembolsos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.1 Naturaleza de la suscripción</h3>
            <p>Las suscripciones otorgan un derecho de acceso temporal a determinados servicios de Prompt Studio.</p>
            <p>La suscripción no transfiere la propiedad de los recursos digitales, sino que concede una licencia limitada de uso durante el período contratado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.2 Inicio del servicio</h3>
            <p>El acceso a las funciones Premium comenzará una vez que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe confirme el pago.</li>
              <li>La suscripción sea activada correctamente.</li>
              <li>La cuenta del usuario sea habilitada para acceder al contenido correspondiente.</li>
            </ul>
            <p>Desde ese momento se considerará iniciado el período de suscripción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.3 No reembolso del período iniciado</h3>
            <p>Una vez iniciado el período de suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No procederán reembolsos parciales.</li>
              <li>No procederán reembolsos proporcionales.</li>
              <li>No procederán devoluciones por falta de uso.</li>
              <li>No procederán reembolsos porque el usuario decida cancelar antes del vencimiento del período contratado.</li>
            </ul>
            <p>El usuario conservará el acceso hasta la finalización del período previamente pagado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.4 Acceso durante la vigencia</h3>
            <p>Mientras la suscripción permanezca activa, el usuario podrá acceder a los beneficios incluidos en el plan contratado, conforme a las condiciones vigentes en el momento de la contratación.</p>
            <p>Prompt Studio podrá actualizar o mejorar dichos beneficios sin que ello implique una reducción injustificada del servicio contratado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.5 Cambios de plan</h3>
            <p>Cuando Prompt Studio permita cambiar entre distintos planes de suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los cambios podrán aplicarse inmediatamente o al inicio del siguiente ciclo de facturación.</li>
              <li>Las condiciones específicas serán informadas durante el proceso de modificación.</li>
              <li>No se garantizarán reembolsos por diferencias entre planes, salvo obligación legal.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.6 Suspensión por incumplimiento</h3>
            <p>Prompt Studio podrá suspender temporalmente el acceso a la suscripción cuando detecte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incumplimiento de los Términos y Condiciones.</li>
              <li>Uso fraudulento.</li>
              <li>Compartición no autorizada de cuentas.</li>
              <li>Manipulación de los sistemas de pago.</li>
              <li>Actividades que comprometan la seguridad de la Plataforma.</li>
            </ul>
            <p>La suspensión por incumplimiento no generará derecho a reembolso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.7 Finalización de la suscripción</h3>
            <p>Al finalizar el período contratado o cancelarse la suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario perderá el acceso a las funciones Premium.</li>
              <li>Continuará teniendo acceso a las funcionalidades gratuitas disponibles.</li>
              <li>Los recursos adquiridos mediante compras independientes conservarán las condiciones de licencia aplicables.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">5.8 Legislación aplicable</h3>
            <p>Las disposiciones relativas a las suscripciones se interpretarán conforme a la legislación aplicable en materia de comercio electrónico y protección del consumidor, respetando los derechos irrenunciables reconocidos por la ley.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 6. Renovaciones Automáticas y Cancelaciones
              </h2>
            </section>
            <p>Las suscripciones ofrecidas por Prompt Studio podrán renovarse automáticamente al finalizar cada período de facturación, salvo que el usuario las cancele antes de la fecha de renovación.</p>
            <p>El usuario será informado de las condiciones de renovación durante el proceso de contratación.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.1 Renovación automática</h3>
            <p>Cuando una suscripción incluya renovación automática:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe procesará el cobro correspondiente al siguiente período.</li>
              <li>La renovación se realizará utilizando el método de pago registrado por el usuario.</li>
              <li>El acceso Premium continuará sin interrupciones mientras el pago sea exitoso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.2 Cancelación por el usuario</h3>
            <p>El usuario podrá cancelar la renovación automática en cualquier momento desde:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Portal del Cliente de Stripe, cuando esté disponible.</li>
              <li>La configuración de su cuenta.</li>
              <li>Los medios habilitados por Prompt Studio.</li>
            </ul>
            <p>La cancelación impedirá futuras renovaciones, pero no afectará el período ya pagado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.3 Efectos de la cancelación</h3>
            <p>Cuando el usuario cancele una suscripción:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No se realizarán nuevos cobros automáticos.</li>
              <li>El acceso Premium permanecerá disponible hasta la fecha de vencimiento del período contratado.</li>
              <li>Finalizado dicho período, la cuenta volverá al plan gratuito, si existe.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.4 Pagos ya procesados</h3>
            <p>Los pagos correspondientes a un período de suscripción que ya haya comenzado no serán reembolsados, salvo que una disposición legal obligatoria establezca lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.5 Fallos en el cobro</h3>
            <p>Si Stripe no puede procesar un pago de renovación por cualquier motivo, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspender temporalmente el acceso Premium.</li>
              <li>Intentar nuevamente el cobro conforme a las políticas de Stripe.</li>
              <li>Cancelar la suscripción cuando el pago no pueda completarse.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.6 Eliminación de la cuenta</h3>
            <p>La eliminación de la cuenta por parte del usuario no implica automáticamente la cancelación de una suscripción activa.</p>
            <p>El usuario deberá cancelar previamente la renovación automática para evitar futuros cargos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.7 Confirmaciones</h3>
            <p>Prompt Studio podrá enviar confirmaciones relacionadas con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inicio de la suscripción.</li>
              <li>Renovaciones.</li>
              <li>Cancelaciones.</li>
              <li>Cambios de plan.</li>
              <li>Vencimientos.</li>
              <li>Incidencias de pago.</li>
            </ul>
            <p>Estas comunicaciones se enviarán al correo electrónico asociado a la cuenta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">6.8 Transparencia</h3>
            <p>Prompt Studio procura que toda la información relacionada con las suscripciones sea clara y accesible antes de que el usuario confirme la contratación.</p>
            <p>El usuario es responsable de revisar cuidadosamente las condiciones del plan seleccionado antes de completar el proceso de pago.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 7. Contracargos (Chargebacks)
              </h2>
            </section>
            <p>Prompt Studio procura resolver cualquier incidencia relacionada con compras o suscripciones de manera amistosa y transparente.</p>
            <p>Antes de iniciar una disputa de pago (“chargeback”) ante una entidad financiera o a través de Stripe, se recomienda al usuario ponerse en contacto con nuestro equipo de soporte para intentar resolver la situación.</p>
            <p>Los contracargos injustificados pueden generar costos administrativos y afectar la seguridad del ecosistema de pagos, por lo que Prompt Studio podrá adoptar las medidas previstas en esta sección cuando detecte un uso indebido de este mecanismo.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 ¿Qué es un contracargo?</h3>
            <p>Un contracargo (“chargeback”) es el procedimiento mediante el cual el titular de un medio de pago solicita a su banco o entidad emisora la devolución de un cargo realizado en su tarjeta u otro método de pago.</p>
            <p>Este procedimiento es independiente de la Política de No Reembolsos de Prompt Studio y es gestionado directamente por la entidad financiera y Stripe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Contacto previo</h3>
            <p>Antes de iniciar un contracargo, Prompt Studio recomienda que el usuario contacte a:</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>Muchas incidencias pueden resolverse rápidamente mediante soporte técnico, evitando procesos bancarios innecesarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Investigación</h3>
            <p>Cuando Prompt Studio reciba una notificación de contracargo podrá revisar, entre otros elementos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Historial de la compra.</li>
              <li>Fecha y hora del pago.</li>
              <li>Confirmación de Stripe.</li>
              <li>Dirección IP utilizada.</li>
              <li>Registro de acceso al producto.</li>
              <li>Descargas realizadas.</li>
              <li>Activación de la suscripción.</li>
              <li>Uso de la cuenta.</li>
              <li>Confirmaciones enviadas por correo electrónico.</li>
            </ul>
            <p>Esta información podrá utilizarse para responder formalmente al procedimiento iniciado ante la entidad financiera.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Contracargos fraudulentos</h3>
            <p>Prompt Studio podrá considerar como fraudulentos los contracargos iniciados cuando exista evidencia razonable de que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario recibió correctamente el producto.</li>
              <li>El contenido fue descargado o utilizado.</li>
              <li>La suscripción fue activada.</li>
              <li>El titular autorizó originalmente el pago.</li>
              <li>La reclamación contradice la evidencia disponible.</li>
            </ul>
            <p>En estos casos, Prompt Studio podrá ejercer las acciones permitidas por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Medidas adoptadas</h3>
            <p>Cuando un contracargo sea considerado fraudulento o abusivo, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspender temporalmente la cuenta.</li>
              <li>Revocar el acceso a recursos Premium.</li>
              <li>Cancelar la suscripción activa.</li>
              <li>Bloquear futuras compras.</li>
              <li>Restringir determinados servicios.</li>
              <li>Conservar registros relacionados con la incidencia.</li>
              <li>Colaborar con Stripe y la entidad financiera durante la investigación.</li>
            </ul>
            <p>Estas medidas podrán adoptarse respetando siempre la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Evidencia</h3>
            <p>Para responder a un contracargo, Prompt Studio podrá presentar información como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmación del pago.</li>
              <li>Registros de autenticación.</li>
              <li>Confirmación del acceso al producto.</li>
              <li>Historial de actividad.</li>
              <li>Licencias activadas.</li>
              <li>Correos electrónicos enviados.</li>
              <li>Confirmaciones de compra.</li>
              <li>Registros técnicos del sistema.</li>
            </ul>
            <p>Toda la información será tratada conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Derechos del usuario</h3>
            <p>La adopción de medidas frente a un contracargo no limita los derechos que correspondan al usuario conforme a la legislación aplicable.</p>
            <p>El usuario podrá aportar información adicional para aclarar cualquier incidencia durante el procedimiento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Buena fe</h3>
            <p>Prompt Studio actuará de buena fe durante la gestión de cualquier disputa de pago y procurará alcanzar una solución razonable cuando resulte posible.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 8. Resolución de Incidencias de Compra
              </h2>
            </section>
            <p>Prompt Studio mantiene un compromiso con la atención al cliente y procurará resolver de manera rápida cualquier incidencia relacionada con compras, pagos, activación de productos o acceso a recursos digitales.</p>
            <p>Aunque la regla general es la ausencia de reembolsos, ello no impide que Prompt Studio ofrezca asistencia para solucionar problemas técnicos o administrativos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.1 Incidencias cubiertas</h3>
            <p>El usuario podrá contactar con Prompt Studio cuando experimente situaciones como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El producto no aparece en su cuenta.</li>
              <li>Error durante la descarga.</li>
              <li>Problemas de activación.</li>
              <li>Pago confirmado sin acceso al contenido.</li>
              <li>Duplicidad de cargos.</li>
              <li>Problemas relacionados con la suscripción.</li>
              <li>Errores técnicos atribuibles a la Plataforma.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.2 Información necesaria</h3>
            <p>Para facilitar la atención, el usuario deberá proporcionar, cuando sea posible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre de la cuenta.</li>
              <li>Dirección de correo electrónico utilizada en la compra.</li>
              <li>Fecha aproximada del pago.</li>
              <li>Número de pedido o identificador de la transacción.</li>
              <li>Descripción detallada del problema.</li>
              <li>Capturas de pantalla, si resultan útiles.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.3 Plazo de respuesta</h3>
            <p>Prompt Studio procurará responder las solicitudes de soporte dentro de un plazo razonable.</p>
            <p>El tiempo de resolución podrá variar dependiendo de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La complejidad del caso.</li>
              <li>La información proporcionada.</li>
              <li>La participación de proveedores externos como Stripe.</li>
              <li>El volumen de solicitudes recibidas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.4 Soluciones disponibles</h3>
            <p>Cuando se confirme una incidencia técnica atribuible a Prompt Studio, podrán adoptarse, entre otras, las siguientes medidas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Restablecer el acceso al producto.</li>
              <li>Reactivar una suscripción.</li>
              <li>Entregar nuevamente el recurso adquirido.</li>
              <li>Corregir errores de activación.</li>
              <li>Resolver problemas técnicos.</li>
              <li>Proporcionar instrucciones adicionales para el uso del producto.</li>
            </ul>
            <p>Estas soluciones no implican necesariamente la realización de un reembolso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.5 Comunicación</h3>
            <p>Las incidencias serán atendidas exclusivamente a través de los canales oficiales de Prompt Studio.</p>
            <p>Correo electrónico oficial:</p>
            <p>help@prompstudio.com</p>
            <p>Prompt Studio podrá solicitar información adicional cuando sea necesaria para verificar la incidencia.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.6 Colaboración del usuario</h3>
            <p>El usuario se compromete a colaborar razonablemente durante la investigación de cualquier incidencia, proporcionando información veraz y suficiente para permitir su análisis.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.7 Solución amistosa</h3>
            <p>Antes de acudir a procedimientos judiciales, administrativos o financieros, Prompt Studio y el usuario procurarán resolver las incidencias mediante comunicación directa y de buena fe.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">8.8 Compromiso con la calidad</h3>
            <p>Prompt Studio trabaja continuamente para ofrecer productos digitales de alta calidad y una experiencia de compra satisfactoria.</p>
            <p>Aunque la naturaleza de los productos digitales impide la aplicación de una política general de reembolsos, Prompt Studio se compromete a atender todas las incidencias legítimas de manera profesional, transparente y conforme a la legislación aplicable.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 9. Productos Digitales
              </h2>
            </section>
            <p>Prompt Studio comercializa exclusivamente productos y servicios digitales suministrados por medios electrónicos.</p>
            <p>Todos los recursos disponibles en la Plataforma se entregan digitalmente y no requieren envío físico.</p>
            <p>Debido a la naturaleza de estos productos, una vez concedido el acceso al contenido, no es posible devolverlo en las mismas condiciones en que fue entregado.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.1 Tipos de productos digitales</h3>
            <p>Entre los productos digitales disponibles en Prompt Studio podrán encontrarse:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts para Inteligencia Artificial.</li>
              <li>Prompts para generación de imágenes.</li>
              <li>Prompts para generación de video.</li>
              <li>Prompts para desarrollo web.</li>
              <li>Prompts para desarrollo de aplicaciones.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Recursos Premium.</li>
              <li>Contenido descargable.</li>
              <li>Colecciones de prompts.</li>
              <li>Bibliotecas digitales.</li>
              <li>Licencias de uso.</li>
            </ul>
            <p>La oferta podrá ampliarse o modificarse en cualquier momento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.2 Naturaleza de la licencia</h3>
            <p>La compra de un producto digital no implica la transferencia de la propiedad intelectual del recurso.</p>
            <p>El usuario recibe únicamente una licencia limitada, personal, no exclusiva, no transferible y revocable, conforme a la Política de Licencias y a los Términos y Condiciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.3 Acceso inmediato</h3>
            <p>Salvo que se indique expresamente lo contrario, los productos digitales estarán disponibles inmediatamente después de que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe confirme el pago.</li>
              <li>La compra sea registrada correctamente.</li>
              <li>La cuenta del usuario sea habilitada para acceder al recurso.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.4 Descargas</h3>
            <p>Dependiendo del tipo de producto, el acceso podrá realizarse mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descarga directa.</li>
              <li>Biblioteca personal del usuario.</li>
              <li>Área de clientes.</li>
              <li>Acceso Premium.</li>
              <li>Visualización en línea.</li>
              <li>Activación automática.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.5 Compatibilidad</h3>
            <p>Cada producto podrá indicar los requisitos mínimos necesarios para su utilización.</p>
            <p>Es responsabilidad del usuario verificar previamente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compatibilidad con el modelo de IA.</li>
              <li>Software requerido.</li>
              <li>Plataforma compatible.</li>
              <li>Idioma.</li>
              <li>Requisitos técnicos.</li>
              <li>Licencias compatibles.</li>
            </ul>
            <p>Antes de realizar la compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.6 Actualizaciones</h3>
            <p>Algunos productos podrán recibir actualizaciones posteriores.</p>
            <p>Salvo que se indique expresamente en la descripción del producto, Prompt Studio no garantiza actualizaciones futuras gratuitas.</p>
            <p>Las actualizaciones podrán estar sujetas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nuevas versiones.</li>
              <li>Cambios tecnológicos.</li>
              <li>Nuevas licencias.</li>
              <li>Planes Premium.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.7 Responsabilidad del usuario</h3>
            <p>El usuario es responsable de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargar correctamente el recurso.</li>
              <li>Conservar copias de seguridad cuando corresponda.</li>
              <li>Cumplir las condiciones de la licencia adquirida.</li>
              <li>Utilizar los productos conforme a la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">9.8 Productos digitales personalizados</h3>
            <p>Cuando Prompt Studio ofrezca productos personalizados o desarrollados específicamente para un cliente, dichos productos tampoco serán reembolsables una vez iniciado su desarrollo, salvo obligación legal en contrario.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 10. Entrega del Contenido
              </h2>
            </section>
            <p>Prompt Studio considera entregado un producto digital cuando el usuario obtiene acceso efectivo al contenido adquirido mediante cualquiera de los mecanismos habilitados por la Plataforma.</p>
            <p>La entrega electrónica constituye el cumplimiento de la obligación principal de Prompt Studio respecto del suministro del producto digital.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.1 Momento de la entrega</h3>
            <p>Se entenderá que el producto ha sido entregado cuando ocurra cualquiera de los siguientes eventos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El recurso aparezca disponible en la cuenta del usuario.</li>
              <li>El enlace de descarga sea habilitado.</li>
              <li>La licencia sea activada.</li>
              <li>El contenido Premium sea desbloqueado.</li>
              <li>El usuario pueda acceder al recurso adquirido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.2 Confirmación de entrega</h3>
            <p>Prompt Studio podrá utilizar distintos mecanismos para acreditar la entrega del producto, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmación de Stripe.</li>
              <li>Registros de acceso.</li>
              <li>Activación de la licencia.</li>
              <li>Confirmación enviada por correo electrónico.</li>
              <li>Registros del servidor.</li>
              <li>Historial de descargas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.3 Acceso posterior</h3>
            <p>Una vez entregado el contenido, el usuario podrá acceder al recurso conforme a las condiciones de la licencia adquirida y mientras ésta permanezca vigente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.4 Problemas técnicos</h3>
            <p>Si el usuario no puede acceder al contenido debido a un problema técnico atribuible a Prompt Studio, deberá comunicarlo a través del canal oficial de soporte.</p>
            <p>Prompt Studio realizará esfuerzos razonables para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Restablecer el acceso.</li>
              <li>Corregir el problema.</li>
              <li>Verificar la compra.</li>
              <li>Garantizar la entrega efectiva.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.5 Pérdida de acceso por causas del usuario</h3>
            <p>Prompt Studio no será responsable cuando el usuario pierda acceso al contenido debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eliminación voluntaria de la cuenta.</li>
              <li>Pérdida de credenciales.</li>
              <li>Incumplimiento de los Términos y Condiciones.</li>
              <li>Suspensión por uso indebido.</li>
              <li>Eliminación del contenido por parte del propio usuario.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.6 Disponibilidad del recurso</h3>
            <p>Prompt Studio procurará mantener disponibles los productos adquiridos durante un período razonable.</p>
            <p>No obstante, podrá retirar determinados recursos cuando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Existan obligaciones legales.</li>
              <li>Cambien las licencias.</li>
              <li>Sea necesario sustituir versiones antiguas.</li>
              <li>Existan razones técnicas justificadas.</li>
            </ul>
            <p>Cuando resulte posible, se procurará ofrecer una alternativa equivalente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.7 Confirmación del usuario</h3>
            <p>Al acceder al recurso adquirido, el usuario reconoce que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha recibido el producto digital.</li>
              <li>La entrega se ha realizado correctamente.</li>
              <li>Ha comenzado la ejecución del servicio digital.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">10.8 Efectos sobre los reembolsos</h3>
            <p>Una vez producida la entrega conforme a esta sección, no procederán reembolsos, salvo que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exista una obligación legal imperativa.</li>
              <li>Prompt Studio determine que ocurrió un error técnico grave atribuible a la Plataforma.</li>
              <li>Sea aplicable alguna de las excepciones previstas en esta Política.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 11. Licencias y Uso del Producto
              </h2>
            </section>
            <p>Los productos digitales comercializados por Prompt Studio se distribuyen mediante licencias de uso y no mediante la transferencia de la propiedad intelectual.</p>
            <p>La compra de un recurso digital concede únicamente los derechos expresamente establecidos en la licencia correspondiente y en la Política de Licencias de Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.1 Naturaleza de la licencia</h3>
            <p>Salvo que se indique expresamente lo contrario, la compra de un producto digital concede al usuario una licencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Limitada.</li>
              <li>Personal.</li>
              <li>No exclusiva.</li>
              <li>No transferible.</li>
              <li>Revocable en los casos previstos por los Términos y Condiciones.</li>
              <li>Sujeta al cumplimiento de la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.2 Propiedad intelectual</h3>
            <p>Todos los derechos de propiedad intelectual sobre:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prompts.</li>
              <li>Plantillas.</li>
              <li>Recursos HTML.</li>
              <li>Archivos digitales.</li>
              <li>Imágenes.</li>
              <li>Videos.</li>
              <li>Recursos Premium.</li>
              <li>Material educativo.</li>
            </ul>
            <p>permanecen siendo propiedad de Prompt Studio, Magzin LLC o de sus respectivos licenciantes.</p>
            <p>La compra de un producto no transfiere dichos derechos al usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.3 Uso autorizado</h3>
            <p>El usuario podrá utilizar los recursos adquiridos únicamente conforme a la licencia correspondiente.</p>
            <p>Queda prohibido, salvo autorización expresa:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revender los prompts.</li>
              <li>Redistribuir recursos digitales.</li>
              <li>Compartir descargas con terceros.</li>
              <li>Publicar los archivos originales.</li>
              <li>Comercializar los recursos como propios.</li>
              <li>Eliminar avisos de propiedad intelectual.</li>
              <li>Crear marketplaces competidores utilizando el contenido adquirido.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.4 Licencias comerciales</h3>
            <p>Cuando un producto incluya una licencia comercial, el usuario únicamente podrá utilizar el recurso conforme a las condiciones expresamente indicadas para dicha licencia.</p>
            <p>Las licencias comerciales no implican la cesión de la propiedad intelectual del recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.5 Licencias personalizadas</h3>
            <p>Determinados productos podrán estar sujetos a condiciones particulares de licencia.</p>
            <p>En caso de conflicto entre esta Política y una licencia específica publicada para un producto, prevalecerán las condiciones particulares de dicha licencia respecto a ese recurso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.6 Incumplimiento</h3>
            <p>El uso de un producto fuera del alcance permitido por la licencia podrá dar lugar, entre otras medidas, a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Revocación de la licencia.</li>
              <li>Suspensión de la cuenta.</li>
              <li>Cancelación del acceso a recursos Premium.</li>
              <li>Reclamaciones por infracción de propiedad intelectual.</li>
              <li>Acciones legales cuando procedan.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.7 Independencia de la licencia</h3>
            <p>La licencia concedida sobre un producto digital permanecerá sujeta a las condiciones vigentes en el momento de la compra.</p>
            <p>Las modificaciones posteriores de la Política de Licencias no afectarán retroactivamente los derechos ya adquiridos, salvo cuando una obligación legal exija lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">11.8 Relación con la Política de No Reembolsos</h3>
            <p>El hecho de que el usuario reciba una licencia de uso sobre un producto digital no modifica la naturaleza definitiva de la venta.</p>
            <p>La concesión de la licencia no genera derecho a reembolso una vez entregado el contenido digital.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 12. Limitaciones de Responsabilidad en las Compras Digitales
              </h2>
            </section>
            <p>Prompt Studio realiza esfuerzos razonables para ofrecer productos digitales de alta calidad.</p>
            <p>No obstante, debido a la naturaleza de los recursos digitales y de las tecnologías de Inteligencia Artificial, existen limitaciones inherentes que el usuario acepta al realizar una compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.1 Compatibilidad</h3>
            <p>Prompt Studio no garantiza que todos los productos sean compatibles con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Todos los modelos de Inteligencia Artificial.</li>
              <li>Todas las versiones futuras de dichos modelos.</li>
              <li>Todos los navegadores.</li>
              <li>Todos los sistemas operativos.</li>
              <li>Todas las plataformas de terceros.</li>
            </ul>
            <p>Cada producto indicará, cuando resulte posible, los requisitos mínimos conocidos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.2 Resultados variables</h3>
            <p>Los prompts y recursos digitales pueden producir resultados diferentes dependiendo de factores como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El modelo de IA utilizado.</li>
              <li>La versión del modelo.</li>
              <li>Las instrucciones proporcionadas.</li>
              <li>La configuración del usuario.</li>
              <li>El idioma.</li>
              <li>La evolución de las plataformas de IA.</li>
            </ul>
            <p>Por ello, Prompt Studio no garantiza resultados idénticos para todos los usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.3 Uso profesional</h3>
            <p>El usuario es responsable de verificar que los productos adquiridos sean adecuados para su finalidad específica.</p>
            <p>Prompt Studio no presta asesoramiento profesional y no garantiza que un recurso sea apto para un uso concreto.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.4 Información publicada</h3>
            <p>Prompt Studio procura mantener actualizadas las descripciones de sus productos.</p>
            <p>No obstante, pequeñas diferencias derivadas de actualizaciones tecnológicas o mejoras continuas no constituirán un incumplimiento del contrato.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.5 Uso indebido</h3>
            <p>Prompt Studio no será responsable por los daños derivados de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso incorrecto de los prompts.</li>
              <li>Modificaciones realizadas por el usuario.</li>
              <li>Utilización contraria a las licencias.</li>
              <li>Uso ilegal del contenido.</li>
              <li>Integraciones realizadas por terceros.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.6 Servicios externos</h3>
            <p>Muchos productos disponibles en Prompt Studio están diseñados para utilizarse junto con servicios de terceros, como plataformas de Inteligencia Artificial.</p>
            <p>Prompt Studio no controla dichos servicios y no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios en sus políticas.</li>
              <li>Cambios en sus APIs.</li>
              <li>Cambios en el funcionamiento de los modelos.</li>
              <li>Eliminación de funcionalidades.</li>
              <li>Interrupciones del servicio.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.7 Limitación económica</h3>
            <p>En la máxima medida permitida por la legislación aplicable, la responsabilidad total de Prompt Studio derivada de una compra no excederá el importe efectivamente pagado por el usuario por el producto objeto de la reclamación.</p>
            <p>Esta limitación no afectará los derechos irrenunciables reconocidos por la legislación aplicable.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">12.8 Aceptación del usuario</h3>
            <p>Al completar una compra, el usuario reconoce que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha revisado cuidadosamente la descripción del producto.</li>
              <li>Comprende la naturaleza digital del recurso.</li>
              <li>Acepta las limitaciones inherentes a los productos digitales.</li>
              <li>Acepta que las compras realizadas están sujetas a la presente Política de No Reembolsos.</li>
            </ul>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 13. Pagos Procesados por Stripe
              </h2>
            </section>
            <p>Prompt Studio utiliza Stripe como proveedor autorizado para procesar de forma segura todas las compras, suscripciones y demás transacciones económicas realizadas a través de la Plataforma.</p>
            <p>Stripe actúa como un proveedor independiente de servicios de pago y procesa la información financiera conforme a sus propios términos de servicio, políticas de privacidad y estándares internacionales de seguridad.</p>
            <p>Prompt Studio no almacena números completos de tarjetas bancarias, códigos CVV/CVC ni credenciales financieras del usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.1 Procesamiento seguro</h3>
            <p>Todos los pagos realizados en Prompt Studio se procesan mediante conexiones seguras utilizando protocolos de cifrado reconocidos por la industria.</p>
            <p>Stripe implementa medidas destinadas a proteger la información financiera durante el proceso de pago.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.2 Confirmación del pago</h3>
            <p>Una compra se considerará completada únicamente cuando Stripe confirme que la transacción ha sido autorizada y procesada correctamente.</p>
            <p>Hasta ese momento:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El acceso al producto podrá permanecer pendiente.</li>
              <li>La suscripción podrá no activarse.</li>
              <li>El recurso adquirido podrá no estar disponible.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.3 Pagos rechazados</h3>
            <p>Prompt Studio no será responsable cuando una compra no pueda completarse debido a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fondos insuficientes.</li>
              <li>Tarjetas vencidas.</li>
              <li>Restricciones del banco emisor.</li>
              <li>Errores en la información de pago.</li>
              <li>Bloqueos de seguridad.</li>
              <li>Decisiones adoptadas por Stripe o por la entidad financiera.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.4 Verificaciones de seguridad</h3>
            <p>Para prevenir fraudes, Stripe podrá realizar verificaciones adicionales antes de aprobar determinadas operaciones.</p>
            <p>Estas verificaciones pueden incluir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Validación del método de pago.</li>
              <li>Verificación de identidad.</li>
              <li>Análisis del riesgo de fraude.</li>
              <li>Confirmaciones adicionales solicitadas por la entidad financiera.</li>
            </ul>
            <p>Prompt Studio no controla directamente estos procedimientos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.5 Moneda y conversión</h3>
            <p>Los precios podrán mostrarse en una o varias monedas según la configuración de la Plataforma.</p>
            <p>Cuando el método de pago utilice una moneda distinta, la conversión será realizada por la entidad financiera o por Stripe conforme a sus propias políticas.</p>
            <p>Prompt Studio no controla los tipos de cambio aplicados ni las comisiones cobradas por terceros.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.6 Comisiones bancarias</h3>
            <p>Las comisiones cobradas por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bancos.</li>
              <li>Emisores de tarjetas.</li>
              <li>Instituciones financieras.</li>
              <li>Proveedores de pago.</li>
            </ul>
            <p>No forman parte del precio del producto y no serán reembolsadas por Prompt Studio.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.7 Pagos confirmados</h3>
            <p>Una vez confirmado el pago y entregado el producto digital:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se activará el acceso correspondiente.</li>
              <li>Comenzará la ejecución del servicio digital.</li>
              <li>Será aplicable la presente Política de No Reembolsos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">13.8 Relación con esta Política</h3>
            <p>La utilización de Stripe como procesador de pagos no modifica la naturaleza definitiva de las compras realizadas en Prompt Studio.</p>
            <p>La confirmación del pago constituye uno de los elementos que acreditan la existencia válida de la operación comercial.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 14. Métodos de Pago Aceptados
              </h2>
            </section>
            <p>Prompt Studio podrá aceptar distintos métodos de pago habilitados por Stripe o por otros proveedores que, en su caso, sean incorporados a la Plataforma.</p>
            <p>Los métodos disponibles podrán variar según el país, la moneda o las políticas del proveedor de pagos.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.1 Métodos disponibles</h3>
            <p>Dependiendo del país del usuario, Prompt Studio podrá aceptar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tarjetas de crédito.</li>
              <li>Tarjetas de débito.</li>
              <li>Carteras digitales compatibles con Stripe.</li>
              <li>Métodos de pago locales disponibles a través de Stripe.</li>
              <li>Otros medios habilitados por el proveedor de pagos.</li>
            </ul>
            <p>La disponibilidad de cada método podrá variar sin previo aviso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.2 Verificación del método de pago</h3>
            <p>El usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Es titular autorizado del método de pago utilizado.</li>
              <li>Cuenta con autorización para realizar la compra.</li>
              <li>La información proporcionada es correcta y completa.</li>
            </ul>
            <p>El uso de métodos de pago obtenidos de manera ilícita está estrictamente prohibido.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.3 Errores en la información</h3>
            <p>Prompt Studio no será responsable cuando una compra no pueda completarse debido a información incorrecta proporcionada por el usuario, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Número de tarjeta incorrecto.</li>
              <li>Fecha de vencimiento errónea.</li>
              <li>Dirección de facturación incorrecta.</li>
              <li>Datos incompletos.</li>
              <li>Información desactualizada.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.4 Actualización de métodos de pago</h3>
            <p>El usuario es responsable de mantener actualizada la información relacionada con sus métodos de pago cuando utilice suscripciones o servicios recurrentes.</p>
            <p>La falta de actualización podrá ocasionar la suspensión del acceso Premium hasta que el pago pueda procesarse correctamente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.5 Impuestos</h3>
            <p>Cuando la legislación aplicable lo requiera, los precios podrán incluir o mostrar por separado los impuestos correspondientes.</p>
            <p>El importe final será informado al usuario antes de confirmar la compra.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.6 Confirmación electrónica</h3>
            <p>Tras completarse una compra, Prompt Studio podrá enviar una confirmación electrónica que incluirá, entre otros datos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identificación del pedido.</li>
              <li>Fecha de la compra.</li>
              <li>Productos adquiridos.</li>
              <li>Importe pagado.</li>
              <li>Método de pago utilizado (parcialmente oculto cuando corresponda).</li>
            </ul>
            <p>Esta confirmación constituye un comprobante de la operación realizada.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.7 Cambios en los métodos aceptados</h3>
            <p>Prompt Studio podrá incorporar o retirar métodos de pago cuando resulte necesario por razones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Técnicas.</li>
              <li>Comerciales.</li>
              <li>Operativas.</li>
              <li>Regulatorias.</li>
              <li>De seguridad.</li>
            </ul>
            <p>Estos cambios no afectarán la validez de las compras realizadas con anterioridad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">14.8 Compras internacionales</h3>
            <p>Prompt Studio presta servicios a usuarios ubicados en distintos países.</p>
            <p>Las compras internacionales podrán estar sujetas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conversión de divisas.</li>
              <li>Comisiones bancarias.</li>
              <li>Impuestos locales.</li>
              <li>Restricciones regulatorias.</li>
              <li>Políticas del emisor del medio de pago.</li>
            </ul>
            <p>El usuario es responsable de verificar las condiciones aplicables a su método de pago antes de completar la compra.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 15. Productos en Promoción
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer promociones temporales sobre determinados productos digitales, suscripciones, licencias o servicios.</p>
            <p>Las promociones tendrán carácter temporal y estarán sujetas a las condiciones específicas publicadas en cada campaña, además de los presentes Términos y de esta Política de No Reembolsos.</p>
            <p>La participación en una promoción implica la aceptación de las condiciones correspondientes.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.1 Promociones disponibles</h3>
            <p>Prompt Studio podrá ofrecer, entre otras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descuentos por tiempo limitado.</li>
              <li>Ofertas de lanzamiento.</li>
              <li>Promociones estacionales.</li>
              <li>Promociones por eventos especiales.</li>
              <li>Descuentos para nuevos usuarios.</li>
              <li>Ofertas para suscriptores.</li>
              <li>Beneficios exclusivos para afiliados.</li>
              <li>Campañas especiales de marketing.</li>
            </ul>
            <p>La disponibilidad de estas promociones podrá variar sin previo aviso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.2 Vigencia</h3>
            <p>Cada promoción tendrá una fecha de inicio y una fecha de finalización.</p>
            <p>Una vez concluido el período promocional:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los precios volverán a su valor habitual.</li>
              <li>No será posible solicitar la aplicación retroactiva del descuento.</li>
              <li>No procederán ajustes de precio sobre compras anteriores.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.3 Disponibilidad limitada</h3>
            <p>Algunas promociones podrán estar sujetas a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Existencia limitada.</li>
              <li>Cantidad máxima de compras.</li>
              <li>Disponibilidad por país.</li>
              <li>Tipo de licencia.</li>
              <li>Tipo de usuario.</li>
              <li>Plan contratado.</li>
            </ul>
            <p>Prompt Studio podrá finalizar una promoción cuando expire el período anunciado o se alcancen las condiciones establecidas.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.4 Productos promocionales</h3>
            <p>Los productos adquiridos mediante promociones mantienen la misma naturaleza jurídica que cualquier otro producto digital.</p>
            <p>En consecuencia:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La compra será definitiva.</li>
              <li>No procederán reembolsos.</li>
              <li>Se aplicarán las mismas condiciones previstas en esta Política.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.5 Modificación de promociones</h3>
            <p>Prompt Studio podrá modificar, suspender o cancelar promociones futuras cuando existan razones comerciales, técnicas, operativas o legales.</p>
            <p>Estas modificaciones no afectarán las compras ya confirmadas durante el período de vigencia de la promoción.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.6 Errores de publicación</h3>
            <p>Si un producto aparece publicado con un precio manifiestamente incorrecto debido a un error técnico, humano o del sistema, Prompt Studio podrá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancelar la operación antes de la entrega.</li>
              <li>Informar al usuario del error.</li>
              <li>Ofrecer la posibilidad de adquirir el producto al precio correcto.</li>
              <li>Reembolsar íntegramente el importe pagado si el cobro ya hubiera sido realizado y el producto aún no hubiese sido entregado.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.7 Acumulación de promociones</h3>
            <p>Salvo que Prompt Studio indique expresamente lo contrario, las promociones:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No serán acumulables entre sí.</li>
              <li>No podrán combinarse con otros descuentos.</li>
              <li>No podrán aplicarse retroactivamente.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">15.8 Igualdad de condiciones</h3>
            <p>Todos los usuarios que cumplan los requisitos publicados para una promoción podrán acceder a ella en igualdad de condiciones, salvo que las bases de la promoción establezcan limitaciones específicas.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 16. Compras Realizadas mediante Cupones o Descuentos
              </h2>
            </section>
            <p>Prompt Studio podrá ofrecer cupones promocionales, códigos de descuento y beneficios comerciales destinados a incentivar determinadas compras o campañas.</p>
            <p>Estos beneficios reducen el precio de adquisición, pero no modifican la naturaleza definitiva de la venta.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.1 Cupones promocionales</h3>
            <p>Los cupones podrán conceder:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descuentos porcentuales.</li>
              <li>Descuentos de importe fijo.</li>
              <li>Acceso a promociones especiales.</li>
              <li>Beneficios para determinados productos.</li>
              <li>Ventajas para campañas específicas.</li>
            </ul>
            <p>Cada cupón estará sujeto a sus propias condiciones de uso.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.2 Requisitos de utilización</h3>
            <p>Un cupón podrá estar limitado por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fecha de expiración.</li>
              <li>Número máximo de usos.</li>
              <li>Tipo de producto.</li>
              <li>País del usuario.</li>
              <li>Plan contratado.</li>
              <li>Valor mínimo de compra.</li>
              <li>Condiciones particulares de la campaña.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.3 No reembolso del valor promocional</h3>
            <p>Cuando una compra se realice utilizando un cupón o descuento:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No procederá el reembolso del importe descontado.</li>
              <li>No podrá solicitarse el pago del valor promocional.</li>
              <li>No será posible convertir el descuento en dinero.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.4 Cupones expirados</h3>
            <p>Los cupones que hayan expirado:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No podrán reactivarse.</li>
              <li>No podrán aplicarse retroactivamente.</li>
              <li>No generarán compensaciones económicas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.5 Uso indebido</h3>
            <p>Prompt Studio podrá cancelar un cupón o beneficio promocional cuando detecte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso fraudulento.</li>
              <li>Manipulación del sistema.</li>
              <li>Generación automatizada de cupones.</li>
              <li>Incumplimiento de las condiciones de la promoción.</li>
              <li>Cualquier otro uso contrario a la buena fe.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.6 Compras realizadas con afiliados</h3>
            <p>Cuando una compra se realice utilizando un enlace de afiliado o un código promocional asociado al Programa de Afiliados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La compra seguirá siendo definitiva.</li>
              <li>Se aplicará la presente Política de No Reembolsos.</li>
              <li>Las comisiones de afiliados podrán ajustarse conforme al Programa de Afiliados en caso de cancelaciones legalmente obligatorias.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.7 Descuentos personalizados</h3>
            <p>Prompt Studio podrá conceder descuentos personalizados a determinados usuarios por razones comerciales.</p>
            <p>Estos descuentos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No crean precedentes.</li>
              <li>No generan derechos adquiridos.</li>
              <li>No obligan a ofrecer condiciones similares en futuras compras.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">16.8 Transparencia</h3>
            <p>Prompt Studio procurará mostrar claramente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El precio original.</li>
              <li>El descuento aplicado.</li>
              <li>El importe final.</li>
              <li>Las condiciones relevantes de la promoción.</li>
            </ul>
            <p>Antes de que el usuario confirme definitivamente la compra.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 17. Actualizaciones de esta Política
              </h2>
            </section>
            <p>Prompt Studio podrá actualizar la presente Política de No Reembolsos cuando resulte necesario para reflejar cambios en la legislación aplicable, en los servicios ofrecidos, en las condiciones comerciales o en los procesos de compra de la Plataforma.</p>
            <p>Las actualizaciones tendrán como finalidad mantener este documento alineado con las mejores prácticas de comercio electrónico y protección del consumidor.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.1 Derecho de modificación</h3>
            <p>Prompt Studio se reserva el derecho de modificar esta Política cuando sea necesario por motivos como:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cambios legislativos.</li>
              <li>Cambios regulatorios.</li>
              <li>Incorporación de nuevos servicios.</li>
              <li>Nuevas modalidades de suscripción.</li>
              <li>Cambios en los medios de pago.</li>
              <li>Mejoras en los procesos de compra.</li>
              <li>Cambios operativos o tecnológicos.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.2 Publicación</h3>
            <p>La versión vigente de esta Política estará disponible permanentemente en:</p>
            <p>https://www.prompstudio.com</p>
            <p>La fecha de la última actualización aparecerá al inicio o al final del documento.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.3 Comunicación de cambios</h3>
            <p>Cuando una modificación afecte de manera significativa los derechos o las obligaciones de los usuarios, Prompt Studio podrá comunicarla mediante:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avisos dentro de la Plataforma.</li>
              <li>Correo electrónico.</li>
              <li>Notificaciones en la cuenta del usuario.</li>
              <li>Publicación en el sitio web.</li>
              <li>Otros medios electrónicos apropiados.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.4 Entrada en vigor</h3>
            <p>Salvo que se indique expresamente otra fecha, las modificaciones entrarán en vigor desde el momento de su publicación.</p>
            <p>Las compras realizadas con anterioridad continuarán rigiéndose por la versión de la Política vigente al momento de la transacción, salvo que una disposición legal obligatoria establezca lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.5 Revisión periódica</h3>
            <p>Prompt Studio recomienda revisar periódicamente esta Política para mantenerse informado sobre las condiciones aplicables a futuras compras y suscripciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.6 Conservación de versiones</h3>
            <p>Prompt Studio podrá conservar versiones anteriores de esta Política para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento normativo.</li>
              <li>Auditorías.</li>
              <li>Resolución de controversias.</li>
              <li>Evidencia documental.</li>
              <li>Obligaciones legales.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.7 Compatibilidad con otros documentos</h3>
            <p>Las modificaciones de esta Política podrán ir acompañadas de actualizaciones en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Términos y Condiciones.</li>
              <li>Política de Privacidad.</li>
              <li>Política de Licencias.</li>
              <li>Política de Cookies.</li>
              <li>Acuerdo de Suscripción Premium.</li>
            </ul>
            <p>Cuando exista conflicto, los documentos deberán interpretarse de manera complementaria.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">17.8 Continuidad del uso</h3>
            <p>El uso continuado de Prompt Studio después de la entrada en vigor de una actualización implica que el usuario reconoce haber tenido la oportunidad de revisar la versión vigente de esta Política.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 18. Contacto y Atención al Cliente
              </h2>
            </section>
            <p>Prompt Studio pone a disposición de los usuarios canales oficiales para resolver dudas relacionadas con compras, suscripciones, pagos e incidencias técnicas.</p>
            <p>Nuestro objetivo es ofrecer una atención clara, profesional y eficiente.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.1 Canal oficial</h3>
            <p>Las consultas relacionadas con compras deberán dirigirse exclusivamente a:</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.2 Información recomendada</h3>
            <p>Para agilizar la atención, el usuario deberá proporcionar, cuando sea posible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre de la cuenta.</li>
              <li>Correo electrónico utilizado en la compra.</li>
              <li>Número de pedido.</li>
              <li>Fecha aproximada de la compra.</li>
              <li>Identificador de la transacción de Stripe.</li>
              <li>Descripción detallada de la incidencia.</li>
              <li>Capturas de pantalla u otra evidencia relevante.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.3 Horario de atención</h3>
            <p>Prompt Studio atenderá las solicitudes dentro de un plazo razonable, considerando:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La complejidad del caso.</li>
              <li>El volumen de solicitudes.</li>
              <li>La participación de proveedores externos.</li>
              <li>Días hábiles y festivos aplicables.</li>
            </ul>
            <p>No se garantiza un tiempo de respuesta específico.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.4 Idioma de atención</h3>
            <p>El soporte podrá prestarse en uno o varios idiomas según la disponibilidad del equipo.</p>
            <p>Cuando sea posible, Prompt Studio procurará responder en el idioma utilizado por el usuario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.5 Resolución amistosa</h3>
            <p>Prompt Studio procurará resolver cualquier incidencia mediante diálogo directo y de buena fe antes de que el usuario recurra a procedimientos judiciales, administrativos o financieros.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.6 Solicitudes incompletas</h3>
            <p>Cuando una solicitud no contenga información suficiente para verificar la compra o la incidencia, Prompt Studio podrá solicitar información adicional antes de continuar con el análisis.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.7 Protección de datos</h3>
            <p>Toda la información proporcionada durante el proceso de atención será tratada conforme a la Política de Privacidad de Prompt Studio y utilizada únicamente para gestionar la solicitud correspondiente o cumplir obligaciones legales.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">18.8 Compromiso de atención</h3>
            <p>Prompt Studio mantiene el compromiso de atender todas las consultas relacionadas con compras de manera:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transparente.</li>
              <li>Objetiva.</li>
              <li>Profesional.</li>
              <li>Respetuosa.</li>
              <li>Conforme a la legislación aplicable.</li>
            </ul>
            <p>Cada caso será analizado individualmente cuando resulte necesario.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 19. Disposiciones Finales
              </h2>
            </section>
            <p>La presente Política de No Reembolsos forma parte integrante del marco legal de Prompt Studio y deberá interpretarse conjuntamente con los demás documentos legales publicados en la Plataforma.</p>
            <p>Su objetivo es proporcionar transparencia respecto a las condiciones aplicables a la adquisición de productos digitales, licencias y suscripciones.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.1 Documentos relacionados</h3>
            <p>Esta Política complementa los siguientes documentos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Términos y Condiciones.</li>
              <li>Política de Privacidad.</li>
              <li>Política de Cookies.</li>
              <li>Política de Licencias.</li>
              <li>Acuerdo de Suscripción Premium.</li>
              <li>Política DMCA y Copyright.</li>
              <li>Acuerdo del Programa de Afiliados.</li>
            </ul>
            <p>Todos estos documentos constituyen conjuntamente el acuerdo legal entre Prompt Studio y sus usuarios.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.2 Independencia de las cláusulas</h3>
            <p>Si una autoridad competente declara inválida, ilegal o inaplicable alguna disposición de esta Política:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dicha disposición se interpretará conforme a la legislación aplicable.</li>
              <li>Las restantes disposiciones permanecerán plenamente vigentes.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.3 No renuncia</h3>
            <p>El hecho de que Prompt Studio no ejerza inmediatamente alguno de los derechos previstos en esta Política no constituirá una renuncia a dichos derechos.</p>
            <p>Toda renuncia deberá realizarse expresamente y por escrito.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.4 Idioma</h3>
            <p>Prompt Studio podrá ofrecer traducciones de esta Política para facilitar su comprensión.</p>
            <p>En caso de discrepancia entre diferentes versiones lingüísticas, prevalecerá la versión oficial publicada en español, salvo que una legislación imperativa establezca lo contrario.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.5 Relación con la legislación aplicable</h3>
            <p>Nada de lo dispuesto en esta Política limitará los derechos irrenunciables reconocidos a los consumidores por la legislación aplicable.</p>
            <p>Cuando una disposición legal obligatoria entre en conflicto con esta Política, prevalecerá dicha disposición únicamente en el alcance exigido por la ley.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.6 Conservación de registros</h3>
            <p>Prompt Studio podrá conservar información relacionada con las compras para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cumplimiento de obligaciones legales.</li>
              <li>Auditorías.</li>
              <li>Prevención del fraude.</li>
              <li>Resolución de controversias.</li>
              <li>Defensa de derechos legales.</li>
            </ul>
            <p>El tratamiento de esta información se realizará conforme a la Política de Privacidad.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.7 Fecha de entrada en vigor</h3>
            <p>Fecha de entrada en vigor:</p>
            <p>1 de enero de 2026 (o la fecha que determine Prompt Studio).</p>
            <p>Última actualización:</p>
            <p>2026</p>
            <p>Prompt Studio podrá actualizar esta Política conforme a la Sección 17.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">19.8 Alcance internacional</h3>
            <p>Prompt Studio presta servicios a usuarios ubicados en distintos países.</p>
            <p>Las disposiciones de esta Política serán aplicables internacionalmente, respetando en todo momento los derechos obligatorios que la legislación local reconozca a los consumidores.</p>
            <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                Sección 20. Declaración Oficial
              </h2>
            </section>
            <p>Prompt Studio comercializa recursos digitales cuya entrega se realiza electrónicamente de forma inmediata una vez confirmado el pago.</p>
            <p>Debido a la naturaleza de estos productos, las compras son, por regla general, definitivas y no admiten reembolsos, salvo cuando exista una obligación legal imperativa o cuando Prompt Studio determine que procede una solución excepcional conforme a esta Política.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.1 Transparencia comercial</h3>
            <p>Prompt Studio se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Describir claramente cada producto.</li>
              <li>Informar previamente el precio.</li>
              <li>Mostrar las licencias aplicables.</li>
              <li>Informar las condiciones de compra.</li>
              <li>Facilitar soporte ante incidencias legítimas.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.2 Protección del consumidor</h3>
            <p>Aunque Prompt Studio mantiene una política general de no reembolsos, respetará los derechos que la legislación aplicable reconozca de forma obligatoria a los consumidores.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.3 Buena fe</h3>
            <p>Prompt Studio y sus usuarios se comprometen a actuar de buena fe durante cualquier proceso relacionado con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compras.</li>
              <li>Suscripciones.</li>
              <li>Pagos.</li>
              <li>Incidencias.</li>
              <li>Disputas.</li>
              <li>Comunicaciones.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.4 Compromiso con la calidad</h3>
            <p>Prompt Studio trabaja continuamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mejorar la calidad de los recursos digitales.</li>
              <li>Actualizar el contenido disponible.</li>
              <li>Optimizar la experiencia del usuario.</li>
              <li>Mantener una plataforma segura y confiable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.5 Contacto oficial</h3>
            <p>Para cualquier consulta relacionada con esta Política:</p>
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
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.6 Interpretación</h3>
            <p>Esta Política deberá interpretarse de forma coherente con el resto de la documentación legal publicada por Prompt Studio.</p>
            <p>En caso de duda, prevalecerá la interpretación que mejor garantice:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La transparencia.</li>
              <li>La protección de los usuarios.</li>
              <li>El cumplimiento de la legislación aplicable.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.7 Resolución de incidencias</h3>
            <p>Prompt Studio invita a todos los usuarios a contactar primero con el equipo de soporte antes de iniciar cualquier reclamación bancaria, administrativa o judicial.</p>
            <p>La mayoría de las incidencias pueden resolverse mediante comunicación directa y colaboración mutua.</p>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">20.8 Declaración de cierre</h3>
            <p>Al realizar una compra, contratar una suscripción o adquirir cualquier recurso digital en Prompt Studio, el usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha leído íntegramente esta Política de No Reembolsos.</li>
              <li>Comprende que los productos comercializados son bienes digitales.</li>
              <li>Acepta que, una vez entregado el contenido digital, las compras son finales, salvo obligación legal en contrario.</li>
              <li>Se compromete a utilizar los recursos adquiridos conforme a la licencia correspondiente y a los Términos y Condiciones de la Plataforma.</li>
            </ul>
            <p>Declaración Oficial</p>
            <p>Política de No Reembolsos de Prompt Studio</p>
            <p>Operado por:</p>
            <p>Magzin LLC</p>
            <p>800 Third Avenue Associates</p>
            <p>New York, NY 10022</p>
            <p>United States</p>
            <p>Sitio web:</p>
            <p>https://www.prompstudio.com</p>
            <p>Correo electrónico:</p>
            <p>help@prompstudio.com</p>
            <p>© 2026 Prompt Studio. Todos los derechos reservados.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
