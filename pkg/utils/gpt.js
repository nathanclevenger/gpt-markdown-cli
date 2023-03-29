import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)

export const createList = async ({ userPrompt, number = 50, titles = 'titles', contentType = 'ideas', topic = 'Using AI', output }) => {

  const topicSpinner = createSpinner(`Asking GPT to generate topics on "${topic}" ...`).start()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    // model: 'gpt-4',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format arrays.'},
          {'role': 'user', 'content': userPrompt ?? `Respond with a list of ${number} ${titles} of ${contentType} for the topic "${topic}". Do not count the items in the list.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content

  const items = createToc({topic, content, output})

  return items
}