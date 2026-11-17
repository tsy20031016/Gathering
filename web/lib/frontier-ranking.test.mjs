import test from 'node:test';import assert from 'node:assert/strict';import {rankFrontiers} from './frontier-ranking.mjs';
const review={novelty:{rating:4,reason:'机制变化'},applicability:{rating:4,reason:'有应用场景'},evidence:{rating:4,reason:'有官方文档'}};
const item=(id,organization='A')=>({id,canonicalId:id,organization,publishedAt:'2026-10-29T00:00:00Z',review,sources:[{primary:true,url:'https://example.com/docs'}]});
const opts={asOf:'2026-10-30T00:00:00Z'};
test('GitHub stars do not affect cross-source assessment',()=>{const a=rankFrontiers([{...item('x'),stars:1}],opts);const b=rankFrontiers([{...item('x'),stars:1000000}],opts);assert.equal(a.ranked[0].score,b.ranked[0].score);});
test('missing review or publication never produces an invented rank',()=>{const r=rankFrontiers([{...item('a'),review:null},{...item('b'),publishedAt:null}],opts);assert.equal(r.ranked.length,0);});
test('old reference material is not this weeks news',()=>{const r=rankFrontiers([{...item('old'),publishedAt:'2025-05-14'}],opts);assert.equal(r.ranked.length,0);});
test('same technology is deduplicated across websites',()=>{const r=rankFrontiers([item('a'),{...item('a'),id:'github-a'}],opts);assert.equal(r.qualified,1);});
test('weekly shortlist allows at most two entries from a company',()=>{const r=rankFrontiers([item('a'),item('b'),item('c'),item('d','B')],opts);assert.equal(r.ready,true);assert.equal(r.ranked.filter(x=>x.organization==='A').length,2);});
