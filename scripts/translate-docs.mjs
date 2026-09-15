import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
  console.error('Error: Debes proporcionar OPENAI_API_KEY o GEMINI_API_KEY como variable de entorno.');
  process.exit(1);
}

// Función para obtener todos los archivos .md
function getMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const SYSTEM_PROMPT = `You are an expert technical translator. Translate the following Markdown document from Spanish to English.
CRITICAL INSTRUCTIONS:
1. Preserve ALL Markdown formatting perfectly (headers, lists, bold, italics, tables, links).
2. Do not translate code blocks, terminal commands, or variable names.
3. Output ONLY the translated Markdown content.
4. Do NOT wrap your entire response in \`\`\`markdown ... \`\`\` unless the original file was entirely inside a code block. Return the raw translated text directly.`;

async function translateWithOpenAI(text) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  let result = data.choices[0].message.content;
  if (result.startsWith('```markdown\n') && result.endsWith('\n```')) {
    result = result.substring(12, result.length - 4);
  }
  return result;
}

async function translateWithGemini(text) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: text }] }],
      generationConfig: {
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  let result = data.candidates[0].content.parts[0].text;
  if (result.startsWith('```markdown\n') && result.endsWith('\n```')) {
    result = result.substring(12, result.length - 4);
  } else if (result.startsWith('```\n') && result.endsWith('\n```')) {
    result = result.substring(4, result.length - 4);
  }
  return result;
}

const translate = OPENAI_API_KEY ? translateWithOpenAI : translateWithGemini;

async function main() {
  const filesToTranslate = getMarkdownFiles(DOCS_DIR);
  // Añadir README.md principal si existe
  const mainReadme = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(mainReadme)) {
    filesToTranslate.push(mainReadme);
  }

  console.log(`Encontrados ${filesToTranslate.length} archivos para traducir usando ${OPENAI_API_KEY ? 'OpenAI' : 'Gemini'}.`);
  
  for (let i = 0; i < filesToTranslate.length; i++) {
    const filePath = filesToTranslate[i];
    const fileName = path.basename(filePath);
    
    // Evitar traducir archivos que ya son de inglés o español específico si existen versiones
    if (fileName.includes('_EN') || fileName.includes('_ES')) {
      console.log(`[${i + 1}/${filesToTranslate.length}] Omitiendo ${filePath} (tiene sufijo de idioma)`);
      continue;
    }

    console.log(`[${i + 1}/${filesToTranslate.length}] Traduciendo ${filePath}...`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Si el archivo está vacío o es muy corto, saltar
      if (content.trim().length < 10) {
        console.log(`  -> Archivo vacío o muy corto, saltando.`);
        continue;
      }

      const translatedContent = await translate(content);
      
      // Sobrescribir el archivo in-place
      fs.writeFileSync(filePath, translatedContent, 'utf-8');
      console.log(`  -> ¡Traducido con éxito!`);
      
      // Esperar 1 segundo para evitar límites de tasa (rate limiting)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  -> Error traduciendo ${filePath}:`, error.message);
    }
  }
  
  console.log('¡Proceso de traducción completado!');
}

main().catch(console.error);
