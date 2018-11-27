const assert = require('chai').assert,
    http = require('http'),
    rest = require('restler');

suite('API tests', function () {
    let attraction = {
        lat: 45.516001,
        lng: -122.682063,
        name: 'Portland Art Museum',
        description: 'Founded in 1892, the Portland Art Museum\'s collection ' +
            'of native art is not to be missed. if modern art is more to your ' +
            'liking, there are six stories of modern art for your enjoyment.',
        email: 'test@meadowlarktravel.com'
    };
    let base = 'http://localhost:3000';
    test('should be able to add an attraction', function (done) {
        rest.post(base + '/api/attraction', {data: attraction}).on('success', function (data) {
            assert.match('data.id', /\w/, 'id must be set');
            done();
        });
    });

    test('should be able to retrieve an attraction', function (done) {
        rest.post(base + '/api/attraction', {data: attraction}).on('success', function (data) {
            rest.get(base + '/api/attraction/' + data.id).on('success', function (data) {
                assert(data.name === attraction.name);
                assert(data.description === attraction.description);
                done();
            });
        });
    });
});