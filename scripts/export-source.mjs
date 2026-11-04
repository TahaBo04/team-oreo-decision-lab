import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
mkdirSync(path.join(root, 'public/downloads'), { recursive: true });
execFileSync('python3', ['-c', `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path('.')
files=[p for name in ['app','src','lib','tests','docs','scripts','public','.github'] for p in (root/name).rglob('*') if p.is_file() and p.suffix!='.zip']
files += [root/p for p in ['index.html','package.json','pnpm-lock.yaml','vite.config.mjs','postcss.config.mjs','README.md','.gitignore']]
with ZipFile('public/downloads/bimo-model-source.zip','w',ZIP_DEFLATED) as z:
 for p in sorted(set(files)): z.write(p, 'team-oreo-decision-lab/'+p.as_posix())
`], { cwd: root, stdio: 'inherit' });
