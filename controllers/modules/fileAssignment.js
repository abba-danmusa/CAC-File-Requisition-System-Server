const sectionConfig = [
  { min: 1, max: 171600, section: 'Wing A' },
  { min: 171601, max: 305500, section: 'Wing B Team 1' },
  { min: 305501, max: 470800, section: 'Wing B Team 2' },
  { min: 470801, max: 672700, section: 'Wing B Team 3' },
  { min: 672701, max: 849699, section: 'Wing B Team 4' },
  { min: 849700, max: 1056399, section: 'Wing B Team 5' },
  { min: 1056400, max: 1279070, section: 'Wing B Team 6' },
  { min: 1279071, max: 1561239, section: 'Wing B Team 7' },
  { min: 1561239, max: 1748499, section: 'Wing B Team 8' },
]

async function assignFileToSection(rcNumber) {
  // Remove the prefix 'bn' and extract the number part
  const numberString = rcNumber.replace(/^\D+/g, '')
  // Convert the extracted number string to an integer
  const integerValue = parseInt(numberString, 10)
  const matchingSection = sectionConfig.find(section => integerValue >= section.min && integerValue <= section.max);
  return matchingSection ? matchingSection.section : 'Section not defined';
}

module.exports = {assignFileToSection}