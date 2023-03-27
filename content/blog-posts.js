import { openai } from '../gpt'
import { itemParser } from '../utils/parsers'

export const generateBlogPosts = async ({ topic }) => {


  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
          {'role': 'system', 'content': 'You are a helpful assistant that only responds in YAML format.'},
          {'role': 'user', 'content': `Respond with a list of ${count} possible Blog Post titles for the topic "${topic}". Do not count the list items.`},
      ]
    })

  topicSpinner.success({ text: 'GPT has generated topics!'})

  const content = response.data.choices[0].message.content
  const topicFolder = slugify(topic)

  const ts = new Date().toISOString().slice(0, 10)
  // fs.mkdirSync(`${topicFolder}`)
  try {
    fs.mkdirSync(`_posts`)
  } catch (error) {
    
  }


  await Promise.all(items.map(async (item) => {
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
            {'role': 'system', 'content': 'You are a helpful assistant that only responds in Markdown format.'},
            {'role': 'user', 'content': `Respond with a 2000 word blog post on the topic "${item}" which will be posted on a blog about ${topic}.`},
        ]
      }).then(itemResponse => {
        const content = itemResponse.data.choices[0].message.content
        fs.writeFileSync(`_posts/${slugify(item)}.md`, content)
  })}))
  contentSpinner.success({ text: 'GPT has completed generating all of the content for each topic!'})
}