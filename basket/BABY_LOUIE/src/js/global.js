/**
 * @file
 * Run JS that is used globally on site.
 */

import jQuery from 'jquery';

export default (function globalSite($, Drupal) {
  /**
   * The Drupal JS coding standards require strict mode, but
   * because we are using es6 import statements in app.js,
   * strict mode is implied.
   */

  /**
   * Instantiate globalSite and run it through Drupal attachment.
   */
  Drupal.behaviors.globalSite = {
    attach(context, settings) {
      $(context).find('body').each(() => {
        // Do stuff
      });
    }
  };
}(jQuery, Drupal));
