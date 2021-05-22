var assert = require('assert');
var systemJS = require('../wwwroot/lib/systemjs/system.js');

System.set(System.normalizeSync('lib/localforage/localforage.min.js'), System.newModule({
  createInstance() {
    return {
      getItem: function (link) {
        return new Promise(function (resolve) { resolve(link); });
      }
    };
  }
}));

describe('clientStorage', function () {
  it('should return text when getPostText is called', function (done) {

    var clientStorage = systemJS.import('wwwroot/js/clientStorage.js').then(function (clientStorage) {

      clientStorage.getPostText('hello').then(function (text) {
        assert.equal(text, '#hello');
      }).catch(function(err){
          done(err);
      });

      done();
    });
  });
});
