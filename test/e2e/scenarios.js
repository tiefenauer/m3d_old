describe('m3d web app', function() {

  beforeEach(function(){
    browser.get('http://localhost:9000');
  });

  // general stuff
  it('should have a title', function() {    
    expect(browser.getTitle()).toEqual('M3D');
  });

  it('should suggest some places', function(){
    element(by.id('pac-input')).sendKeys('Baden');
    element(by.id('searchBtn')).click();
  });


});