<?php
/**
 * @file
 */

use Drupal\Core\Form\FormStateInterface;

/**
 * Implements hook_form_system_theme_settings_alter().
 * Add setting to convert labels to placeholders.
 */
function louie_form_system_theme_settings_alter(&$form, FormStateInterface $form_state) {
  // Work-around for a core bug affecting admin themes. See issue #943212.
  if (isset($form_id)) {
    return;
  }

  $form['theme_ui']['louie_use_placeholders'] = array(
    '#type' => 'checkbox',
    '#title' => t('Change form labels to placeholder attributes.'),
    '#description' => t('This hide all the traditional labels on the form elements, and use placeholder attributes instead.'),
    '#default_value' => theme_get_setting('louie_use_placeholders'),
  );
}
