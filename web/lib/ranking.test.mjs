import test from 'node:test';
import assert from 'node:assert/strict';
import {rankProjects,percentile} from './ranking.mjs';
const sample=(repos,at='2026-10-30T01:00:00Z')=>({at,repos});
const base=repos=>sample(repos,'2026-10-23T01:00:00Z');
test('ties receive neutral equal percentiles, including a singleton',()=>{
 assert.equal(percentile([0,0,0],0),50);assert.equal(percentile([4],4),50);
});
test('a growing emerging project can outrank a large slow one',()=>{
 const previous=base({large:{stars:100000,forks:10000},emerging:{stars:300,forks:30},quiet:{stars:200,forks:20}});
 const now=sample({large:{stars:100150,forks:10020},emerging:{stars:450,forks:50},quiet:{stars:220,forks:25}});
 const result=rankProjects(now,previous);
 assert.equal(result.ranked[0].repo,'emerging');assert.equal(result.ready,true);
});
test('a tiny doubling does not qualify; unobserved data never becomes zero growth',()=>{
 const result=rankProjects(sample({tiny:{stars:4,forks:0},new:{stars:1000,forks:100}}),base({tiny:{stars:2,forks:0}}));
 assert.equal(result.ranked.length,0);assert.equal(result.excludedMissing,1);assert.equal(result.ready,false);
});
test('negative counts and invalid observations are excluded',()=>{
 const result=rankProjects(sample({bad:{stars:-1,forks:3},missing:{stars:30}}),base({bad:{stars:2,forks:2},missing:{stars:10,forks:1}}));
 assert.equal(result.comparableCount,0);assert.equal(result.excludedMissing,2);
});
test('net losses remain visible while scoring never rewards them',()=>{
 const result=rankProjects(sample({down:{stars:90,forks:9}}),base({down:{stars:100,forks:10}}));
 assert.equal(result.ranked.length,0);assert.equal(result.ready,false);
});
test('windows outside 7–8 days cannot produce a weekly rank',()=>{
 assert.throws(()=>rankProjects(sample({}),sample({},'2026-10-25T01:00:00Z')),/7–8/);
});
test('unequal windows normalize activity to seven days',()=>{
 const p={x:{stars:100,forks:10}};
 const r=rankProjects(sample({x:{stars:180,forks:18}},'2026-10-31T01:00:00Z'),base(p));
 assert.equal(r.ranked[0].stars7d,70);assert.equal(r.windowDays,8);
});
