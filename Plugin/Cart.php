<?php

namespace Rovexo\Configbox\Plugin;

use Magento\Checkout\Controller\Cart as CoreCart;
use Magento\Framework\App\RequestInterface;
use Rovexo_Configbox_KenedoLoader as KenedoLoader;

/**
 * Class Cart
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Cart
{
    /**
     * Plugin before dispatch
     *
     * @param CoreCart         $subject CoreCart object
     * @param RequestInterface $request Request object
     *
     * @return void
     */
    public function beforeDispatch(
        CoreCart $subject,
        RequestInterface $request
    ) {
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
    }
}
