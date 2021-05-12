<?php
/** @noinspection DuplicatedCode */

namespace Rovexo\Configbox\Controller\Index;

use Exception;
use KenedoController;
use KenedoObserver;
use KenedoPlatform;
use KRequest;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Controller\ResultInterface;

/**
 * Class Index
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Index extends Action
{

    /**
     * The main execute() method
     *
     * @return ResponseInterface|ResultInterface|void
     */
    public function execute()
    {
        // Set all GET/POST parameters again - ungodly stuff, but hey!
        $params = $this->getRequest()->getParams();
        foreach ($params as $key => $value) {
            KRequest::setVar($key, $value);
        }

        // Set a default controller in case no controller or view is requested
        if (KRequest::getVar('controller') == '') {
            KRequest::setVar('controller', 'admindashboard');
        }

		$outputMode = KenedoPlatform::p()->getOutputMode();

		if ($outputMode == 'view_only' || $outputMode == 'in_html_doc') {
			KenedoPlatform::p()->echoOutput($this->getOutput());
		} else {
			$this->_view->loadLayout();
			$this->_view->renderLayout();
		}
		return;

    }

    /**
     * Get output from CB library
     *
     * @return false|string
     * @throws Exception
     */
    protected function getOutput()
    {
        // Figure out which task of which controller to execute from request
        $component = KRequest::getKeyword('option', 'com_configbox');
        $controllerName = KRequest::getKeyword('controller', '');
        $viewName = KRequest::getKeyword('view', '');
        $task = KRequest::getKeyword('task', 'display');

        $output = "";

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
                $output = ob_get_clean();

                // Restore error handler to give the platform a normal environment
                KenedoPlatform::p()->restoreErrorHandler();
				KenedoPlatform::p()->restoreExceptionHandler();
            }
        }

        return $output;
    }
}
