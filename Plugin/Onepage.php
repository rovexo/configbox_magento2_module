<?php

namespace Rovexo\Configbox\Plugin;

use Magento\Checkout\Controller\Onepage as CoreOnepage;
use Magento\Framework\App\RequestInterface;
use Rovexo_Configbox_KenedoLoader as KenedoLoader;

/**
 * Class Onepage
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Onepage
{
    /**
     * Plugin before dispatch
     *
     * @param CoreOnepage      $subject CoreOnepage object
     * @param RequestInterface $request Request object
     *
     * @return void
     */
    public function beforeDispatch(
        CoreOnepage $subject,
        RequestInterface $request
    ) {
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
    }
}
