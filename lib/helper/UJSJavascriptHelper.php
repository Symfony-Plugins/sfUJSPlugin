<?php

use_helper('UJS');

function link_to_function($name, $script, $html_options = array())
{
  return UJS_link_to_function($name, $script, $html_options);
}

function button_to_function($name, $script, $html_options = array())
{
  return UJS_button_to_function($name, $script, $html_options);
}

/**
 * Inserts a link triggering a remote action and updating content accordingly,
 * unobtrusively
 *
 * <b>Example:</b>
 * <code>
 *  <?php echo link_to_remote('click me', array(
 *    'update' => 'emails',
 *    'url'    => '@list_emails'
 *  ), array(
 *    'class' => 'bar'
 *  )) ?>
 * </code>
 *
 * @param string The text displayed in the link
 * @param array Ajax parameters (see _UJS_remote_function for details)
 * @param array the <a> element attributes
 *
 * @return string An invisible HTML placeholder 
 */
function link_to_remote($name, $options = array(), $html_options = array())
{
  if(isset($options['update']))
  {
    $options['update'] = '#'.$options['update']; 
  }
  return UJS_link_to_function($name, _UJS_remote_function($options), $html_options);
}

/**
 * Inserts a button triggering a remote action and updating content accordingly,
 * unobtrusively
 *
 * <b>Example:</b>
 * <code>
 *  <?php echo button_to_remote('click me', array(
 *    'update' => 'emails',
 *    'url'    => '@list_emails'
 *  ), array(
 *    'class' => 'bar'
 *  )) ?>
 * </code>
 *
 * @param string The text displayed in the button
 * @param array Ajax parameters (see _UJS_remote_function for details)
 * @param array the <input> element attributes
 *
 * @return string An invisible HTML placeholder 
 */
function UJS_button_to_remote($name, $options = array(), $html_options = array())
{
  if(isset($options['update']))
  {
    $options['update'] = '#'.$options['update']; 
  }
  return UJS_button_to_function($name, _UJS_remote_function($options), $html_options);
}