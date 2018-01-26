/**
 * @file
 * Initilize Foundation.
 */

import jQuery from 'jquery';

(function ($, Drupal) {
  /**
   * Instantiate initFoundation and run it through Drupal attachment.
   */
  Drupal.behaviors.initFoundation = {
    attach(context, settings) {
      // First time through is the entire document.
      $(context).foundation();
    },
  };
}(jQuery, Drupal));
