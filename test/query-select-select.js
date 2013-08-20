var Query  = require('../lib/query');
var seed   = require('./fixtures/seed');
var expect = require('chai').expect;
var _      = require('lodash');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('select', function () {
		
		var query;

		beforeEach(function () {
			query = new Query(db.model('User'), { useAlias: true });
		});

		it('should set only the name select', function () {
			query.select('name');
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should set only the name select with object', function () {
			query.select({ name: 1 });
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should only remove email select', function () {
			query.select('-email');
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').be.ok;
		});

		it('should only remove email select with object', function () {
			query.select({ email: 0 });
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').be.ok;
		});

		it('should set only name and the remove email select', function () {
			query.select('name -email');
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should set only name and the remove email select with object', function () {
			query.select({ name: 1, email: 0 });
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').not.be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should set name and email with select and remove', function () {
			query.select({ name: 1, email: 0 }).select('email');
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').be.ok;
			expect(selects.__parent__).to.have.property('email').be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should set only email with select and remove', function () {
			query.select('name').select('-name email');
			var selects = query.data.selects;
			expect(selects.__parent__).to.have.property('name').not.be.ok;
			expect(selects.__parent__).to.have.property('email').be.ok;
			expect(selects.__parent__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__parent__).to.have.property('best_friend_id').not.be.ok;
		});

		it('should set only email with select and remove for aliases', function () {
			var selects = query.data.selects;
			selects.__bestFriend__ = _.cloneDeep(selects.__parent__);
			query.select('__bestFriend__','name').select('__bestFriend__','-name email');
			expect(selects.__bestFriend__).to.have.property('name').not.be.ok;
			expect(selects.__bestFriend__).to.have.property('email').be.ok;
			expect(selects.__bestFriend__).to.have.property('causes_sponsors_id').not.be.ok;
			expect(selects.__bestFriend__).to.have.property('best_friend_id').not.be.ok;
		});

  });
});
