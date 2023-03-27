import { Configuration, OpenAIApi } from 'openai'
import { itemParser } from './utils/parsers'
import figlet from 'figlet'
import gradient from 'gradient-string'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)


export const generateContent = async ({contentType, count, topic, output}) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.'},
          {'role': 'user', 'content': `Respond with a list of ${count} possible titles of ${contentType} for the topic "${topic}". Do not count the items in the list.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content
  const topicFolder = slugify(topic)

  const ts = new Date().toISOString().slice(0, 10)

  try {
    fs.mkdirSync(output)
  } catch (error) {
    
  }

  const items = itemParser(content)

  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format.'},
            {'role': 'user', 'content': `Respond with a 2000 word blog post on the topic "${item}" which will be posted on a blog about ${topic}.`},
        ]
      }).then(itemResponse => {
        const content = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`${output}/${slugify(item)}.md`, content)
  })}))

  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})

  console.log(gradient.pastel.multiline(figlet.textSync('Success!')))

}