<?php

namespace Rovexo\Configbox\Block\Adminhtml;

use Exception;
use KenedoController;
use KenedoObserver;
use KenedoPlatform;
use KRequest;
use Magento\Framework\View\Element\Template;

/**
 * Class Configbox
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Configbox extends Template
{
    public $output;

    /**
     * Override _prepareLayout()
     *
     * @return $this|Template
     * @throws Exception
     */
    // phpcs:ignore
    protected function _prepareLayout()
    {

    	$ionCubeOk = true;
		if (extension_loaded('ionCube Loader') == false) {
			$ionCubeOk = false;
		}
		else {
			if (function_exists('ioncube_loader_version')) {
				if (version_compare(ioncube_loader_version(), '10.2') == -1) {
					$ionCubeOk = false;
				}
			}
		}
		if ($ionCubeOk == false) {
			$msg = 'To run ConfigBox you need to install the PHP extension ionCube Loader (version 10.2 or higher). ';
			$msg .= 'See <a href="https://www.configbox.at/en/technical-requirements" target="_blank">technical requirements</a> with instructions.';
			$this->output = $msg;
			return $this;
		}

        // Figure out which task of which controller to execute from the request
        $component = KRequest::getKeyword('option', 'com_configbox');
        $controllerName = KRequest::getKeyword('controller', '');
        $viewName = KRequest::getKeyword('view', '');
        $task = KRequest::getKeyword('task', 'display');

        if ($controllerName || $viewName) {
            $className = KenedoController::getControllerClass(
                $component,
                $controllerName,
                $viewName
            );
            $controller = KenedoController::getController($className);

            // Start a new output buffer
            ob_start();

            // Execute the task
            $controller->execute($task);

            // Get the output so far in a variable
            $output = ob_get_clean();

            // Redirect if a task handler has set a redirectUrl
            if ($controller->redirectUrl) {
                $controller->redirect();
            } else {
                // Send output through observers
                KenedoObserver::triggerEvent('onBeforeRender', array(&$output));

                // Render the output
                ob_start();
                KenedoPlatform::p()->renderOutput($output);
                $this->output = ob_get_clean();

                // Restore error handler to give the platform a normal environment
                KenedoPlatform::p()->restoreErrorHandler();
				KenedoPlatform::p()->restoreExceptionHandler();

            }
        }

        return $this;
    }

    /**
     * Override _toHtml()
     *
     * @return string
     */
    // phpcs:ignore
    protected function _toHtml()
    {
        return $this->output;
    }
}
