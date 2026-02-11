const { execFileSync } = require('child_process');

function ghJson(args){
  const gh = 'C:/Program Files/GitHub CLI/gh.exe';
  const out = execFileSync(gh, args, { encoding:'utf8' });
  return JSON.parse(out);
}

function categorize(name){
  const n=name.toLowerCase();
  if(n.includes('defcon') || n.includes('biohackvillage') || n.includes('biohackingvillage')) return 'DefCon';
  if(n.includes('bsides') || n.includes('bsideskc') || n.includes('bsideschs') || n.includes('bsidesstl')) return 'BSides';
  if(n.includes('cactuscon')) return 'CactusCon';
  if(n.startsWith('sao') || n.includes('sao_') || n.includes('sao-')) return 'SAO';
  if(n.startsWith('lts') || n.includes('learn to solder') || n.includes('solder')) return 'Learn to Solder';
  if(n.includes('docs') || n.includes('documentation')) return 'Docs';
  if(n.includes('github.io')) return 'Web/Blog';
  if(n.includes('flasher') || n.includes('firmware') || n.includes('ota')) return 'Firmware/Tools';
  if(n.includes('infra')) return 'Infra';
  if(n.includes('product') || n.includes('badge') || n.includes('project')) return 'Projects';
  return 'Misc';
}

function mdLink(r){
  return `* [${r.name}](${r.url})`;
}

const repos = ghJson(['repo','list','BadgePiratesLLC','--limit','300','--json','name,isArchived,isPrivate,url']);
const publicRepos = repos.filter(r => !r.isPrivate);

// group
const groups = new Map();
for(const r of publicRepos){
  const cat = categorize(r.name);
  if(!groups.has(cat)) groups.set(cat, []);
  groups.get(cat).push(r);
}

// sort within groups
for(const [k, arr] of groups){
  arr.sort((a,b)=>a.name.localeCompare(b.name));
}

const order = ['Web/Blog','Docs','Projects','CactusCon','DefCon','BSides','Learn to Solder','SAO','Firmware/Tools','Infra','Misc'];

let md = '';
md += '# Project Index\n';
md += 'Public repository directory for **BadgePiratesLLC**.\n\n';
md += '> Note: Private/internal repos are intentionally not listed here.\n\n';
md += 'Legend: ';
md += `![Archived](https://github.com/BadgePiratesLLC/Project_Index/blob/main/icons8-lock-24.png "Archived") = archived\n\n`;

for(const cat of order){
  const arr = groups.get(cat);
  if(!arr || !arr.length) continue;
  md += `## ${cat}\n`;
  for(const r of arr){
    const archived = r.isArchived ? ` ![Archived](https://github.com/BadgePiratesLLC/Project_Index/blob/main/icons8-lock-24.png "Archived")` : '';
    md += `${mdLink(r)}${archived}\n`;
  }
  md += '\n';
}

md += '---\n';
md += '## Update process\n';
md += 'This file is generated from the GitHub API via `gh repo list` and simple name-based categorization.\n\n';
md += 'To regenerate:\n';
md += '1. Ensure `gh auth status` is logged in\n';
md += '2. Run: `node generate_readme.js`\n';
md += '3. Commit the updated `README.md`\n';

require('fs').writeFileSync('README.md', md);
console.log(`Wrote README.md with ${publicRepos.length} public repos.`);
