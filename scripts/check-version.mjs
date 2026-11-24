import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const stableSemVer=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function validateProductVersion({versionFile,manifestVersion,lockVersion,lockRootVersion}) {
  const version=versionFile.trim();
  assert.match(version,stableSemVer,'VERSION requires stable MAJOR.MINOR.PATCH');
  assert.equal(manifestVersion,version,'package.json version mismatch');
  assert.equal(lockVersion,version,'package-lock.json version mismatch');
  assert.equal(lockRootVersion,version,'root lockfile package version mismatch');
  assert.equal(version,'0.1.0','Pre-MVP version frozen until owner approval');
  return version;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  const [versionFile,packageText,lockText]=await Promise.all([
    readFile('VERSION','utf8'),readFile('package.json','utf8'),readFile('package-lock.json','utf8')
  ]);
  const pkg=JSON.parse(packageText),lock=JSON.parse(lockText);
  console.log('Version check passed: '+validateProductVersion({
    versionFile,manifestVersion:pkg.version,lockVersion:lock.version,
    lockRootVersion:lock.packages?.['']?.version
  }));
}
