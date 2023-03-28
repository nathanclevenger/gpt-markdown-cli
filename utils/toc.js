import fs from 'fs'
import slugify from 'slugify'
import { itemParser } from './parsers.js'

export const createToc = ({topic, content, output}) => {
  const ts = new Date().toISOString().slice(0, 10)

  try {
    fs.mkdirSync(output)
  } catch (error) {
    
  }

  const items = itemParser(content)

  const toc = `# ${topic}
  
${items.map(item => ` - [${item}](/${slugify(item, { strict: true })})`).join('\n')}


`

  fs.appendFileSync(`${output}/index.md`, toc)
  
  return items
}