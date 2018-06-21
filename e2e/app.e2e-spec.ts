import { SIPAEFrontUpgradePage } from './app.po';

describe('sipaefront-upgrade App', function() {
  let page: SIPAEFrontUpgradePage;

  beforeEach(() => {
    page = new SIPAEFrontUpgradePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
