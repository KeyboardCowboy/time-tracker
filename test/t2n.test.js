#!/usr/local/bin/node

const assert = require('assert');
const Timeular2Noko = require('../src/Timeular2Noko');
const config = require('./sample-config');

const T2N = new Timeular2Noko(config);

describe('T2N Note Filter', () => {
    it('should leave normal strings alone', () => {
        assert.deepStrictEqual(T2N.filterNotes(['this is a good entry']), ['this is a good entry'], 'Good entry was mutilated.');
    });

    it('should trim off spaces and commas from the ends of good strings', () => {
        assert.deepStrictEqual(T2N.filterNotes([' , oops, there was an erroneous comma at the beginning and end, ']), ['oops, there was an erroneous comma at the beginning and end'], 'Good string not properly cleaned up.');
    });

    it('should run the cleanup then remove dupes', () => {
        assert.deepStrictEqual(T2N.filterNotes(
            [
                ' , oops, there was an erroneous comma at the beginning and end, ',
                'oops, there was an erroneous comma at the beginning and end'
            ]
        ), ['oops, there was an erroneous comma at the beginning and end'], 'Cleanup operation in wrong spot.');
    });

    it('should remove entries that are only spaces and commas', () => {
        assert.deepStrictEqual(T2N.filterNotes(['  ']), [], "Erroneous space not properly removed.");
        assert.deepStrictEqual(T2N.filterNotes([',  ']), [], "Trailing spaces and commas should be removed.");
        assert.deepStrictEqual(T2N.filterNotes(['  ,']), [], "Preceding spaces and commas should be removed.");
        assert.deepStrictEqual(T2N.filterNotes(['  ,  ']), [], "All bounding spaces and commas should be removed.");
    });

    it('should remove duplicate values', () => {
        assert.deepStrictEqual(T2N.filterNotes(['a','b','c','b']), ['a','b','c'], 'Duplicate value not removed.');
    });

    it('should replace spaces with hyphens in tags', () => {
        assert.deepStrictEqual(T2N.filterNotes(['#this is a tag']), ['#this-is-a-tag'], 'Tags should not contain spaces.');
        assert.deepStrictEqual(T2N.filterNotes(['#this    is   a    tag']), ['#this-is-a-tag'], 'Multiple spaces should be single hyphens.');
    });
});

describe('Project ID Validator', () => {
    it('should return only unique project ids', () => {
        const projIds = T2N.getAllProjectIds();
        assert.strictEqual(projIds.length, 4);
    });
});