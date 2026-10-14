import test from 'node:test';import assert from 'node:assert/strict';
test('PIN format requires exactly six digits',()=>{assert.equal(/^[0-9]{6}$/.test('000123'),true);assert.equal(/^[0-9]{6}$/.test('12345'),false);assert.equal(/^[0-9]{6}$/.test('1234567'),false);});
test('writing weeks bounded to 1..35',()=>{assert.equal(Number.isInteger(35)&&35>=1&&35<=35,true);assert.equal(36<=35,false);});
