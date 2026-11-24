import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProductVersion} from '../scripts/check-version.mjs';
const valid=()=>({versionFile:'0.1.0\n',manifestVersion:'0.1.0',lockVersion:'0.1.0',lockRootVersion:'0.1.0'});
test('matching pre-MVP version passes',()=>assert.equal(validateProductVersion(valid()),'0.1.0'));
for(const field of ['manifestVersion','lockVersion','lockRootVersion']) {
  test('rejects '+field+' mismatch',()=>assert.throws(()=>validateProductVersion({...valid(),[field]:'0.1.1'})));
}
test('rejects otherwise matching unapproved version bump',()=>{
  assert.throws(()=>validateProductVersion({versionFile:'0.1.1',manifestVersion:'0.1.1',lockVersion:'0.1.1',lockRootVersion:'0.1.1'}),/frozen/);
});
test('rejects invalid and prerelease version strings',()=>{
  for(const v of ['0.1.0-preview.1','v0.1.0','1.0','01.2.3','0.1.0+local'])
    assert.throws(()=>validateProductVersion({...valid(),versionFile:v}));
});
