import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/services/sounds.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup(){const handlers={}, notes=[],levels=[],store=new Map();let tick=1000;const exports={};
 class Audio {state='running';currentTime=0;destination={};resume(){this.state='running';return Promise.resolve()}suspend(){this.state='suspended';return Promise.resolve()}createOscillator(){return {frequency:{setValueAtTime:f=>notes.push(f)},connect(){},disconnect(){},start(){},stop(){}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime:v=>levels.push(v),exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}}
 const window={AudioContext:Audio,addEventListener:(n,f)=>handlers[n]=f,dispatchEvent(){}};
 vm.runInNewContext(js,{exports,window,navigator:{},performance:{now:()=>tick+=100},Event:class{},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)}});
 return {api:exports,handlers,notes,levels,store};}
test('No autoplay; trusted gestures work without navigator.userActivation',()=>{const s=setup();s.api.playSound('menuOpen');assert.equal(s.notes.length,0);s.handlers.pointerdown({isTrusted:true});s.api.playSound('menuOpen');assert.deepEqual(s.notes,[330,440]);assert.ok(s.levels[0]>.1);});
test('Mute prevents notes and stores preference; volume rejects invalid values',()=>{const s=setup();s.handlers.pointerdown({isTrusted:true});s.api.setSoundsEnabled(false);s.api.playSound('menuOpen');assert.equal(s.notes.length,0);assert.equal(s.store.get('ssdc-sound'),'off');s.api.setSoundVolume(NaN);assert.equal(s.api.soundVolume(),.55);s.api.setSoundVolume(2);assert.equal(s.api.soundVolume(),1);s.api.setSoundVolume(-1);assert.equal(s.api.soundVolume(),0);});
test('All catalog events have distinct audible sequences',()=>{const {api}=setup();const sequences=Object.values(api.soundCatalog).map(notes=>JSON.stringify(notes));assert.equal(new Set(sequences).size,sequences.length);});
