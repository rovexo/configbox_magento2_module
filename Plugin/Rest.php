<?php

namespace Rovexo\Configbox\Plugin;

use Magento\Framework\App\RequestInterface;
use Magento\Webapi\Controller\Rest as CoreRest;
use Rovexo_Configbox_KenedoLoader as KenedoLoader;

/**
 * Class Rest
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Rest
{
    /**
     * Plugin before dispatch
     *
     * @param CoreRest         $subject CoreRest object
     * @param RequestInterface $request Request object
     *
     * @return void
     */
    public function beforeDispatch(
        CoreRest $subject,
        RequestInterface $request
    ) {
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
    }
}
