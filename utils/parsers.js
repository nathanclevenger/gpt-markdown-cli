export const itemParser = content =>  {
  // Default if this is a YAML array
  let items = content.replaceAll(`\``,'').replaceAll(`\n`,'').replaceAll('"','').split('\n- ').slice(1)

  // Handle if numbered list (occassionally happens, even against instructions)
  if (items.length === 0) {
    items = content.replaceAll(`\``,'').replaceAll(`\n`,'').replaceAll('"','').split('. ').slice(1).map(i => i.split('\n')[0])
  }

  return items
}