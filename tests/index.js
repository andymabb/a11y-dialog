/* global casper */

var modalID = 'my-accessible-modal';

casper.test.begin('Modal test suite', 34, function (test) {

  function testAriaHidden (isModalOpen) {
    test.assertExist('#main[aria-hidden="' + isModalOpen + '"]', 'Main element has `aria-hidden="' + isModalOpen + '"`');
    test.assertDoesntExist('#main[aria-hidden="' + !isModalOpen + '"]', 'Main element has `aria-hidden="' + !isModalOpen + '"`');
    test.assertExist('#' + modalID + '[aria-hidden="' + !isModalOpen + '"]', 'Modal element has `aria-hidden="' + !isModalOpen + '"`');
    test.assertDoesntExist('#' + modalID + '[aria-hidden="' + isModalOpen + '"]', 'Modal element has `aria-hidden="' + isModalOpen + '"`');
  }

  casper.start('http://edenspiekermann.github.io/accessible-modal-dialog/', function () {
    this.page.onConsoleMessage = function (msg, lineNum, sourceId) {
      console.log('CONSOLE: ' + msg);
    };

    this.page.injectJs('./accessible-modal-dialog.js');
    this.page.evaluateJavaScript('function () { window.m = new window.Modal(document.getElementById("' + modalID + '")); }');
    this.emit('page.loaded');
  });

  casper.on('page.loaded', function () {
    var modal = '#' + modalID;
    var opener = '[data-modal-show="' + modalID + '"]';
    var closer = modal + ' [data-modal-hide]';
    var overlay = modal + ' > .modal-overlay';

    this.then(function () {
      this.echo('\nTest Modal shape');
      test.assertEvalEquals(function () { return typeof window.Modal; }, 'function', 'Modal constructor is being defined');
      test.assertEvalEquals(function () { return typeof m.hide; }, 'function', 'Modal instance has a `hide` method');
      test.assertEvalEquals(function () { return typeof m.show; }, 'function', 'Modal instance has a `show` method');
    });

    this.then(function () {
      this.echo('\nTest initial setup');
      test.assertExist(modal, 'Modal element exists in the DOM');
      test.assertExist(opener, 'Modal opener element exists in the DOM');
      test.assertNotVisible(modal, 'Modal is hidden by default');
      testAriaHidden(false);
    });

    this.then(function () {
      this.echo('\nTest modal opening');
      this.click(opener);
      testAriaHidden(true);
    });

    this.then(function () {
      this.echo('\nTest modal closing through overlay');
      this.click(overlay);
      testAriaHidden(false);
    });

    this.then(function () {
      this.echo('\nTest modal closing through closer');
      this.click(opener);
      this.click(closer);
      testAriaHidden(false);
    });

    this.then(function () {
      this.echo('\nTest modal closing through ESCAPE key');
      this.click(opener);
      this.page.sendEvent('keypress', this.page.event.key.Escape, null, null, 0);
      testAriaHidden(false);
    });

    this.then(function () {
      this.echo('\nTest modal opening through JS API');
      this.page.evaluateJavaScript('function () { window.m.show(); }');
      testAriaHidden(true);
    });

    this.then(function () {
      this.echo('\nTest modal closing through JS API');
      this.page.evaluateJavaScript('function () { window.m.hide(); }');
      testAriaHidden(false);
    });
  });

  casper.run(function () {
    this.test.done();
    this.exit();
  });

});
