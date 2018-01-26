/**
 * @file
 * Run JS that is used globally on site.
 */

import jQuery from 'jquery';

(function ($, Drupal) {
  // 'use strict';

  /**
   * Instantiate globalSite and run it through Drupal attachment.
   */
  Drupal.behaviors.globalSite = {
    attach(context, settings) {
      $(context).find('body').each(() => {
        // Do stuff
      });
    },
  };
}(jQuery, Drupal));
