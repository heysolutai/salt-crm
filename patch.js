const fs = require('fs');
const file = 'c:\\Users\\yagom\\Desktop\\CrmEryk\\vps-inline-utf8.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /const filteredConversations = mappedConversations\.filter.*?return matchesSearch && matchesStatus && matchesTag && matchesTab;\s*\n  \}\);/s,
  const filteredConversations = mappedConversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      conv.phone.includes(searchQuery);
    return matchesSearch;
  });
);

fs.writeFileSync('c:\\Users\\yagom\\Desktop\\CrmEryk\\vps-inline-fixed.tsx', data);
